import { ArrayStore } from "openrct2-flexui";
import { Segment } from "../../objects/segment";
import { debug } from "../../utilities/logger";
import { SegmentModel } from "../../viewmodels/segmentModel";
import { BuildWindowButton } from "./buttonTypes";
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

                // model.buttonsPressed.set([]);
                // update model selectedSegment to 0th val to display in ListView
                // otherwise the Listview will be blank until one is selected from the dropdown
                if (model.trackElementsOnSelectedTile.get().length > 0) {
                    // debug(`a segment was selected: ${model.trackElementsOnSelectedTile.get()[0].segment}`);
                    model.selectedSegment.set(elementsOnCoords[0].segment);
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
