import { button, toggle, store, arrayStore, ButtonParams } from 'openrct2-flexui';
import { SegmentModel } from './segmentModel';

import { ToggleParams, FlexiblePosition, WidgetCreator, compute } from "openrct2-flexui";
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
}

type ExtendedButtonParams = ButtonParams & {
    buttonType: SelectionButton,
}

export class ElementWrapper {

    private buttonsPressed = arrayStore<SelectionButton>([]);
    private segmentModel: SegmentModel;
    // private


    constructor(segmentModel: SegmentModel) {
        this.segmentModel = segmentModel;
    }

    public button(params: ExtendedButtonParams & FlexiblePosition): WidgetCreator<FlexiblePosition> {
        const { buttonType, onClick, isPressed, ...rest } = params;
        return button({
            // disabled: shouldThisBeDisabled(buttonType, model),
            disabled: shouldThisBeDisabled(),
            onClick: () => {
                if (onClick) return onClick(); //override default behaviour

                return buttonToggleChanged({ buttonType, isPressed: false, segmentModel: this.segmentModel, buttonsPressed: this.buttonsPressed });
            },
            ...rest
        });

    }

    public toggle(params: ExtendedToggleParams & FlexiblePosition): WidgetCreator<FlexiblePosition> {
        const { buttonType, onChange, isPressed, ...rest } = params;
        return toggle({
            // disabled: shouldThisBeDisabled(buttonType, model),
            disabled: shouldThisBeDisabled(),
            onChange: (isPressed?) => {
                if (onChange) return onChange(isPressed); //override default behaviour

                if (isPressed) {
                    return buttonToggleChanged({ buttonType, isPressed, segmentModel: this.segmentModel, buttonsPressed: this.buttonsPressed });
                }
            },
            isPressed: isPressed || compute(this.buttonsPressed, buttons => {
                return buttons.indexOf(buttonType) !== -1;
            }),
            ...rest
        });

    }
}
