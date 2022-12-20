import { debug } from "../../utilities/logger";
import { SegmentModel } from "../../viewmodels/segmentModel";

const buildSegment = (model: SegmentModel): void => {
    debug(`\nConstructing segment.\n`);
    model.build("real");
    debug(`\nSegment constructed. Moving to the new segment.\n`);
    model.moveToFollowingSegment();
};

export default buildSegment;
