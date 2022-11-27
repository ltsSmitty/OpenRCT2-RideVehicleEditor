import { getAvailableTrackSegmentsForRideType, AvailableTrackSegmentTypes } from './../services/segmentValidator';
import { store, arrayStore } from 'openrct2-flexui';
import { Segment } from '../objects/segment';
import { debug } from '../utilities/logger';
import { RideType } from '../utilities/rideType';
import { CurveButton, BankButton, PitchButton, SpecialButton, MiscButton, DetailButton, SelectionControlButton, BuildWindowButton, } from './../services/buttonActions/buttonTypes';
import { SegmentModel } from './segmentModel';


type RideFavorite = {
    ride: RideType,
    availableTrackTypes: AvailableTrackSegmentTypes
};

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

    /**
     * Should a ride be able to draw standard segments or any possible drawable segment.
     * Refers to the options in {@link AvailableTrackSegmentTypes}
     */
    readonly trackConstructionMode: "enabled" | "extra" = "enabled";

    /**
     * Stores the selected ride type and 3 favorite ride types from the window. The available track segements are memoized in the array.
     */
    readonly rideTypeFavorites = arrayStore<RideFavorite | null>([null, null, null, null]);

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
        const availableTrackTypes = getAvailableTrackSegmentsForRideType(newRideType);
        this.rideTypeFavorites.update(0,
            { ride: newRideType, availableTrackTypes: availableTrackTypes });
    }

    /**
     * Update the rideTypeFavorites array with the new ride type's available track segments.
     * @param rideType the new ride type
     * @param index which favorite to update
     */
    updateRideTypeFavorite(rideType: RideType, index: number): void {
        // get all the possible track types for this ride type
        // then update the buildableTrackTypes array
        const trackTypes = getAvailableTrackSegmentsForRideType(rideType);
        const updatedFavorite: RideFavorite = {
            ride: rideType,
            availableTrackTypes: trackTypes
        }
        this.rideTypeFavorites.update(index, updatedFavorite);
    }

    /**
     * When the button is selected to build with a different rideType
    */
    updateSelectedRideType(index: number) {
        this.model.selectedRideType.set(this.rideTypeFavorites.get()[index]?.ride ?? null);
        // this.model.
    }

    /**
     *  Update the model's buildable track segment types depending on what type of ride is selected and the construction mode (enabled vs. extra)
     * @param index index of the favorite selected.
     */
    updateBuildableTrackTypes(index: number): void {
        if (index >= 0 && index < 4) {
            const trackTypes = this.rideTypeFavorites.get()[index];
            if (trackTypes) {
                if (this.trackConstructionMode === "enabled") {
                    this.model.buildableTrackTypes.set(
                        [...trackTypes.availableTrackTypes.enabled,
                        ...trackTypes.availableTrackTypes.covered]);
                } else {
                    this.model.buildableTrackTypes.set(
                        [...trackTypes.availableTrackTypes.enabled,
                        ...trackTypes.availableTrackTypes.covered,
                        ...trackTypes.availableTrackTypes.extra]);
                }
            }
        }
    }
}
