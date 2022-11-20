import { button, toggle, store, arrayStore, ButtonParams } from 'openrct2-flexui';
import { SegmentModel } from './segmentModel';

import { ToggleParams, FlexiblePosition, WidgetCreator, compute } from "openrct2-flexui";
import { shouldThisBeDisabled } from "../services/disableToggle";
import { buttonToggleChanged } from "../services/onToggleChange";
import { BuildWindowButton } from "../services/buttonActions/buttonTypes";
import { debug } from '../utilities/logger';
import { ButtonSelectorModel } from './buttonSelectorModel';
// import * as selector from "../utilities/globalButtonSelection";


type ExtendedToggleParams = ToggleParams & {
    buttonType: BuildWindowButton,
}

type ExtendedButtonParams = ButtonParams & {
    buttonType: BuildWindowButton,
}

export class ElementWrapper {


    private segmentModel: SegmentModel;
    private buttonSelectorModel: ButtonSelectorModel;


    constructor(segmentModel: SegmentModel, buttonSelectorModel: ButtonSelectorModel) {
        this.segmentModel = segmentModel;
        this.buttonSelectorModel = buttonSelectorModel;
    }

    public button(params: ExtendedButtonParams & FlexiblePosition): WidgetCreator<FlexiblePosition> {
        const { buttonType, onClick, isPressed, ...rest } = params;
        return button({
            // disabled: shouldThisBeDisabled(buttonType, model),
            disabled: shouldThisBeDisabled(),
            onClick: () => {
                if (onClick) return onClick(); //override default behaviour

                return buttonToggleChanged({ buttonType, isPressed: false, segmentModel: this.segmentModel, buttonsPressed: this.segmentModel.buttonsPressed });
            },
            ...rest
        });

    }

    public toggle(params: ExtendedToggleParams & FlexiblePosition): WidgetCreator<FlexiblePosition> {
        const { buttonType, onChange, isPressed, ...rest } = params;

        return toggle({
            // disabled: shouldThisBeDisabled(buttonType, model),
            disabled: shouldThisBeDisabled({ buttonType, isPressed, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel }),
            onChange: (isPressed?) => {
                if (onChange) return onChange(isPressed); //override default behaviour

                return buttonToggleChanged({ buttonType, isPressed, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel });

            },
            isPressed: isPressed || compute(this.segmentModel.buttonsPressed, buttons => {
                return buttons.indexOf(buttonType) !== -1;
            }),
            ...rest
        });

    }
}
