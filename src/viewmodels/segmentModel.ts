import { doesSegmentHaveNextSegment } from './../services/trackElementFinder';
import { Segment } from './../objects/segment';
import * as highlighter from '../services/highlightGround';
import * as builder from './builderModel';
import * as finder from '../services/trackElementFinder';

import { compute, Store, store } from 'openrct2-flexui';
import { getSuggestedNextSegment } from '../utilities/suggestedNextSegment';

import { debug, assert } from '../utilities/logger';
import { TrackElementType } from '../utilities/trackElementType';


export class SegmentModel {

    readonly selectedSegment = store<Segment | null>(null);
    readonly buildableTrackTypes = store<TrackElementType[]>([]);
    readonly selectedBuild = store<TrackElementType | null>(null);
    readonly previewSegment = store<Segment | null>(null)
    readonly buildDirection = store<"next" | "prev" | null>("next");
    readonly buildRotation = store<Direction | null>(null);

    /**
     *Used for looking up the possible segments that can be built next
     */

    constructor() {
        this.selectedSegment.subscribe((seg) => this.onSegmentChange(seg));
        this.buildDirection.subscribe((dir) => this.onBuildDirectionChange(dir));
        this.buildRotation.subscribe((rotation) => this.onRotationChange(rotation));
        this.buildableTrackTypes.subscribe((newbuildableTrackTypesList) => this.onbuildableTrackTypesChange(newbuildableTrackTypesList));
        this.selectedBuild.subscribe((newSelectedBuild) => this.onSelectedBuildChange(newSelectedBuild));
        this.previewSegment.subscribe((newPreviewSegment) => this.onPreviewSegmentChange(newPreviewSegment));
    }

    /**
     * Main function called by the Ui to construct the selected segment.
     */
    buildSelectedNextPiece() {
        const segToBuild = this.selectedBuild.get();
        if (segToBuild == null) {
            debug("no selected track type to build");
            return;
        }
        builder.removeTrackAtNextPosition(this.selectedSegment.get(), "ghost", (result) => {
            debug(`Ghost removed from the next position of the selected segment. Result is ${JSON.stringify(result, null, 2)}`);
        });
        builder.buildTrackAtNextPosition(this.selectedSegment.get(), segToBuild, "real", ({ result, newlyBuiltSegment }) => {
            // this.previewSegment.set(newlyBuiltSegment);
            if (result.error) {
                debug(`Error building that piece. ${result?.errorMessage}`);
                return;
            }
            debug(`Real track built.`);
        });
    }

    moveToNextSegment(direction: "next" | "prev") {
        const tiAtSelectedSegment = finder.getTIAtSegment(this.selectedSegment.get()); // use a trackIterator to find the proper coords

        if (tiAtSelectedSegment == null) {
            debug("no track iterator at selected segment");
            return;
        }

        const isThereANextSegment = tiAtSelectedSegment.next(); // moves the iterator to the next segment and returns true if it worked;
        if (isThereANextSegment) {
            // if the player is changing track types so they can add additional non-standard segments, we can't assume to know the track type they've used at the next coords.
            const nextTrackElementItem = finder.getASpecificTrackElement(this.selectedSegment.get()?.get().ride || 0, tiAtSelectedSegment.position);

            // add to nextSegment to create a whole new segment object
            const nextSegment = new Segment({
                location: tiAtSelectedSegment.position,
                ride: nextTrackElementItem.element.ride,
                trackType: nextTrackElementItem.element.trackType,
                rideType: nextTrackElementItem.element.rideType
            });

            this.selectedSegment.set(nextSegment);
            return true;
        }
        return false;
    }

    private onSegmentChange = (newSeg: Segment | null): void => {
        if (newSeg == null) {
            debug("no segment selected");
            return;
        }

        if (!newSeg?.get().trackType == null) {
            debug("The selected segment has no track type");
        }

        debug(`Segment changed to ${TrackElementType[newSeg?.get().trackType]}`);
        const newBuildableOptions = builder.getBuildOptionsForSegment(newSeg);
        debug(`After segment change, assessing new buildable options based on whether this segment points up, down, is inverted, etc.`);
        const direction = this.buildDirection.get();
        if (direction === "next") {
            debug(`There are ${newBuildableOptions.next.length} buildable options for the next segment`);
            this.buildableTrackTypes.set([...newBuildableOptions.next]);
            return;
        }
        if (direction === "prev") {
            debug(`There are ${newBuildableOptions.previous.length} buildable options for the previous segment`);
            this.buildableTrackTypes.set([...newBuildableOptions.next]);
            return;
        }
        debug(`No direction was set for the buildable segments.This should not happen.`);
        this.buildableTrackTypes.set([]);
    };

    /**
     * Reset build options when the navigation mode is changed to/from forward & backward building modes.
     */
    private onBuildDirectionChange = (newDirection: "next" | "prev" | null): void => {
        if (!newDirection) {
            this.buildableTrackTypes.set([]);
            return;
        }
        const buildableOptions = builder.getBuildOptionsForSegment(this.selectedSegment.get()); //this.ss.getBuildableSegmentOptions();
        if (newDirection === "next") {
            // todo make sure to set nextBuildPosition at the sme time
            this.buildableTrackTypes.set([...buildableOptions.next]);
            return;
        }
        this.buildableTrackTypes.set([...buildableOptions.previous]);

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

        debug(`The default selected segment is ${TrackElementType[recommendedSegment]}`);

        // try setting to null and then resetting just in case
        this.selectedBuild.set(null);
        this.selectedBuild.set(recommendedSegment);
    };

    private onSelectedBuildChange = (selectedTrackType: TrackElementType | null): void => {
        debug(`onSelectedBuildChange`);
        if (selectedTrackType == null) {
            highlighter.highlightMapRange(null);
            // highlighter.highlightMapRange(this.selectedSegment.get());
            return;
        }

        debug(`Selected build changed to ${TrackElementType[selectedTrackType]}. Prepping to ghost build it.`);

        const segment = this.selectedSegment.get();
        // Big goal: build a preview of the selectedTrackType at this.selectedSegment.nextBuildPosition
        // Might have to delete an existing other preview piece first though.
        // for downsloped tracks, this gives the z-value pre-shifted down by 8.
        const trackAtNextBuildLocation = doesSegmentHaveNextSegment(segment, this.selectedBuild.get() || 0);
        // case: the next location is free~
        if (!trackAtNextBuildLocation.exists) {
            debug(`There was no track at the location of the selected build.Building it now.`);
            builder.buildTrackAtNextPosition(segment, selectedTrackType, "ghost", ({ result, newlyBuiltSegment }) => {
                debug(`Result of building the ghost piece: ${JSON.stringify(result, null, 2)}`);
                this.previewSegment.set(newlyBuiltSegment);
            });

        }

        // case: the next location is occupied by a ghost
        if (trackAtNextBuildLocation.exists === "ghost") {
            debug(`There was a ghost at the location of the selected build.Removing it now.`);
            // remove
            const preExistingSegment = trackAtNextBuildLocation.element?.segment;
            if (!preExistingSegment) {
                debug(`Error: There was a ghost at the location of the selected build, but it could not be found.`);
                return;
            }

            builder.removeTrackAtNextPosition(segment, "ghost", (result) => {
                debug(`Result of removing the ghost piece: ${JSON.stringify(result, null, 2)}`);
            });

            debug(`Ghost removed. Building the new piece now.\n\n\n`);
            builder.buildTrackAtNextPosition(segment, selectedTrackType, "ghost", ({ result, newlyBuiltSegment }) => {
                debug(`Result of building the ghost piece: ${JSON.stringify(result, null, 2)}`);
                if (newlyBuiltSegment) {
                    this.previewSegment.set(newlyBuiltSegment);
                }
            });
            debug(`... and new piece built. seg nextLocation and thisselectedSegment nextLocation: ${JSON.stringify(segment?.nextLocation())}, ${JSON.stringify(this.selectedSegment.get()?.nextLocation())} `);
        }

        // highlight the ground under the piece that's being built
        // todo fix this
        // highlighter.highlightGround(newSelectedBuild);

        // case: the next location is occupied by a real track piece
        if (trackAtNextBuildLocation.exists === "real") {
            debug(`There is a real track piece at the location of the selected build.Cannot build a preview piece here.
            \nExisting segment: ${JSON.stringify(trackAtNextBuildLocation.element?.segment?.get())} `);
            this.selectedBuild.set(null);
            return;
        }

        // todo remove the ghost if this edit window closes or another ride is placed on that tile
        // todo the ghost will be remove if the build is reselected, but it'd be nice if it were done on subscription of some sort.
    };

    private onNextBuildPositionChange = (newNextBuildPosition: CoordsXYZD | null): void => {
        debug(`next build position changed to ${JSON.stringify(newNextBuildPosition)} `);
    }

    private onPreviewSegmentChange(newPreviewSegment: Segment | null): void {
        debug(`preview segment changed to ${JSON.stringify(newPreviewSegment?.get())} `);

        // todo reenable once the down segment is deleting properly
        // highlighter.highlightMapRange(newPreviewSegment);
    }

}


