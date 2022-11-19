import { SegmentModel } from "../../viewmodels/segmentModel";

const buildSegment = (model: SegmentModel): void => {
    model.buildSelectedFollowingPiece();
    model.moveToFollowingSegment(model.buildDirection.get());
};

export default buildSegment;
