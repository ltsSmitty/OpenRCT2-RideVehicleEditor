import { TrackElementProps } from './../services/rideBuilder';
import { Segment } from '../objects/segment';
import { TrackPlaceProps, TrackRemoveProps, makeBuildInstructions } from './../objects/buildController';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug } from '../utilities/logger';
import { TrackElementItem } from '../services/SegmentController';
import { getBuildableSegments } from '../services/segmentValidator';
import * as finder from '../services/trackElementFinder';
import { TrackElementType } from '../utilities/trackElementType';

export const removeTrackAtNextPosition = (selectedSegment: Segment, type: "real" | "ghost", callback?: ((result: GameActionResult) => void)) => {
    // get the next position from selectedSegment
    const nextLocation = selectedSegment.nextLocation;
    if (nextLocation == null) {
        debug(`Unable to remove track: no next location`);
        return;
    }
    const elementToRemove = finder.getSpecificTrackElement(selectedSegment.get().ride, nextLocation);
    buildOrRemove(elementToRemove, "remove", type, false, (result) => {
        if (callback) callback(result);
    });
}

export const buildTrackAtNextPosition = (selectedSegment: Segment, trackToBuild: TrackElementType, type: "real" | "ghost", callback?: ((result: GameActionResult) => void)) => {
    const nextLocation = selectedSegment.nextLocation;
    if (nextLocation == null) {
        debug(`Unable to build track: no next location`);
        return;
    }
    const elementToBuild = finder.getSpecificTrackElement(selectedSegment.get().ride, nextLocation);
    if (elementToBuild == null || elementToBuild.segment == null) {
        debug(`Unable to build track: no track element found at next location`);
        return;
    }
    elementToBuild.segment.get().trackType = trackToBuild;
    buildOrRemove(elementToBuild, "build", type, true, (result) => {
        if (callback) callback(result);
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



export const getBuildOptionsForSegment = (segment: Segment | null): { next: Segment[], previous: Segment[] } => {
    let next: Segment[] = [];
    let previous: Segment[] = [];
    if (!segment) return { next, previous };

    const seg = segment.get();
    debug(`Getting build options for segment at ${JSON.stringify(seg.location)}.`);


    // got forward potential builds
    const nextLocation = segment.nextLocation; // for some reason needing to create a copy of it so that location won't suspect a potential null value

    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType);
        const buildableSegments = buildableTrackTypes.map(elementType => {
            return new Segment({
                location: nextLocation,
                ride: seg.ride,
                trackType: elementType,
                rideType: seg.rideType
            });
        });
        next = buildableSegments;
    }

    // get backward potential builds.
    const backLocation = segment.previousLocation;

    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType);
        const buildableSegments = buildableTrackTypes.map(elementType => {
            return new Segment({
                location: backLocation,
                ride: seg.ride,
                trackType: elementType,
                rideType: seg.rideType
            });
        });
        previous = buildableSegments;
    }

    return { next, previous };
}
