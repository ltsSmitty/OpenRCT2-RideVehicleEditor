import { SelectionButton } from "../objects/rideToggle";
import { store } from "openrct2-flexui";
import { SegmentModel } from "./segmentModel";

export class ButtonSelectorModel {
    readonly selectedButton = store<SelectionButton | null>(null);
    readonly segmentModel = store<SegmentModel | null>(null);

    constructor(model: SegmentModel) {
        this.segmentModel.set(model);
    }
}
