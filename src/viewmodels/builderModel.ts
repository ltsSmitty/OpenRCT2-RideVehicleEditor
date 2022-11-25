import { TrackElementProps } from './../services/rideBuilder';
import { Segment } from '../objects/segment';
import { makeBuildInstructions } from '../objects/makeBuildInstructions';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug, assert } from '../utilities/logger';
import { TrackElementItem } from '../services/SegmentController';
import { getBuildableSegments } from '../services/segmentValidator';
import * as finder from '../services/trackElementFinder';
import { TrackElementType } from '../utilities/trackElementType';


/**
 * Remove a given ghost Segment
 * @param segmentToRemove the ghost/preview segment to remove
 * @param direction The build direction of the segment to remove
 * @param callback
 */
export const removeThisGhostSegment = (
    segmentToRemove: Segment,
    direction: "next" | "previous" | null,
    callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {

    buildOrRemove(segmentToRemove, "remove", "ghost", direction || "next", callback);
};

/**
 * Removes a proceeding/preceding segment from the given segment
 * @param selectedSegment the selected segment
 * @param direction whether building in next or previous direction
 * @param type whether the segment to remove is a ghost or real segment
 * @param callback callback function for debugging purposes
 * @returns the GameActionResult from the build and the actual build location after the coords have been adjusted
 */
export const removeTrackAtFollowingPosition = (selectedSegment: Segment, direction: "next" | "previous", type: "real" | "ghost", callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void): void => {
    // get the next position from selectedSegment
    let location: CoordsXYZD | null;
    debug(`direction: ${direction}`);
    debug(`selctedSegment nextLocation and previousLocation: ${JSON.stringify(selectedSegment.nextLocation())}, ${JSON.stringify(selectedSegment.previousLocation())}`);

    (direction == "next") ? location = selectedSegment.nextLocation() : location = selectedSegment.previousLocation();
    if (location == null) {
        debug(`Unable to remove track: segment unable to discern ${direction} location`);
        return;
    }
    debug(`location: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);

    const elementToRemove = finder.getSpecificTrackElement(selectedSegment.get().ride, location);
    buildOrRemove(elementToRemove, "remove", type, false, (result) => {
        if (callback) callback(result);
    });
};

/**
 * Build a proceeding/preceding segment from the given segment
 * @param selectedSegment the selected segment
 * @param direction  whether building in next or previous direction
 * @param trackToBuild  the track element to build
 * @param type  whether the segment to remove is a ghost or real segment
 * @param callback  callback function for debugging purposes
 * @returns  the GameActionResult from the build and the actual build location after the coords have been adjusted
 */
export const buildTrackAtFollowingPosition = (
    selectedSegment: Segment,
    direction: "next" | "previous",
    trackToBuild: TrackElementType,
    type: "real" | "ghost",
    callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)): void => {

    let location: CoordsXYZD | null;
    (direction == "next") ? location = selectedSegment.nextLocation() : location = selectedSegment.previousLocation();
    if (location == null) {
        debug(`Unable to remove track: no ${direction} location`);
        return;
    }
    if (direction == "previous") {
        debug(`initial direction before rotating: ${location.direction}`);
        location.direction = selectedSegment.get().location.direction;
    }
    debug(`location to build next piece: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);

    const segmentToBuild = new Segment({
        location: location,
        ride: selectedSegment.get().ride,
        trackType: trackToBuild,
        rideType: selectedSegment.get().rideType
    });
    // todo need to pass in this because it might be different than the selectedSegment's rideType

    buildOrRemove(segmentToBuild, "build", type, direction, (result) => {

        const response = {
            result: result.result,
            newlyBuiltSegment: new Segment({
                location: result.actualBuildLocation,
                ride: selectedSegment.get().ride,
                trackType: trackToBuild,
                rideType: selectedSegment.get().rideType
            })
        };
        if (callback) callback(response);
    });
};

const buildOrRemove = (
    segmentToBuild: Segment | TrackElementItem,
    action: "build" | "remove",
    type: "real" | "ghost",
    normalizeZ: "next" | "previous" | false,
    callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {

    let thisSegment: Segment | null;
    ('segment' in segmentToBuild) ? thisSegment = segmentToBuild.segment : thisSegment = segmentToBuild;

    assert(!!thisSegment, "segmentToBuild is null");
    if (thisSegment == null) {
        debug(`error: thisSegment is null`);
        return;
    }
    const buildInstructions = makeBuildInstructions(thisSegment.get(), type); // add in the build flags

    buildOrRemoveTrackElement(<TrackElementProps>buildInstructions[action], action, normalizeZ, (result) => {
        if (callback) callback(result);
    });
};



export const getBuildOptionsForSegment = (segment: Segment, rideType: number): { next: TrackElementType[], previous: TrackElementType[] } => {
    let next: TrackElementType[] = [];
    let previous: TrackElementType[] = [];

    const seg = segment.get();
    debug(`Getting build options for segment at ${JSON.stringify(seg.location)}.`);

    // get forward potential builds
    const nextLocation = segment.nextLocation(); // for some reason needing to create a copy of it so that location won't suspect a potential null value

    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, seg.rideType, "next");
        next = buildableTrackTypes;
    }

    // get backward potential builds.
    const backLocation = segment.previousLocation();

    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, seg.rideType, "previous");
        previous = buildableTrackTypes;
    }

    return { next, previous };
}
