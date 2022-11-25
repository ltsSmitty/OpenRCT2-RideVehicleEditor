import { ButtonSelectorModel } from "../../viewmodels/buttonSelectorModel"
import { SegmentModel } from "../../viewmodels/segmentModel"
import { BuildWindowButton } from "../buttonActions/buttonTypes";
import * as button from '../buttonActions/buttonTypeChecks';
import { compute } from "openrct2-flexui";
import { debug } from "../../utilities/logger";

export const shouldThisBePressed =
    (buttonType: BuildWindowButton, segmentModel: SegmentModel, buttonSelectorModel: ButtonSelectorModel) => {

        if (button.isBankButton(buttonType)) {
            return compute(buttonSelectorModel.selectedBank, (b) => {
                debug(`shouldThisBePressed: bank button ${buttonType} is ${b === buttonType}`);
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
                debug(`shouldThisBePressed: curve button ${buttonType} is ${b === buttonType}`);
                if (b === buttonType) {
                    return true;
                } else {
                    return false;
                }
            });
        }

        if (button.isPitchButton(buttonType)) {
            return compute(buttonSelectorModel.selectedPitch, (b) => {
                debug(`shouldThisBePressed: pitch button ${buttonType} is ${b === buttonType}`);
                if (b === buttonType) {
                    return true;
                } else {
                    return false;
                }
            });
        }
        return false;
    }
