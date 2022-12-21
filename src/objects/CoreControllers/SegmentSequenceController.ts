import { AvailableTrackSegmentTypes } from './../trackTypeSelector';
import { ButtonsActivelyPressed } from './../../services/buttonToTrackElementMap';
import { SelectionButton, BuildWindowButton } from './../../services/buttonActions/buttonTypes';
import { RideType } from "../../utilities/rideType";
import { TrackElementType } from "../../utilities/trackElementType";
import { Segment } from "../segment";
import { GlobalStateController } from '../GlobalConstructionController';

/** Select all the pieces which a ride can validly build, or all the pieces that it can technically draw */
export type DrawableSegmentBuildRule = "enabled" | "extra" | "covered";

interface IBuildPropContainer {
    segmentBuildRule: DrawableSegmentBuildRule | null;
    buildableSegments: TrackElementType[]
    updateBuildableSegmentsRideType(ridetype: RideType): void; // update the buildableSegments based on the segmentBuildRule
    updateBuildableSegmentsBuildRule(segmentBuildRule: DrawableSegmentBuildRule): void; // update the buildableSegments based on the segmentBuildRule
}


interface IButtonStateContainer {
    buttonsPressed: BuildWindowButton[]
    buttonsActivelyPressed: ButtonsActivelyPressed
}

class ButtonStateContainer implements IButtonStateContainer {
    buttonsPressed: BuildWindowButton[];
    buttonsActivelyPressed: ButtonsActivelyPressed;

    constructor() {
        this.buttonsPressed = [];
        this.buttonsActivelyPressed = {};
    }
}

interface ITrackSegmentValidator {
    // the button state
    buttonStateContainer: ButtonStateContainer;

    // the construction mode
    segmentBuildRule: DrawableSegmentBuildRule | null;

    // potential TETs depending on the segmentBuildRule
    availableTrackSegmentTypes: AvailableTrackSegmentTypes

    // you hope that there will only be one thing in this array, but there may be more than one for various reasons
    // e.g. with extra pieces enabled, the looping coaster has both the flatTo60Up and the flatTo60UpLongBase pieces which use the exact same button state
    validNextBuilds: TrackElementType[]

    /* validating the segment requires:
        * the button state
        * the potential TETs (depending on the segmentBuildRule) ( this needs the rideType if starting from nothing)
        * the build direction (next vs previous)
        * the preceding segment.trackElementType
    */

    computeValidNextBuilds(): TrackElementType[]; // compute the validNextBuilds based on the buttonStateContainer, availableTrackSegmentTypes, and precedingSegment



}


interface ITrackElementValidator {
    rideType: RideType;
    segmentBuildRule: DrawableSegmentBuildRule; // this should live in the buildStateController
    validTrackElementTypes: TrackElementType[];

    getValidTrackElementTypes({ rideType, segmentBuildRule }: { rideType: RideType, segmentBuildRule: DrawableSegmentBuildRule }): TrackElementType[];
}

interface IValidTrackElementTypes {
    rideType: RideType | null;
    precedingTrackElementType: TrackElementType | null;
    direction: "next" | "previous";
    validTrackElementTypes: TrackElementType[];

    getValidTrackElementTypes({ rideType, elementType, direction }:
        { rideType: RideType, elementType: TrackElementType, direction: "next" | "previous" }): TrackElementType[]
}



interface ISegmentSequence {
    globalController: GlobalStateController;
    segments: Segment[]; // the sequence of segments starting from stationBegin
    selectedIndex: number; // the index of the selected segment in segments[]
    selectedSegment: Segment | null; // the selected segment
    nextOpenLocation: CoordsXYZD | null; // the next location to build a segment
    previousOpenLocation: CoordsXYZD | null; // the previous location to build a segment

    // build from the segmentSequence
    querySegmentsActuallyExist(): boolean[]; // match the indexes with the segments[]
    queryBuildMissingSegment(segment: Segment, callback?: unknown): boolean; // false if the segment cannot be build, true if success

    // connect to other segmentSequences
    canLinkToSegmentSequence(otherSegmentSequence: SegmentSequence): boolean; // check if the segmentSequence can be linked to this segmentSequence

    createLinkToSegmentSequence(otherSegmentSequence: SegmentSequence): void;


}


export class SegmentSequence implements ISegmentSequence {
    segments: Segment[] = [];
    selectedIndex: number = 0;
    selectedSegment: Segment | null = null;
    private globalState: GlobalStateController;

    validateSegmentsActuallyExist(): boolean {
        return this.segments.length > 0;
    }

    constructor(globalController: GlobalStateController) {
        this.globalState = globalController;

    }

}
