import { getBuildableSegments } from './../services/segmentValidator';
import { getAvailableTrackElementTypes } from "../services/TrackTypeValidator";
import { BuildStateController } from "./CoreControllers/BuildStateController";
import { ButtonStateController } from "./CoreControllers/ButtonStateController";
import { DrawableSegmentBuildRule, SegmentSequence } from "./CoreControllers/SegmentSequenceController";
import { TrackTypeSelector } from "./trackTypeSelector";


export class GlobalConstructionController {
    /**
 * Globally need available
 * * build direction (next vs previous)
 * * the build state (rideType, ride, trackElementType, initial & computed locations)
 * * the button state
 * * the construction mode
 * * first/last element of segment sequence (aka selected segment)
 *  *   compute the buildable segments based on the rideType, the construction mode, and preceding segment
* * the build tool
 */

    buildDirection: "next" | "previous" | null;
    buildState: BuildStateController;
    buttonState: ButtonStateController; // create with `this` in the constructor
    segmentSequence: SegmentSequence;
    drawableSegmentBuildRule: DrawableSegmentBuildRule;
    buildableSegments: TrackElementType[]; // compute this based on the drawableSegmentBuildRule, the rideType, and the preceding segment

    // how am i going to do the track element validating
}

/**
 *
 * @param globalController
 */
const getValidTrackElements = (globalController: GlobalConstructionController): TrackElementType[] | null => {
    const { buildDirection, buildState, buttonState, segmentSequence } = globalController;

    if (segmentSequence.)

        const { rideType, trackElementType, initialLocation, computedLocation } = buildState;

    // get all the valid track
    const validElementsForRideType = getAvailableTrackElementTypes(rideType);
    const trackTypeSelector = new TrackTypeSelector(globalController);

};
