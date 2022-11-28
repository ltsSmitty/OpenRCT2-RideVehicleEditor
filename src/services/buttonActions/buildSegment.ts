import { SegmentModel } from "../../viewmodels/segmentModel";

const buildSegment = (model: SegmentModel): void => {
    model.build("real");
    model.moveToFollowingSegment(model.buildDirection.get());
};

export default buildSegment;
