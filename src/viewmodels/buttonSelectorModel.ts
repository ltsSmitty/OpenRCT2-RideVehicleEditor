import { FavoriteRide } from './../objects/FavoriteRide';
import { getAvailableTrackSegmentsForRideType, AvailableTrackSegmentTypes } from '../objects/trackTypeSelector';
import { store, arrayStore } from 'openrct2-flexui';
import { Segment } from '../objects/segment';
import { debug } from '../utilities/logger';
import { RideType } from '../utilities/rideType';
import { CurveButton, BankButton, PitchButton, SpecialButton, MiscButton, DetailButton, SelectionControlButton, BuildWindowButton, } from './../services/buttonActions/buttonTypes';
import { SegmentModel } from './segmentModel';

export class ButtonSelectorModel {

    readonly selectedCurve = store<CurveButton | null>("noCurve");
    readonly selectedBank = store<BankButton | null>("noBank");
    readonly selectedPitch = store<PitchButton | null>("noPitch");
    readonly selectedDetail = store<DetailButton | null>(null);
    readonly selectedMisc = store<MiscButton | null>(null);
    readonly selectedSpecial = store<SpecialButton | null>(null);
    readonly selectedControl = store<SelectionControlButton | null>(null);
    readonly allSelectedButtons = arrayStore<BuildWindowButton>([]);
    readonly model: SegmentModel;
    readonly allAvailableTrackedRides = arrayStore<RideType>(getAvailableTrackedRideTypes());

    /**
     * Should a ride be able to draw standard segments or any possible drawable segment.
     * Refers to the options in {@link AvailableTrackSegmentTypes}
     */
    readonly trackConstructionMode: "enabled" | "extra" = "enabled";

    /**
     * Stores the selected ride type and 3 favorite ride types from the window. The available track segements are memoized in the array.
     */
    readonly favoriteRides = arrayStore<FavoriteRide>([]);

    /**
     * Store the current active ride type
     */
    readonly selectedFavoriteIndex = store<number | null>(null);

    // Track whether the selector is picking a segment or not
    readonly isPicking = store<boolean>(false);

    constructor(model: SegmentModel) {
        this.model = model;

        // subscribe to selectedSegment changes to update the selected buttons
        this.model.selectedSegment.subscribe((segment) => { this.onSegmentChange(segment); });
    }

    // use this function to do reset all the buttons.
    private onSegmentChange(newSegment: Segment | null) {
        debug(`onSegmentChange, about to set the ride type to ${newSegment?.get().rideType ?? null}`);
        const newRideType = newSegment?.get().rideType ?? 999;
        this.favoriteRides.update(0, new FavoriteRide(newRideType));
    }

    /**
     * Update the rideTypeFavorites array with the new ride type's available track segments.
     * @param rideType the new ride type
     * @param index which favorite to update
     */
    updateRideTypeFavorite(rideType: RideType, index: number): void {
        // get all the possible track types for this ride type
        // then update the buildableTrackTypes array
        this.favoriteRides.update(index, new FavoriteRide(rideType));
    }

    /**
     * When the button is selected to build with a different rideType
    */
    updateSelectedRideType(index: number): void {
        const newRideType = this.favoriteRides.get()[index].rideType;
        if (newRideType) {
            this.model.trackTypeSelector.updateRideType(newRideType);
            return;
        }
        debug(`cant change ride type; ${newRideType} is null/undefined`);
    }
}
/**
 * Gets all available ride types that are currently loaded.
 */
const getAvailableTrackedRideTypes = (): RideType[] => {
    const trackedRides = context.getAllObjects("ride")
        .filter(r => r.carsPerFlatRide == 255) // tracked rides == 255, flatrides >= 1, shops == 0
        .map(r => r.rideType[0]);
    debug(`Bizarrely the api returns an array result for rideType, shown:
        ${JSON.stringify(trackedRides, null, 2)}`);
    //remove duplicates without using a set
    const filtered = trackedRides.filter((v, i, a) => a.indexOf(v) === i);
    // sort the array in alphabetical order
    return filtered.sort((a, b) => a - b);
};
