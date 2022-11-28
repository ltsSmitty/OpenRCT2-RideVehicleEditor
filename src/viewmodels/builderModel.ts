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

    buildOrRemove(segmentToRemove, "remove", ghost, normalizeZDirection || "next", callback);
};

// /**
//  * Removes a proceeding/preceding segment from the given segment
//  * @param selectedSegment the selected segment
//  * @param direction whether building in next or previous direction
//  * @param type whether the segment to remove is a ghost or real segment
//  * @param callback callback function for debugging purposes
//  * @returns the GameActionResult from the build and the actual build location after the coords have been adjusted
//  */
// export const removeTrackAtFollowingPosition = (selectedSegment: Segment, direction: "next" | "previous", type: "real" | "ghost", callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void): void => {
//     // get the next position from selectedSegment
//     let location: CoordsXYZD | null;
//     debug(`direction: ${direction}`);
//     debug(`selctedSegment nextLocation and previousLocation: ${JSON.stringify(selectedSegment.nextLocation())}, ${JSON.stringify(selectedSegment.previousLocation())}`);

//     (direction == "next") ? location = selectedSegment.nextLocation() : location = selectedSegment.previousLocation();
//     if (location == null) {
//         debug(`Unable to remove track: segment unable to discern ${direction} location`);
//         return;
//     }
//     debug(`location: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);

//     const elementToRemove = finder.getSpecificTrackElement(selectedSegment.get().ride, location);
//     buildOrRemove(elementToRemove, "remove", type, false, (result) => {
//         if (callback) callback(result);
//     });
// };

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

// export const buildTrackAtFollowingPosition = (
//     selectedSegment: Segment,
//     direction: "next" | "previous",
//     trackToBuild: TrackElementType,
//     type: "real" | "ghost",
//     callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)): void => {

//     let location: CoordsXYZD | null;
//     (direction == "next") ? location = selectedSegment.nextLocation() : location = selectedSegment.previousLocation();
//     if (location == null) {
//         debug(`Unable to remove track: no ${direction} location`);
//         return;
//     }
//     if (direction == "previous") {
//         debug(`initial direction before rotating: ${location.direction}`);
//         location.direction = selectedSegment.get().location.direction;
//     }
//     debug(`location to build next piece: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);

//     const segmentToBuild = new Segment({
//         location: location,
//         ride: selectedSegment.get().ride,
//         trackType: trackToBuild,
//         rideType: selectedSegment.get().rideType
//     });
//     // todo need to pass in this because it might be different than the selectedSegment's rideType

//     buildOrRemove(segmentToBuild, "build", type, direction, (result) => {

//         const response = {
//             result: result.result,
//             newlyBuiltSegment: new Segment({
//                 location: result.actualBuildLocation,
//                 ride: selectedSegment.get().ride,
//                 trackType: trackToBuild,
//                 rideType: selectedSegment.get().rideType
//             })
//         };
//         if (callback) callback(response);
//     });
// };

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
export const getBuildOptionsForSegment = (segment: Segment, allPossibleOptions: TrackElementType[]): { next: TrackElementType[], previous: TrackElementType[] } => {
    let next: TrackElementType[] = [];
    let previous: TrackElementType[] = [];

    const seg = segment.get();
    debug(`Getting build options for segment ${TrackElementType[seg.trackType]} at ${JSON.stringify(seg.location)}.`);

    // get forward potential builds
    const nextLocation = segment.nextLocation(); // for some reason needing to create a copy of it so that location won't suspect a potential null value
    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "next");
        next = buildableTrackTypes;
    }

    // get backward potential builds.
    const backLocation = segment.previousLocation();
    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "previous");
        previous = buildableTrackTypes;
    }

    return { next, previous };
}
