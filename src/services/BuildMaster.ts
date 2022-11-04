
import { Segment } from './../objects/segment';
import { SegmentSelector2 } from '../objects/segmentSelector2';
import { SegmentBuildController } from '../objects/buildController';

class BuildMaster {
    segmentSelector: SegmentSelector2;
    buildController: SegmentBuildController;

    constructor() {
        this.segmentSelector = new SegmentSelector2(null);
        this.buildController = new SegmentBuildController();
    }

    setSelected(segment: Segment) {
        this.segmentSelector.updateSegment(segment);
    }


}
