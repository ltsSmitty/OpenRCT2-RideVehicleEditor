import { debug } from "../../utilities/logger";
import { SegmentModel } from "../../viewmodels/segmentModel";

const iterateSelection = (direction: "next" | "previous", model: SegmentModel): boolean => {
    model.buildDirection.set(direction);
    debug(`Moving toward ${direction}`);
    const actionResponse = model.moveToFollowingSegment();
    return actionResponse;
}

export default iterateSelection;
