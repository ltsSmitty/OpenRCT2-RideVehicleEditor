import { doesSegmentExistHere } from './../services/trackElementFinder';
import { SegmentSelector2 } from './../objects/segmentSelector2';
import { Segment } from './../objects/segment';
import * as highlighter from '../services/highlightGround';

import { compute, Store, store } from 'openrct2-flexui';
import { getSuggestedNextSegment } from '../utilities/suggestedNextSegment';
import *  as builder from './builderModel';
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
    readonly ss = new SegmentSelector2();

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
        if (direction == "next") {
            debug(`previous build options: ${this.buildableSegments.get().length}`);
            const newSegment = this.ss.next();
            debug(`new build options: ${this.buildableSegments.get().length}`);
            if (newSegment) this.selectedSegment.set(newSegment);


        }

    }

    private onSegmentChange = (newSeg: Segment | null): void => {
        debug(`Segment changed to ${TrackElementType[newSeg?.get().trackType || 50]}`);
        //set the elements of this segment to be highlighted
        highlighter.highlightSelectedElements(newSeg);
        const newBuildableOptions = this.ss.updateSegment(newSeg);

        const direction = this.buildDirection.get();
        if (direction === "next") {
            //set the next build position based on any one of the buildable segments location
            debug(`changing next build position to ${newBuildableOptions.next[0]?.get().location}`);

            this.buildableSegments.set(newBuildableOptions.next);
            return;
        }
        if (direction === "prev") {

            this.buildableSegments.set(newBuildableOptions.previous);
            return;
        }
        debug(`No direction was set for the buildable segments. This should not happen.`);
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
        const buildableOptions = this.ss.getBuildableSegmentOptions();
        if (newDirection === "next") {
            // todo make sure to set nextBuildPosition at the sme time
            this.buildableSegments.set(buildableOptions.next);
            return;
        }
        this.buildableSegments.set(buildableOptions.previous);

    };

    /**
     * Recalculate details after rotating an unbuild floating piece
     * (like rotating a single yet-placed station with the standard ride builder)
     */
    private onRotationChange = (rotation: Direction | null): void => {
        const segment = this.selectedSegment.get();

        if (segment == null || rotation == null) return;
        segment.get().location.direction = rotation;
        this.ss.updateSegment(segment);
        // todo make sure to set nextBuildPosition at the sme time
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
            debug(`There was no track at the location of the selected build. Building it now.`);
            builder.build(newSelectedBuild, "ghost");
        }

        // case: the next location is occupied by a ghost
        if (trackAtBuildLocation.exists === "ghost") {
            debug(`There was a ghost at the location of the selected build. Removing it now.`);
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
            debug(`There is a real track piece at the location of the selected build. Cannot build a preview piece here.
            \nExisting segment: ${JSON.stringify(trackAtBuildLocation.element?.segment?.get())}`);
            this.selectedBuild.set(null);
            return;
        }

        // todo remove the ghost if this edit window closes or another ride is placed on that tile
        // todo the ghost will be remove if the build is reselected, but it'd be nice if it were done on subscription of some sort.
    };

    private onNextBuildPositionChange = (newNextBuildPosition: CoordsXYZD | null): void => {
        debug(`next build position changed to ${JSON.stringify(newNextBuildPosition)}`);
    }

}
