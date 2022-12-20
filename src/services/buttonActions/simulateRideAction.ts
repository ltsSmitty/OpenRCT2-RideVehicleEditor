import { SegmentModel } from "../../viewmodels/segmentModel";
import * as actions from "../actions";

const simulateRide = (model: SegmentModel, activate: boolean) => {
    const thisRide = model.selectedSegment.get()?.get().ride;
    return actions.simulateRide(thisRide || 0, activate);
}

export default simulateRide;
