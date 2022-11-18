import { TrackElementProps } from './../services/rideBuilder';
import { Segment } from '../objects/segment';
import { makeBuildInstructions } from './../objects/buildController';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug } from '../utilities/logger';
import { TrackElementItem } from '../services/SegmentController';
import { getBuildableSegments } from '../services/segmentValidator';
import * as finder from '../services/trackElementFinder';
import { TrackElementType } from '../utilities/trackElementType';


export const removeTrackSegment = (segmentToRemove: Segment | null, direction: "next" | "previous" | null, callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {
    debug(`attempting to remove track segment at coords XYZD ${segmentToRemove?.get().location.x}, ${segmentToRemove?.get().location.y}, ${segmentToRemove?.get().location.z}, ${segmentToRemove?.get().location.direction}`);


    buildOrRemove(segmentToRemove, "remove", "ghost", direction || "next", callback);
}

export const removeTrackAtFollowingPosition = (selectedSegment: Segment | null, direction: "next" | "previous" | null, type: "real" | "ghost", callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void): void => {
    // get the next position from selectedSegment
    if (selectedSegment == null || direction == null) {
        debug("no selected segment or direction is null");
        return;
    }

    let location: CoordsXYZD | null;
    debug(`direction: ${direction}`);
    debug(`selctedSegment nextLocation and previousLocation: ${JSON.stringify(selectedSegment.nextLocation())}, ${JSON.stringify(selectedSegment.previousLocation())}`);

    (direction == "next") ? location = selectedSegment.nextLocation() : location = selectedSegment.previousLocation();
    if (location == null) {
        debug(`Unable to remove track: no ${direction} location`);
        return;
    }
    debug(`location: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);
    const elementToRemove = finder.getSpecificTrackElement(selectedSegment.get().ride, location);

    // debug(`did it actually find an element to remove? ${JSON.stringify(elementToRemove, null, 2)}`);

    buildOrRemove(elementToRemove, "remove", type, false, (result) => {
        if (callback) callback(result);
    });
};

export const buildTrackAtFollowingPosition = (
    selectedSegment: Segment | null,
    direction: "next" | "previous" | null,
    trackToBuild: TrackElementType,
    type: "real" | "ghost",
    callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)): void => {

    if (selectedSegment == null || direction == null) {
        debug("no selected segment or direction is null");
        return;
    }
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

    //todo do the modifications to the location here before returning this newly built segment so it's right.
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
        }
        if (callback) callback(response);
    });
}

const buildOrRemove = (segmentToBuild: Segment | TrackElementItem | null, action: "build" | "remove", type: "real" | "ghost", normalizeZ: "next" | "previous" | false, callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void | undefined): void => {
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
        const buildableTrackTypes = getBuildableSegments(seg.trackType, "next");
        next = buildableTrackTypes;
    }

    // todo make this actually work
    // get backward potential builds.
    const backLocation = segment.previousLocation();

    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, "previous");
        previous = buildableTrackTypes;
    }

    return { next, previous };
}
