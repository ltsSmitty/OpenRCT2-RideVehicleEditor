import { SegmentModel } from "../../viewmodels/segmentModel";

const iterateSelection = (direction: "next" | "previous", model: SegmentModel) => {
    model.buildDirection.set(direction);
    const actionResponse = model.moveToFollowingSegment(direction);
    return actionResponse;
}

export default iterateSelection;
