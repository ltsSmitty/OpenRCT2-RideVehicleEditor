import { ArrayStore } from "openrct2-flexui";
import { Segment } from "../../objects/segment";
import { SegmentModel } from "../../viewmodels/segmentModel";
import { SelectionButton } from "../onToggleChange";
import { toggleXYZPicker } from "../segmentPicker";
import * as finder from "../trackElementFinder";

const selectSegment = (model: SegmentModel, isPressed: boolean, buttonsPressed: ArrayStore<SelectionButton>): Segment | null => {
    if (isPressed) { // don't go through this when the toggle turns off.
        model.isPicking.set(isPressed);
        toggleXYZPicker(isPressed,
            (coords) => {
                const elementsOnCoords = finder.getTrackElementsFromCoords(coords);
                model.trackElementsOnSelectedTile.set(elementsOnCoords);

                // update model selectedSegment to 0th val to display in ListView
                // otherwise the Listview will be blank until one is selected from the dropdown
                if (model.trackElementsOnSelectedTile.get().length > 0) {

                    // new segment is selected, so let's clear the buttonsPressed
                    if (buttonsPressed?.get().length > 0) buttonsPressed.set([]);
                    model.selectedSegment.set(elementsOnCoords[0].segment);

                }
            },
            () => {
                model.isPicking.set(false);
            });
    }
    return model.selectedSegment.get();
};

export default selectSegment;
