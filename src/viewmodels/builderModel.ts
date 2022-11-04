import { TrackElementProps } from './../services/rideBuilder';
import { Segment } from '../objects/segment';
import { SegmentBuildController, TrackPlaceProps, TrackRemoveProps } from './../objects/buildController';
import { buildOrRemoveTrackElement } from './../services/rideBuilder';
import { debug } from '../utilities/logger';
import { TrackElementItem } from '../services/SegmentController';


// this is going to have the building and iterating logic
let buildInstructions: { build: TrackPlaceProps, remove: TrackRemoveProps } | null = null;

const bc = new SegmentBuildController();

export const build = (segmentToBuild: Segment | TrackElementItem, type: "real" | "ghost", callback?: ((result: GameActionResult) => void) | undefined): void => {
    buildOrRemove(segmentToBuild, "build", type, callback);
};

export const remove = (segmentToBuild: Segment | TrackElementItem, type: "real" | "ghost", callback?: ((result: GameActionResult) => void) | undefined): void => {

    buildOrRemove(segmentToBuild, "remove", type, callback);
};

const buildOrRemove = (segmentToBuild: Segment | TrackElementItem | null, action: "build" | "remove", type: "real" | "ghost", callback?: ((result: GameActionResult) => void) | undefined): void => {
    if (segmentToBuild == null) {
        debug(`Unable to ${action}: no segment specified`);
        return;
    }

    let thisSegment;
    ('segment' in segmentToBuild) ? thisSegment = { ...segmentToBuild.segment } : thisSegment = { ...segmentToBuild };
    ('segment' in segmentToBuild) ? thisSegment = segmentToBuild.segment : thisSegment = segmentToBuild;
    // const originalBuildInstructions = { ...buildInstructions };// the build instructions are being mutated in the next step, so we need to save the original

    updateBuildInstructions(<Segment>thisSegment, type);

    if (buildInstructions) {


        // todo
        // todo
        // todo this didn't work
        buildOrRemoveTrackElement(<TrackElementProps>buildInstructions[action], action, (result) => {
            if (callback) callback(result);
        });
        // reset the oringal build instructions after they're mutated.
    }
}

//update build instructions whenever the selectedSegment changes
const updateBuildInstructions = (segmentToBuild: Segment | null, type: "real" | "ghost"): void => {
    if (!segmentToBuild) {
        // debug that there is no selected segment
        debug(`Unable to update build instructions: no segment selected`);
        buildInstructions = null;
        return;

    }
    buildInstructions = bc.makeBuildInstructions(segmentToBuild.get(), type);
};

