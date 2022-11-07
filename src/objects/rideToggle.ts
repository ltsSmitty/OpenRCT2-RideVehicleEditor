import { ButtonSelectorModel } from './../viewmodels/buttonSelectorModel';
import { toggle, ToggleParams, FlexiblePosition, WidgetCreator, compute } from "openrct2-flexui";
import { shouldThisBeDisabled } from "../services/disableToggle";
import { buttonToggleChanged } from "../services/onToggleChange";
// import * as selector from "../utilities/globalButtonSelection";
export type SelectionButton =
    // direction buttons
    "left1Tile" |
    "left3Tile" |
    "left5Tile" |
    "straightTrack" |
    "right1Tile" |
    "right3Tile" |
    "right5Tile" |
    // large turns and s-bends
    "sBendLeft" |
    "sBendRight" |
    "leftLargeTurn" |
    "rightLargeTurn" |
    // banking
    "bankLeft" |
    "bankRight" |
    "noBank" |
    // steepness
    "down90" |
    "down60" |
    "down25" |
    "flat" |
    "up25" |
    "up60" |
    "up90" |
    // special
    "special" |
    // details
    "chainLift" |
    "boosters" |
    "camera" |
    "brakes" |
    "blockBrakes" |
    // building & selection
    "demolish" |
    "iterateNext" |
    "select" |
    "iteratePrevious" |
    "simulate" |
    "build" |
    "entrance" |
    "exit";

type ExtendedToggleParams = ToggleParams & {
    buttonType: SelectionButton,
    model: ButtonSelectorModel
}

export function rideBuildToggle(params: ExtendedToggleParams & FlexiblePosition, buttonModel: ButtonSelectorModel): WidgetCreator<FlexiblePosition> {
    const { buttonType, onChange, isPressed, ...rest } = params;


    return toggle({
        disabled: shouldThisBeDisabled(buttonType),
        onChange: (isPressed?) => {
            if (onChange) return onChange(isPressed);
            if (isPressed) {
                buttonModel.selectedButton.set(buttonType); // mark that it's pressed.
                return buttonToggleChanged(buttonType, isPressed);
            }
        },
        isPressed: isPressed || compute(buttonModel.selectedButton, selectedButton => {
            return selectedButton === buttonType;
        }), //selector.getGlobalButtonPressed() === buttonType, // unfortunately this isn't going to work since it needs to be computed. I'll have to think about this.
        ...rest
    });

}
