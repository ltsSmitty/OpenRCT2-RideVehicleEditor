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

export const getAvailableTrackSegmentsForRideType = (rideType: RideType): AvailableTrackSegmentTypes => {
    // todo actually implement this
    // const buildableSegments = context.getBuildableSegmentsForRideType(rideType); // sadly this doesn't exist
    const buildableSegments = context.getAllTrackSegments().map(x => x.type);
    return {
        enabled: buildableSegments,
        extra: [],
        covered: [],
    };
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
