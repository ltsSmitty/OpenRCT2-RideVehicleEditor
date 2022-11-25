import { ButtonSelectorModel } from "../../viewmodels/buttonSelectorModel"
import { SegmentModel } from "../../viewmodels/segmentModel"
import { BuildWindowButton } from "../buttonActions/buttonTypes";
import * as button from '../buttonActions/buttonTypeChecks';
import { compute } from "openrct2-flexui";

export const shouldThisBePressed =
    (buttonType: BuildWindowButton, segmentModel: SegmentModel, buttonSelectorModel: ButtonSelectorModel) => {

        //if it is a bankButton, return compute of the buttonSelectorModel.allBankButtonsPressed if it's pressed return false
        if (button.isBankButton(buttonType)) {
            return compute(buttonSelectorModel.selectedBank, (b) => {
                if (b === buttonType) {
                    return true;
                } else {
                    return false;
                }
            });
        }
        // do the same with curve and pitch
        if (button.isCurveButton(buttonType)) {
            return compute(buttonSelectorModel.selectedCurve, (b) => {
                if (b === buttonType) {
                    return true;
                } else {
                    return false;
                }
            });
        }

        if (button.isPitchButton(buttonType)) {
            return compute(buttonSelectorModel.selectedPitch, (b) => {
                if (b === buttonType) {
                    return true;
                } else {
                    return false;
                }
            });
        }
        return false;
    }
