import { shouldThisBePressed } from './../services/buttonControls/toggleIsPickedControls';
import { button, toggle, store, arrayStore, ButtonParams } from 'openrct2-flexui';

import { ToggleParams, FlexiblePosition, WidgetCreator } from "openrct2-flexui";
import { shouldThisBeDisabled } from "../services/buttonControls/toggleDisableControls";
import { buttonToggleChanged } from '../services/buttonControls/toggleBehaviourControls';

import { debug } from '../utilities/logger';

import { BuildWindowButton } from "../services/buttonActions/buttonTypes";
import { ButtonSelectorModel } from './buttonSelectorModel';
import { SegmentModel } from './segmentModel';

type ExtendedToggleParams = ToggleParams & {
    buttonType: BuildWindowButton,
};

type ExtendedButtonParams = ButtonParams & {
    buttonType: BuildWindowButton,
};

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
            disabled: shouldThisBeDisabled({ buttonType, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel }),
            onClick: () => {
                if (onClick) return onClick(); //override default behaviour

                return buttonToggleChanged({ buttonType, isPressed: false, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel });
            },
            ...rest
        });

    }

    public toggle(params: ExtendedToggleParams & FlexiblePosition): WidgetCreator<FlexiblePosition> {
        const { buttonType, onChange, isPressed, ...rest } = params;

        return toggle({
            disabled: shouldThisBeDisabled({ buttonType, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel }),
            onChange: (isPressed?) => {
                if (onChange) return onChange(isPressed); //override default behaviour

                return buttonToggleChanged({ buttonType, isPressed, segmentModel: this.segmentModel, buttonSelectorModel: this.buttonSelectorModel });

            },
            isPressed: shouldThisBePressed(buttonType, this.segmentModel, this.buttonSelectorModel),
            ...rest
        });

    }
}


