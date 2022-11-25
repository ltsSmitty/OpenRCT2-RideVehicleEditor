import { debug } from "../utilities/logger";
import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";

/**
 * Use to compare a first and second TrackElementTypeto see if they are compatible.
 * To go in the previous direction, just swap which is first and which is second.
 */
const areSegmentsCompatible = (initialTrackElement: TrackElementType, finalTrackElement: TrackElementType): boolean => {
    const initial = context.getTrackSegment(initialTrackElement);
    const final = context.getTrackSegment(finalTrackElement);
    const slopesMatch = initial?.endSlope == final?.beginSlope;
    const banksMatch = initial?.endBank == final?.beginBank;
    const turnsMatch = initial?.turnDirection == final?.turnDirection;

    return (slopesMatch && banksMatch && turnsMatch);
};

export const getBuildableSegments = (
    initialTrackELement: TrackElementType,
    rideType: RideType,
    direction: "next" | "previous"): TrackElementType[] => {

    // //todo actually use the ridetype to return something useful
    // const allElementsAvailableForRide = context.getTrackElementsForRide(rideType); // finish this stub
    const elements = context.getAllTrackSegments().map(x => x.type); // in the meantime just making all tracksegments available


    debug(`getting buildable segments for ${TrackElementType[initialTrackELement]} in direction ${direction}`);
    if (direction == "next") {
        const buildableSegments = elements.filter(el =>
            areSegmentsCompatible(initialTrackELement, el));
        return buildableSegments;
    }
    if (direction == "previous") {
        const buildableSegments = elements.filter(el =>
            areSegmentsCompatible(el, initialTrackELement));
        return buildableSegments;
    }
    return [];
};
