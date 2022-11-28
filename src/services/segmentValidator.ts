import { debug } from "../utilities/logger";
import { TrackElementType } from "../utilities/trackElementType";

/**
 * Use to compare a first and second TrackElementTypeto see if they are compatible.
 * To go in the previous direction, just swap which is first and which is second.
 */
const areSegmentsCompatible = (initialTrackElement: TrackElementType, finalTrackElement: TrackElementType): boolean => {
    const initial = context.getTrackSegment(Number(initialTrackElement));
    const final = context.getTrackSegment(Number(finalTrackElement));
    const slopesMatch = initial?.endSlope == final?.beginSlope;
    const banksMatch = initial?.endBank == final?.beginBank;
    const turnsMatch = initial?.turnDirection == final?.turnDirection;

    return (slopesMatch && banksMatch && turnsMatch);
};

export const getBuildableSegments = (
    initialTrackELement: TrackElementType,
    trackElementOptions: TrackElementType[],
    direction: "next" | "previous"): TrackElementType[] => {

    debug(`getting buildable segments for ${TrackElementType[initialTrackELement]} in direction ${direction}`);

    // swap the order of elements depending on next vs previous
    if (direction == "next") {
        const buildableSegments = trackElementOptions.filter(el =>
            areSegmentsCompatible(initialTrackELement, el));
        return buildableSegments;
    }
    if (direction == "previous") {
        const buildableSegments = trackElementOptions.filter(el =>
            areSegmentsCompatible(el, initialTrackELement));
        return buildableSegments;
    }
    return [];
};
