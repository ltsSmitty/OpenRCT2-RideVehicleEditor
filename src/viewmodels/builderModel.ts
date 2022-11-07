import { TrackElementProps } from './../services/rideBuilder';
import { Segment } from '../objects/segment';
import { makeBuildInstructions } from './../objects/buildController';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug } from '../utilities/logger';
import { TrackElementItem } from '../services/SegmentController';
import { getBuildableSegments } from '../services/segmentValidator';
import * as finder from '../services/trackElementFinder';
import { TrackElementType } from '../utilities/trackElementType';

export const removeTrackAtNextPosition = (selectedSegment: Segment | null, type: "real" | "ghost", callback?: ((result: GameActionResult) => void)) => {
    // get the next position from selectedSegment
    if (selectedSegment == null) {
        debug("no selected segment");
        return;
    }
    const nextLocation = selectedSegment.nextLocation();
    if (nextLocation == null) {
        debug(`Unable to remove track: no next location`);
        return;
    }
    const elementToRemove = finder.getASpecificTrackElement(selectedSegment.get().ride, nextLocation);

    debug(`did it actually find an element to remove? ${JSON.stringify(elementToRemove, null, 2)}`);

    debug(`Trying to remove a ${type} segment at ${nextLocation.x}, ${nextLocation.y}. If it's pointing down, make sure it gets removed too.
    The element to remove is has a startZ of ${elementToRemove.element.baseZ}.
    ${elementToRemove.element.baseZ <= 0 ? "" : "It's pointing down"}`);

    // debug(`compare nextLocation z with elementToRemove z: ${nextLocation.z} ${elementToRemove?.segment?.get().location.z}`);

    buildOrRemove(elementToRemove, "remove", type, false, (result) => {
        if (callback) callback(result);
    });
}

export const buildTrackAtNextPosition = (selectedSegment: Segment | null, trackToBuild: TrackElementType, type: "real" | "ghost",
    callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)) => {
    if (selectedSegment == null) {
        debug("no selected segment");
        return;
    }
    const nextLocation = selectedSegment.nextLocation();
    if (nextLocation == null) {
        debug(`Unable to build track: no next location`);
        return;
    }

    const segmentToBuild = new Segment({
        location: nextLocation,
        ride: selectedSegment.get().ride,
        trackType: trackToBuild,
        rideType: selectedSegment.get().rideType
    });
    // todo need to pass in this because it might be different than the selectedSegment's rideType

    buildOrRemove(segmentToBuild, "build", type, true, (result) => {
        const response = {
            result,
            newlyBuiltSegment: segmentToBuild
        }
        if (callback) callback(response);
    });
}

// export const remove = (segmentToBuild: Segment | TrackElementItem, type: "real" | "ghost", normalizeZ: boolean, callback?: ((result: GameActionResult) => void) | undefined): void => {

//     buildOrRemove(segmentToBuild, "remove", type, normalizeZ, callback);
// };

const buildOrRemove = (segmentToBuild: Segment | TrackElementItem | null, action: "build" | "remove", type: "real" | "ghost", normalizeZ: boolean, callback?: ((result: GameActionResult) => void) | undefined): void => {
    if (segmentToBuild == null) {
        debug(`Unable to ${action}: no segment specified`);
        return;
    }

    let thisSegment: Segment | null;
    ('segment' in segmentToBuild) ? thisSegment = segmentToBuild.segment : thisSegment = segmentToBuild;

    if (thisSegment == null) {
        debug(`error: thisSegment is null`);
        return;
    }
    const buildInstructions = makeBuildInstructions(thisSegment.get(), type); // add in the build flags
    buildOrRemoveTrackElement(<TrackElementProps>buildInstructions[action], action, normalizeZ, (result) => {
        if (callback) callback(result);
    });
    // reset the oringal build instructions after they're mutated.
}



export const getBuildOptionsForSegment = (segment: Segment | null): { next: TrackElementType[], previous: TrackElementType[] } => {
    let next: TrackElementType[] = [];
    let previous: TrackElementType[] = [];
    if (!segment) return { next, previous };

    const seg = segment.get();
    debug(`Getting build options for segment at ${JSON.stringify(seg.location)}.`);

    // get forward potential builds
    const nextLocation = segment.nextLocation(); // for some reason needing to create a copy of it so that location won't suspect a potential null value

    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType);
        next = buildableTrackTypes;
    }

    // todo make this actually work
    // get backward potential builds.
    const backLocation = segment.previousLocation();

    if (backLocation !== null) {
        // const buildableTrackTypes = getBuildableSegments(seg.trackType);
        // previous = buildableTrackTypes;
        // todo reenable and fix this
        previous = [];
    }

    return { next, previous };
}
