import { TrackElementType } from "../../utilities/trackElementType";
import { Segment } from "../segment";
import { BuildController } from "./CoreInterface";

interface ISegmentSequence {
    segments: Segment[]; // the sequence of segments starting from stationBegin
    nextOpenLocation: CoordsXYZD | null; // the next location to build a segment
    previousOpenLocation: CoordsXYZD | null; // the previous location to build a segment
    buildController: BuildController; // use to store the state of the build values

    //
    queryValidTETToBuild(direction: "next" | "previous"): TrackElementType[]; // return the valid segments to build

    // build from the segmentSequence
    querySegmentsActuallyExist(): boolean[]; // match the indexes with the segments[]
    queryBuildMissingSegment(segment: Segment, callback?: unknown): boolean; // false if the segment cannot be build, true if success

    // connect to other segmentSequences
    canLinkToSegmentSequence(segmentSequence: SegmentSequence): boolean; // check if the segmentSequence can be linked to this segmentSequence
    linkToSegmentSequence(segmentSequence: SegmentSequence): void;

}


export class SegmentSequence implements ISegmentSequence {
    segments: Segment[] = [];

    validateSegmentsActuallyExist(): boolean {
        return this.segments.length > 0;
    }

}
