
import { SegmentElementPainter } from './../objects/segmentElementPainter';
import { Segment } from './../objects/segment';
import * as highlighter from '../services/highlightGround';
import * as builder from './builderModel';
import * as finder from '../services/trackElementFinder';
import * as storage from '../utilities/coldStorage';

import { store } from 'openrct2-flexui';
import { getSuggestedNextSegment } from '../utilities/suggestedNextSegment';

import { debug } from '../utilities/logger';
import { TrackElementType } from '../utilities/trackElementType';
import { TrackElementItem } from '../services/SegmentController';
import { RideType } from '../utilities/rideType';

const startingRideType: RideType = 15; // Looping Coaster
const startingDirection = "next";

type NextSegmentExistsValidator = {
    exists: false | "real" | "ghost",
    element: null | TrackElementItem
}

export class SegmentModel {

    readonly selectedSegment = store<Segment | null>(null);
    readonly selectedBuild = store<TrackElementType | null>(null);
    readonly previewSegment = store<Segment | null>(null);

    // does this need to be here?
    readonly buildableTrackTypes = store<TrackElementType[]>([]);

    readonly selectedRideType = store<RideType | null>(null);

    readonly buildDirection = store<"next" | "previous" | null>(null);
    readonly buildRotation = store<Direction | null>(null);

    // List the track elements on a selected tile. Used for dropdown selection.
    readonly trackElementsOnSelectedTile = store<TrackElementItem[]>([]);



    private nextSegmentExists: NextSegmentExistsValidator = { exists: false, element: null };
    private originalRideType: RideType = startingRideType;

    private segmentPainter = new SegmentElementPainter();

    constructor() {
        // initialize values
        this.selectedRideType.set(startingRideType);
        this.buildDirection.set(startingDirection);

        // initialize event listeners
        this.selectedSegment.subscribe((seg) => this.onSegmentChange(seg));
        this.buildDirection.subscribe((dir) => this.onBuildDirectionChange(dir));
        this.buildRotation.subscribe((rotation) => this.onRotationChange(rotation));
        this.buildableTrackTypes.subscribe((newbuildableTrackTypesList) => this.onbuildableTrackTypesChange(newbuildableTrackTypesList));
        this.selectedBuild.subscribe((newSelectedBuild) => this.onSelectedBuildChange(newSelectedBuild));
        this.previewSegment.subscribe((newPreviewSegment) => this.onPreviewSegmentChange(newPreviewSegment));

        // context.subscribe("action.execute", (event: GameActionEventArgs) => {
        //     const action = event.action as ActionType;
        //     switch (action) {
        //         case "ridesetappearance":
        //         case "ridesetcolourscheme": {
        //             debug(`<${action}>\n\t- type: ${event.type}
        // \t- args: ${JSON.stringify(
        //                 event.args, null, 2
        //             )}\n\t- result: ${JSON.stringify(event.result)}`);
        //             break;
        //         }
        //     }
        // })
    }

    /**
     * @summary Called upon plugin mount. If the game was saved without closing the window, some artifacts will remain, including the preview track,
     * the highlight under the preview track, and the yellow painting of the selected segment. This function will remove all of those artifacts.
     */
    cleanUpFromImproperClose(): void {
        debug("cleaning up from improper close on pluginMount.");

        // if threre is still a previewSegment, call close to clean up
        const storedPaintedSegmentDetails = storage.getPaintedSegmentDetails();
        const storedPreviewSegment = storage.getPreviewSegment();
        if (storedPreviewSegment || storedPaintedSegmentDetails.segment) {

            debug(`there is a stored preview segment or a stored painted segment. Cleaning up.`);
            debug(`stored preview segment: ${JSON.stringify(storedPreviewSegment || storedPaintedSegmentDetails.segment)}`);
            //          // if something goes wrong during testing, this will catch it and make sure the plugin doesn't crash
            // if (!storedPreviewSegment?.get || !storedPaintedSegmentDetails?.segment?.get) {
            //     // debug(`the stored data is bugged. clearing it.`);
            //     this.previewSegment.set(null);
            this.segmentPainter.clearMemory();
            //     this.close();
            //     return;
            // }

            this.previewSegment.set(storedPreviewSegment);
            // this.segmentPainter.clearMemory();
            debug(`cleaning up from improper close. preview segment is ${JSON.stringify(storedPreviewSegment?.get())}`);
            this.close();
        }
    }

    close(): void {
        debug("closing segment model");
        this.segmentPainter.restoreInitialColour();
        if (this.previewSegment.get() !== null) {
            builder.removeThisGhostSegment(this.previewSegment.get()!, this.buildDirection.get());
        }
        this.previewSegment.set(null);
        this.selectedSegment.set(null);
    }

    /**
     * Main function called by the Ui to construct the selected segment.
     */
    buildSelectedFollowingPiece() {
        const segToBuild = this.selectedBuild.get();
        if (segToBuild == null) {
            debug("no selected track type to build");
            return;
        }
        const thisSeg = this.selectedSegment.get();
        if (thisSeg == null) {
            debug(`no selected segment to build ${segToBuild} after`);
            return;
        }
        // todo not working with previous inversions
        builder.removeTrackAtFollowingPosition(thisSeg, this.buildDirection.get() || "next", "ghost", (result) => {
            debug(`Ghost removed from the next position of the selected segment. Result is ${JSON.stringify(result, null, 2)}`);
        });
        builder.buildTrackAtFollowingPosition(thisSeg, this.buildDirection.get() || "next", segToBuild, "real", ({ result, newlyBuiltSegment }) => {
            if (result.error) {
                debug(`Error building that piece. ${result?.errorMessage}`);
                return;
            }
            debug(`Real track built.`);
        });
    }

    moveToFollowingSegment(direction: "next" | "previous" | null): boolean {
        if (direction == null) {
            "no direction set; not moving to next segment";
            return false;
        }
        debug(`moving to ${direction} segment`);
        const tiAtSelectedSegment = finder.getTIAtSegment(this.selectedSegment.get()); // use a trackIterator to find the proper coords

        if (tiAtSelectedSegment == null) {
            debug("no track iterator at selected segment");
            return false;
        }

        const isThereAFollowingSegment = (direction == "next" ? tiAtSelectedSegment.next() : tiAtSelectedSegment.previous()); // moves the iterator to the next segment and returns true if it worked;
        if (isThereAFollowingSegment) {
            // if the player is changing track types so they can add additional non-standard segments, we can't assume to know the track type they've used at the next coords.
            // debug(`in moveToNextSegment, direction is ${direction}. about to get the next TrackElementItem.
            // The TI says the ride should be found at (${tiAtSelectedSegment.position.x}, ${tiAtSelectedSegment.position.y}, ${tiAtSelectedSegment.position.z}, direction: ${tiAtSelectedSegment.position.direction})`);
            const followingTrackElementItem = finder.getSpecificTrackElement(this.selectedSegment.get()?.get().ride || 0, tiAtSelectedSegment.position)

            // add to nextSegment to create a whole new segment object
            const nextSegment = new Segment({
                location: tiAtSelectedSegment.position,
                ride: followingTrackElementItem.element.ride,
                trackType: followingTrackElementItem.element.trackType,
                rideType: followingTrackElementItem.element.rideType
            });

            // check if there's a preview segment to delete.
            if (this.previewSegment.get() != null) {
                builder.removeThisGhostSegment(this.previewSegment.get()!, this.buildDirection.get());
            }
            this.selectedSegment.set(nextSegment);
            return true;
        }
        return false;
    }

    debugButtonChange(action: any) {
        debug(`button pressed: ${JSON.stringify(action, null, 2)}`);
    }


    private onSegmentChange = (newSeg: Segment | null): void => {
        if (newSeg == null) {
            debug("no segment selected");
            return;
        }

        debug(`Segment changed to ${TrackElementType[newSeg?.get().trackType]} at coords (${newSeg?.get().location.x}, ${newSeg?.get().location.y}, ${newSeg?.get().location.z}, direction: ${newSeg?.get().location.direction})`);

        this.highlightSelectedSegment(); // highlight the selected segment to make it obvious what's selected.

        // before figuring out what can be built in the direction, check if there's even an option
        // check if there's room for a preview segment
        this.nextSegmentExists = checkForNextTrackInDirection(newSeg, this.buildDirection.get() || "next");
        if (this.nextSegmentExists.exists) {
            debug(`No need to generate a preview segment. There's already a track in the direction we're building.`);
            return;
        }
        // is there a ghost track in direction? => not sure
        // is it empty in direction? => calculate buildable track types

        this.setOriginalRideType(newSeg); // update the original rideType

        // potentially do this in the buttonModel in response to this change instead of doing it here.
        this.updateBuildableTrackTypes();
    };

    private updateBuildableTrackTypes(): void {

        const newBuildableOptions = builder.getBuildOptionsForSegment(<Segment>this.selectedSegment.get(), this.buildableTrackTypes.get()); // selectedSegment is definitely non-null
        const direction = this.buildDirection.get();

        if (direction === "next") {
            debug(`There are ${newBuildableOptions.next.length} buildable options for the next segment: $`);
            debug(newBuildableOptions.next.map((seg) => TrackElementType[seg]).join(", "));
            this.buildableTrackTypes.set([...newBuildableOptions.next]);
            return;
        }
        if (direction === "previous") {
            debug(`There are ${newBuildableOptions.previous.length} buildable options for the previous segment`);
            this.buildableTrackTypes.set([...newBuildableOptions.previous]);
            return;
        }
        debug(`No direction was set for the buildable segments.This should not happen.`);
        this.buildableTrackTypes.set([]);
    }

    private highlightSelectedSegment(): void {
        const newSeg = this.selectedSegment.get();
        if (newSeg == null) return;
        storage.setSelectedSegment(newSeg); // store in cold storage in case of crash
        const wasPaintOfSelectedSegmentSucessful = this.segmentPainter.paintSelectedSegment(newSeg);
        // todo reimplement this with start/stop interval
        // if (this.previewSegment.get() == null) {
        //     this.segmentPainter.togglePainting(true);
        // } else {
        //     this.segmentPainter.togglePainting(false);
        // }
        if (!wasPaintOfSelectedSegmentSucessful) {
            debug(`failed to paint the selected segment!!!!!!!`);
        }
    }

    /**
     * Reset build options when the navigation mode is changed to/from forward & backward building modes.
     */
    private onBuildDirectionChange = (newDirection: "next" | "previous" | null): void => {
        debug(`Build direction changed to ${newDirection}`);
        if (!newDirection) {
            this.buildableTrackTypes.set([]);
            return;
        }
        if (this.selectedSegment.get() == null) {
            debug(`Error in onBuildDirectionChange: no segment selected. Setting buildableTrackTypes to null.`);
            this.buildableTrackTypes.set([]);
            return;
        }
        this.updateBuildableTrackTypes();
    };

    /**
     * TODO - this is not working. It is not updating the buildable segments when the rotation changes.
     * Recalculate details after rotating an unbuild floating piece
     * (like rotating a single yet-placed station with the standard ride builder)
     */
    private onRotationChange = (rotation: Direction | null): void => {
        // const segment = this.selectedSegment.get();

        // if (segment == null || rotation == null) return;
        // const rotatedSegment = new Segment({
        //     location: { x: segment.location.x, y: segment.location.y, z: segment.location.z,  },
        // })
        // segment.get().location.direction = rotation;
        // // this.ss.updateSegment(segment);
        // // todo make sure to set nextBuildPosition at the sme time
    };

    private onbuildableTrackTypesChange = (newBuildOptions: TrackElementType[]): void => {
        debug(`Buildable segments have changed.`);

        // this is where it might be worthwhile to use another class to do this hard work.
        // todo make it return something better than just the 0th element.
        const recommendedSegment = getSuggestedNextSegment(newBuildOptions, this.selectedSegment.get(), this.selectedBuild.get());

        debug(`The default selected build has been selected: ${TrackElementType[recommendedSegment]}`);
        this.selectedBuild.set(recommendedSegment);
    };

    private onSelectedBuildChange = (selectedTrackType: TrackElementType | null): void => {
        debug(`assessing selectedTrackType: ${selectedTrackType}`);

        if (selectedTrackType == null) {
            debug(`Selected build changed to null`);
            highlighter.highlightMapRangeUnderSegment(null);
            return;
        }

        debug(`Selected build changed to ${TrackElementType[selectedTrackType]}. Validating if it should be placed.then ghost building it.`);
        const segment = this.selectedSegment.get();
        if (segment == null) {
            debug(`selectedBuild changed, but selectedSegment is null. Not building a ghost segment.`);
            return;
        }
        const buildDirection = this.buildDirection.get();
        if (buildDirection == null) {
            debug(`selectedBuild changed, but buildDirection is null. Not building a ghost segment.`);
            return;
        }

        const trackAtFollowingBuildLocation = checkForNextTrackInDirection(segment, buildDirection);
        debug(`trackAtNextBuildLocation: ${JSON.stringify(trackAtFollowingBuildLocation, null, 2)}`);

        // case: the next location is free
        if (!trackAtFollowingBuildLocation.exists) {
            debug(`There was no track at the location of the selected build. Building it now.`);
            builder.buildTrackAtFollowingPosition(segment, buildDirection, selectedTrackType, "ghost", ({ result, newlyBuiltSegment }) => {
                debug(`Result of building the ghost piece: ${JSON.stringify(result, null, 2)}`);
                this.previewSegment.set(newlyBuiltSegment);
            });
        }

        // case: the next location is already occupied by a ghost
        if (trackAtFollowingBuildLocation.exists === "ghost") {
            debug(`There was a ghost at the location of the selected build.Removing it now.`);

            // it should always be able to remove using the previewSegment, but i'll add a log in case it has to remove using the alternate method
            const ghost = this.previewSegment.get();
            if (ghost) {
                builder.removeThisGhostSegment(ghost, buildDirection);
            } else {
                // hopefully this never happens
                debug(`Warning: using fallback function to remove ghost segment.`);
                this.removeGhostSegment(trackAtFollowingBuildLocation);
            }

            debug(` Building the new piece now.`);
            this.buildGhostSegment();
            debug(`... and new piece built. seg nextLocation and thisselectedSegment nextLocation: ${JSON.stringify(segment?.nextLocation())}, ${JSON.stringify(this.selectedSegment.get()?.nextLocation())} `);
        }

        // case: the next location is occupied by a real track piece
        if (trackAtFollowingBuildLocation.exists === "real") {
            debug(`There is a real track piece at the location of the selected build.Cannot build a preview piece here.
            \nExisting segment: ${JSON.stringify(trackAtFollowingBuildLocation.element?.segment?.get())} `);
            this.selectedBuild.set(null);
            return;
        }

        // todo remove the ghost if this edit window closes
        // todo the ghost will be remove if the build is reselected, but it'd be nice if it were done on subscription of some sort.
    };

    private removeGhostSegment(trackAtFollowingBuildLocation: NextSegmentExistsValidator): void {
        const segment = this.selectedSegment.get();
        const buildDirection = this.buildDirection.get();
        const preExistingSegment = trackAtFollowingBuildLocation.element?.segment;
        if (!preExistingSegment || !segment || !buildDirection) {
            debug(`Error: Unable to remove ghost; details missing.`);
            return;
        }
        builder.removeTrackAtFollowingPosition(segment, buildDirection, "ghost", (result) => {
            debug(`Result of removing the ghost piece: ${JSON.stringify(result, null, 2)}`);
        });
    }

    private buildGhostSegment(): void {
        const segment = this.selectedSegment.get();
        const buildDirection = this.buildDirection.get();
        const selectedTrackType = this.selectedBuild.get();

        if (!segment || !buildDirection || !selectedTrackType) {
            debug(`unable to build ghost segment; details missing`);
            return;
        }

        builder.buildTrackAtFollowingPosition(segment, buildDirection, selectedTrackType, "ghost", ({ result, newlyBuiltSegment }) => {
            debug(`Result of building new ghost piece: ${JSON.stringify(result, null, 2)}`);
            if (newlyBuiltSegment) {
                this.previewSegment.set(newlyBuiltSegment);
            }
        });
    }

    private onNextBuildPositionChange = (newNextBuildPosition: CoordsXYZD | null): void => {
        debug(`next build position changed to ${JSON.stringify(newNextBuildPosition)} `);
    }

    private onPreviewSegmentChange(newPreviewSegment: Segment | null): void {
        // debug(`preview segment changed to ${JSON.stringify(newPreviewSegment?.get())
        //     } `);
        debug(`preview segment changed to ${JSON.stringify(newPreviewSegment)}`)
        highlighter.highlightMapRangeUnderSegment(newPreviewSegment);
        storage.setPreviewSegment(newPreviewSegment);
    }

    private setOriginalRideType = (segment: Segment): void => {
        const rideId = segment.get().ride;
        const ride = map.getRide(rideId);
        this.originalRideType = (ride.type);
    };

    updateRideTypeOfSegment = (segment: Segment, newRideType: RideType): void => {
        const trackElement = finder.getTrackElementFromSegment(segment);
        if (trackElement) {
            trackElement.element.rideType = newRideType;
        }
    };
}

const checkForNextTrackInDirection = (segment: Segment, direction: "next" | "previous"): NextSegmentExistsValidator => {
    let trackAtFollowingBuildLocation = segment.isThereAFollowingSegment(direction);
    debug(`trackAtNextBuildLocation: ${JSON.stringify(trackAtFollowingBuildLocation, null, 2)}`);
    if (trackAtFollowingBuildLocation.exists == false) {
        // there is no real track at the next build location. Check if there's a ghost segment.
        // sadly the TI doesn't actually recognize a track being present if it's a ghost
        debug(`! ! ! ! ! ! ! There is no real track at the ${direction} build location. Check if there's a ghost segment.`);
        trackAtFollowingBuildLocation = finder.doesSegmentHaveNextSegment(segment, direction);
    }
    return trackAtFollowingBuildLocation;
};





