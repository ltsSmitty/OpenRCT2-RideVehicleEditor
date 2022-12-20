import { Segment } from "../../objects/segment";
import { debug } from "../../utilities/logger";
import { SegmentModel } from "../../viewmodels/segmentModel";
import { toggleXYZPicker } from "../segmentPicker";
import * as finder from "../trackElementFinder";
import { ButtonSelectorModel } from "../../viewmodels/buttonSelectorModel";

const selectSegment = (model: SegmentModel, buttonSelectorModel: ButtonSelectorModel, isPressed: boolean): Segment | null => {
    if (isPressed) { // don't go through this when the toggle turns off.
        buttonSelectorModel.isPicking.set(isPressed);

        // open the picker tool
        toggleXYZPicker(isPressed,
            (coords) => {
                const elementsOnCoords = finder.getTrackElementsFromCoords(coords);
                model.trackElementsOnSelectedTile.set(elementsOnCoords);

                if (model.trackElementsOnSelectedTile.get().length > 0) {
                    model.selectedSegment.set(elementsOnCoords[0].segment);
                    model.updateTrackIterator();
                }
            },
            () => {
                debug(`selection finished`);
                buttonSelectorModel.isPicking.set(false);
            });
    }
    return model.selectedSegment.get();
};

export default selectSegment;
