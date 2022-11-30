import { Segment, SegmentDescriptor } from './../objects/segment';
import { TrackElementProps } from './../services/rideBuilder';
import { makeBuildInstructions } from '../objects/makeBuildInstructions';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug } from '../utilities/logger';
import { getBuildableSegments } from '../services/segmentValidator';
import { TrackElementType } from '../utilities/trackElementType';


/**
 * Remove a given ghost Segment
 * @param segmentToRemove the segment to remove
 * @param ghost whether it's a real or ghost segment
 * @param direction The build direction of the segment to remove
 * @param callback
 */
export const removeSegment = (
    segmentToRemove: Segment,
    ghost: "real" | "ghost",
    normalizeZDirection: "next" | "previous" | null,
    callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {

    debug(`normalizeZdirection: ${normalizeZDirection}`);
    buildOrRemove(segmentToRemove, "remove", ghost, normalizeZDirection ?? "next", callback);
};

/**
 * Build the selectedBuild proceeding/preceding segment from the given segment
 * @param segToBuild the build details
 * @param direction  whether building in next or previous direction, used for normalizing z values during construction
 * @param callback  callback function for debugging purposes
 * @returns the GameActionResult from the build and the actual build location after the coords have been adjusted
 */
export const buildSegment = (
    segToBuild: SegmentDescriptor | Segment,
    direction: "next" | "previous",
    ghost: "real" | "ghost",
    callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)): void => {

    let segmentToBuild: Segment;
    ("get" in segToBuild) ? segmentToBuild = segToBuild : segmentToBuild = new Segment(segToBuild);

    buildOrRemove(segmentToBuild, "build", ghost, direction, (result) => {
        const response = {
            result: result.result,
            newlyBuiltSegment: new Segment({
                location: result.actualBuildLocation,
                ride: segmentToBuild.get().ride,
                trackType: segmentToBuild.get().trackType,
                rideType: segmentToBuild.get().rideType
            })
        };
        if (callback) callback(response);
    });
};


const buildOrRemove = (
    segmentToBuild: Segment,
    action: "build" | "remove",
    type: "real" | "ghost",
    normalizeZDirection: "next" | "previous" | false,
    callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {

    const buildInstructions = makeBuildInstructions(segmentToBuild.get(), type); // apply in the build flags
    buildOrRemoveTrackElement(<TrackElementProps>buildInstructions[action], action, normalizeZDirection, (result) => {
        if (callback) callback(result);
    });
};

/**
 * Get the TrackElementTypes that are valid to build before/after the given segment.
 * @param segment the segment to build before/after
 * @param allPossibleOptions all the possible TrackElementTypes to filter through
 * @returns an object with TrackElementTypes for the next and previous directions
 */
export const getBuildOptionsForSegment = ({ segment, tiAtSegment, allPossibleOptions }: { segment: Segment, tiAtSegment: TrackIterator, allPossibleOptions: TrackElementType[] }): { next: TrackElementType[], previous: TrackElementType[] } => {
    let next: TrackElementType[] = [];
    let previous: TrackElementType[] = [];

    const seg = segment.get();
    debug(`Getting build options for segment ${TrackElementType[seg.trackType]} at ${JSON.stringify(seg.location)}.`);
    debug(`Sorting through ${allPossibleOptions.length} possible options.`);

    // get forward potential builds
    const nextLocation = tiAtSegment.nextPosition;
    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "next");
        next = buildableTrackTypes;
    }

    // get backward potential builds.
    const backLocation = tiAtSegment.previousPosition;
    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "previous");
        previous = buildableTrackTypes;
    }

    return { next, previous };
}
