import { SegmentModel } from './../viewmodels/segmentModel';
import { BuildWindowButton } from './../services/buttonActions/buttonTypes';
import { RideType } from "../utilities/rideType";
import { TrackElementType } from "../utilities/trackElementType";
import { Segment } from "./segment";
import { Store } from 'openrct2-flexui';
import * as buttonMap from '../services/buttonToTrackElementMap';
import { getBuildableSegments, filterForDiagonalSegments } from '../services/segmentValidator';
import { debug } from '../utilities/logger';

/**
* The lists of {@link TrackSegment} types which a ride is able to build.
Includes standard segments, extras (which are technically drawable for the track type), and covered versions.
*/
export type AvailableTrackSegmentTypes = {
    /**
     * Segments that are drawable and appropriate for the ride type, (e.g. Monorail can build the Flat track segment).
     */
    enabled: TrackElementType[],
    /**
     * Segments that this ride type _can_ draw, but which are disabled because their vehicles lack the relevant sprites,
     * or because they are not realistic for the ride type (e.g. LIM boosters in Mini Roller Coasters).
     */
    extra: TrackElementType[],
    /**
     * Segments that are covered variants of standard segments.
     */
    covered: TrackElementType[],
};

export class TrackTypeSelector {

    private _rideType: RideType | null;
    private _buttonsPushed: (BuildWindowButton | null)[];
    private _trackConstructionMode: "enabled" | "extra" = "enabled";
    private _segmentsAvailableForRideType: AvailableTrackSegmentTypes;
    private _referenceModel: SegmentModel;
    private _referenceSegment: Segment | null;
    private _selectedTrackType: TrackElementType | null;
    private _buildDirectionStore: Store<"next" | "previous" | null>;


    constructor(referenceModel: SegmentModel) {
        this._referenceModel = referenceModel; // needed for updating the selectedBuild store
        this._referenceSegment = referenceModel.selectedSegment.get();
        this._buildDirectionStore = referenceModel.buildDirection;
        this._rideType = this._referenceSegment?.get().rideType ?? null;
        this._buttonsPushed = [];
        this._segmentsAvailableForRideType = getAvailableTrackSegmentsForRideType(this._rideType);
        this._selectedTrackType = null;

        this.recalculate("constructor");

        // subscribe to the build direction store
        this._buildDirectionStore.subscribe((direction) => {
            debug(`buildDirection changed to ${direction}`);
            this.recalculate("buildDirection");
        });
    }

    updateRideType(rideType: RideType) {
        debug(`rideType changed to ${rideType}`);
        this._rideType = rideType;
        this._segmentsAvailableForRideType = getAvailableTrackSegmentsForRideType(this._rideType);
        this.recalculate("rideType");
    }

    updateButtonsPushed(buttonsPushed: (BuildWindowButton | null)[]) {
        debug(`buttonsPushed changed to ${buttonsPushed}`);
        this._buttonsPushed = buttonsPushed;
        this.recalculate("buttonPushed");
    }

    updateTrackConstructionMode(trackConstructionMode: "enabled" | "extra") {
        debug(`trackConstructionMode changed to ${trackConstructionMode}`);
        this._trackConstructionMode = trackConstructionMode;
        this.recalculate("constructionMode");
    }

    updateReferenceSegment(referenceSegment: Segment) {
        debug(`referenceSegment changed to a segment of type ${referenceSegment.get().rideType}`);
        this._referenceSegment = referenceSegment;
        this.updateRideType(referenceSegment.get().rideType);
    }

    /**
     *
     * @returns Recalculates the selected track type based on the current state of the build window buttons & selected segment.
     */
    private recalculate(justChanged: "constructor" | "buildDirection" | "rideType" | "buttonPushed" | "constructionMode"): void {
        debug(`Recalculating selected track type: `);
        debug(`justChanged: ${justChanged}`);
        const model = this._referenceModel;
        const build = model.selectedBuild.get();

        //print the values in build, including nulls
        debug(`build props: ${JSON.stringify(build, (k, v) => v === null ? "null" : v)}`);
        this._referenceSegment = this._referenceModel.selectedSegment.get();
        //  guard
        if (this._referenceSegment === null) {
            this._selectedTrackType = null;
            this._referenceModel.updateSelectedBuild("trackType", null);
            debug(`no reference segment, returning null`);
            return;
        }

        const validElementsFromButtons = buttonMap.getElementsFromGivenButtons(this._buttonsPushed); // the possible types from the buttons
        const validElementsFromRide = this._segmentsAvailableForRideType; // the possible types from the rideType

        // need to figure out which of those are the same
        const validElements = validElementsFromButtons.filter((element) => {
            const enabledElements = [...validElementsFromRide.enabled, ...validElementsFromRide.covered];
            const extraElements = [...enabledElements, ...validElementsFromRide.extra];
            if (this._trackConstructionMode === "enabled") {

                return enabledElements.indexOf(Number(element)) !== -1;
            } else {
                return extraElements.indexOf(Number(element)) !== -1;
            }
        });

        // check compatability again the reference segment
        const finalElements = getBuildableSegments(this._referenceSegment?.get().trackType, validElements, this._buildDirectionStore.get() ?? "next");
        debug(`finalElements: ${finalElements}
        `);

        // // check compatability by diagonal
        // let filteredByDiagonals = finalElements;
        // if (finalElements.length > 1) {
        //     debug(`more than one matching element, filtering by diagonal`);
        //     filteredByDiagonals = filterForDiagonalSegments(finalElements, this._referenceSegment);
        //     debug(`filteredByDiagonals: ${filteredByDiagonals}`);
        // }
        // debug(`Setting selectedBuild trackType to ${TrackElementType[filteredByDiagonals[0]]}`);
        // need to check if the reference segment is diagonal to filter through these

        this._selectedTrackType = finalElements[0];
        this._referenceModel.updateSelectedBuild("trackType", finalElements[0] ?? []);

    }
}

export const getAvailableTrackSegmentsForRideType = (rideType: RideType | null): AvailableTrackSegmentTypes => {
    // todo actually implement this
    // const buildableSegments = context.getBuildableSegmentsForRideType(rideType); // sadly this doesn't exist
    const buildableSegments = context.getAllTrackSegments().map(x => x.type);
    return {
        enabled: buildableSegments,
        extra: [],
        covered: [],
    };
};

