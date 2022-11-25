import { ButtonSelectorModel } from "../../viewmodels/buttonSelectorModel"
import { SegmentModel } from "../../viewmodels/segmentModel"
import { BuildWindowButton } from "../buttonActions/buttonTypes"

export const shouldThisBeVisible = (buttonType: BuildWindowButton, isPressed: boolean, segmentModel: SegmentModel, buttonSelectorModel: ButtonSelectorModel): boolean => {
    /**
     * A button should be visible if
     * * it is a valid piece for the ride (aka the segments required to build it are available based on ride type)
     *  *
    */
    return true
}
