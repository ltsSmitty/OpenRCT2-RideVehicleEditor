import { debug } from "../utilities/logger";
import { TrackElementType } from "../utilities/trackElementType";

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

export const getBuildableSegments = (initialTrackELement: TrackElementType, direction: "next" | "previous", allElementsAvailableForRide?: TrackElementType[]): TrackElementType[] => {
    const elements = allElementsAvailableForRide || context.getAllTrackSegments().map(x => x.type);

    debug(`getting buildable segments for ${TrackElementType[initialTrackELement || 0]} in direction ${direction}`);
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
}
