import { doesSegmentExistHere } from './../services/trackElementFinder';
import { SegmentSelector2 } from './../objects/segmentSelector2';
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
    readonly buildableSegments = store<Segment[]>([]);
    readonly selectedBuild = store<Segment | null>(null);
    readonly buildDirection = store<"next" | "prev" | null>("next");
    readonly buildRotation = store<Direction | null>(null);

    /**
     *Used for looking up the possible segments that can be built next
     */

    constructor() {
        this.selectedSegment.subscribe((seg) => this.onSegmentChange(seg));
        this.buildDirection.subscribe((dir) => this.onBuildDirectionChange(dir));
        this.buildRotation.subscribe((rotation) => this.onRotationChange(rotation));
        this.buildableSegments.subscribe((newBuildableSegmentsList) => this.onBuildableSegmentsChange(newBuildableSegmentsList));
        this.selectedBuild.subscribe((newSelectedBuild) => this.onSelectedBuildChange(newSelectedBuild));
    }

    buildSelectedNextPiece() {
        const segToBuild = this.selectedBuild.get();
        if (segToBuild == null) {
            debug("no piece to build");
            return;
        }
        builder.remove(segToBuild, "ghost");
        builder.build(segToBuild, "real", (result) => {
            if (result.error) {
                debug(`Error building that piece. ${result?.errorMessage}`);
                return;
            }
        });

        this.moveToNextSegment(this.buildDirection.get() || "next")
        // check if the next piece. if so set it and reset the other things
    }

    private moveToNextSegment(direction: "next" | "prev") {
        const tiAtSelectedSegment = finder.getTIAtSegment(this.selectedSegment.get()); // use a trackIterator to find the proper coords

        if (tiAtSelectedSegment == null) {
            debug("no track iterator at selected segment");
            return;
        }

        const isThereANextSegment = tiAtSelectedSegment.next(); // moves the iterator to the next segment and returns true if it worked;
        if (isThereANextSegment) {
            // if the player is changing track types so they can add additional non-standard segments, we can't assume to know the track type they've used at the next coords.
            const nextTrackElementItem = finder.getSpecificTrackElement(this.selectedSegment.get()?.get().ride || 0, tiAtSelectedSegment.position);

            // add to nextSegment to create a whole new segment object
            const nextSegment = new Segment({
                location: tiAtSelectedSegment.position,
                ride: nextTrackElementItem.element.ride,
                trackType: nextTrackElementItem.element.trackType,
                rideType: nextTrackElementItem.element.rideType
            });

            this.selectedSegment.set(nextSegment);
        }
    }

    private onSegmentChange = (newSeg: Segment | null): void => {
        if (newSeg == null) {
            debug("no segment selected");
            return;
        }

        debug(`Segment changed to ${TrackElementType[newSeg?.get().trackType || 50]}`); // randomly chose 50 as a default
        highlighter.highlightSelectedElements(newSeg); //set the elements of this segment to be highlighted
        const newBuildableOptions = builder.getBuildOptionsForSegment(newSeg);

        const direction = this.buildDirection.get();
        if (direction === "next") {
            this.buildableSegments.set(newBuildableOptions.next);
            return;
        }
        if (direction === "prev") {
            this.buildableSegments.set(newBuildableOptions.previous);
            return;
        }
        debug(`No direction was set for the buildable segments.This should not happen.`);
        this.buildableSegments.set([]);
    };

    /**
     * Reset build options when the navigation mode is changed to/from forward & backward building modes.
     */
    private onBuildDirectionChange = (newDirection: "next" | "prev" | null): void => {
        if (!newDirection) {
            this.buildableSegments.set([]);
            return;
        }
        const buildableOptions = builder.getBuildOptionsForSegment(this.selectedSegment.get()); //this.ss.getBuildableSegmentOptions();
        if (newDirection === "next") {
            // todo make sure to set nextBuildPosition at the sme time
            this.buildableSegments.set(buildableOptions.next);
            return;
        }
        this.buildableSegments.set(buildableOptions.previous);

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

    private onBuildableSegmentsChange = (newBuildableSegments: Segment[]): void => {
        debug(`Buildable segments have changed.`);


        // this is where it might be worthwhile to use another class to do this hard work.
        // todo make it return something better than just the 0th element.
        const recommendedSegment = getSuggestedNextSegment(newBuildableSegments, this.selectedSegment.get(), this.selectedBuild.get());

        this.selectedBuild.set(recommendedSegment);
    };

    private onSelectedBuildChange = (newSelectedBuild: Segment | null): void => {
        // todo highlight the ground under the first piece that's being built
        if (newSelectedBuild == null) {
            highlighter.highlightGround(null);
            return;
        }


        // for downsloped tracks, this gives the z-value pre-shifted down by 8.
        const trackAtBuildLocation = doesSegmentExistHere(newSelectedBuild);

        debug(`
newSelectedBuild.z: ${newSelectedBuild.get().location.z}
selectedSegment.z: ${this.selectedSegment.get()?.get().location.z}
`);

        // case: the next location is free
        if (!trackAtBuildLocation.exists) {
            debug(`There was no track at the location of the selected build.Building it now.`);
            builder.build(newSelectedBuild, "ghost");
        }

        // case: the next location is occupied by a ghost
        if (trackAtBuildLocation.exists === "ghost") {
            debug(`There was a ghost at the location of the selected build.Removing it now.`);
            // remove
            const preExistingSegment = trackAtBuildLocation.element?.segment;
            if (!preExistingSegment) {
                debug(`Error: There was a ghost at the location of the selected build, but it could not be found.`);
                return;
            }

            builder.remove(preExistingSegment, "ghost");
            builder.build(newSelectedBuild, "ghost");
        }

        // highlight the ground under the piece that's being built
        // debug(`highlighting ground!@!@!@!@!@!@!@!@!@!@!@!@!@`)
        highlighter.highlightGround(newSelectedBuild);

        // case: the next location is occupied by a real track piece
        if (trackAtBuildLocation.exists === "real") {
            debug(`There is a real track piece at the location of the selected build.Cannot build a preview piece here.
\nExisting segment: ${JSON.stringify(trackAtBuildLocation.element?.segment?.get())} `);
            this.selectedBuild.set(null);
            return;
        }

        // todo remove the ghost if this edit window closes or another ride is placed on that tile
        // todo the ghost will be remove if the build is reselected, but it'd be nice if it were done on subscription of some sort.
    };

    private onNextBuildPositionChange = (newNextBuildPosition: CoordsXYZD | null): void => {
        debug(`next build position changed to ${JSON.stringify(newNextBuildPosition)} `);
    }

}
