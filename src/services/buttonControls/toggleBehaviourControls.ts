import { ButtonSelectorModel } from '../../viewmodels/buttonSelectorModel';
import { SegmentModel } from '../../viewmodels/segmentModel';

import iterateSelection from '../buttonActions/iterateSelection';
import simulateRide from '../buttonActions/simulateRide';
import selectSegment from '../buttonActions/selectSegment';
import { debug } from '../../utilities/logger';
import buildSegment from '../buttonActions/buildSegment';
import * as buttonMap from '../buttonToTrackElementMap';
import { BuildWindowButton } from '../buttonActions/buttonTypes';
import * as button from '../buttonActions/buttonTypeChecks';


export const buttonToggleChanged = (options: {
    buttonType: BuildWindowButton,
    isPressed: boolean,
    segmentModel: SegmentModel,
    buttonSelectorModel: ButtonSelectorModel
}): void => {
    const { buttonType, isPressed, segmentModel: model, buttonSelectorModel: buttonModel } = options;
    const buttonsPressed = buttonModel.allSelectedButtons;

    // if isPressed, add buttonType to buttonsPressed, otherwise remove it.
    if (isPressed) {
        debug(`${buttonType} pressed`);
        buttonsPressed.push(buttonType);
    } else {
        debug(`${buttonType} released`);
        const thisIndex = buttonsPressed.get().indexOf(buttonType);
        buttonsPressed.splice(thisIndex, 1);
        // todo maybe return?
    }


    // todo changing any of bank or slope or direction refreshes all of the buttons.


    let modelResponse;

    // If curve button was updated
    if (button.isCurveButton(buttonType)) {
        modelResponse = buttonModel.selectedCurve.set(buttonType);

        // find previous curve in buttonsPressed and remove it
        // const previousCurve = buttonModel.selectedCurve.get();
        // if (previousCurve) {
        //     const previousCurveIndex = buttonsPressed.get().indexOf(previousCurve);
        //     buttonsPressed.splice(previousCurveIndex, 1);
        // }
    }

    // If bank button was updated
    if (button.isBankButton(buttonType)) {
        modelResponse = buttonModel.selectedBank.set(buttonType);

        // find previous bank in buttonsPressed and remove it
        // const previousBank = buttonModel.selectedBank.get();
        // if (previousBank) {
        //     const previousBankIndex = buttonsPressed.get().indexOf(previousBank);
        //     buttonsPressed.splice(previousBankIndex, 1);
        // }
    }

    // If slope button was updated
    if (button.isPitchButton(buttonType)) {
        modelResponse = buttonModel.selectedPitch.set(buttonType);

        // find previous pitch in buttonsPressed and remove it
        // const previousPitch = buttonModel.selectedPitch.get();
        // if (previousPitch) {
        //     const previousPitchIndex = buttonsPressed.get().indexOf(previousPitch);
        //     buttonsPressed.splice(previousPitchIndex, 1);
        // }
    }

    switch (buttonType) {
        // action: iterate track along selected direction
        case "iterateNext":
        case "iteratePrevious": {
            const direction = buttonType === "iterateNext" ? "next" : "previous";
            modelResponse = iterateSelection(direction, model);
            break;
        }

        // action: start simulation
        case "simulate": {
            debug(`isPressed: ${isPressed}`);
            modelResponse = simulateRide(model, isPressed);
            break;
        }

        // action: select segment
        case "select": {
            modelResponse = selectSegment(model, buttonModel, isPressed);
            break;
        }

        // action: build selectedBuild
        case "build": {
            modelResponse = buildSegment(model);
            break;
        }

        // action: destroy segment
        // action: place entrance/exit


        // action: change selected build


        // case "left1Tile": {
        //     modelResponse = model.selectedBuild.set(50); //"LeftQuarterTurn1Tile" = 50,
        //     break;
        // }
        // case "left3Tile": {
        //     modelResponse = model.selectedBuild.set(42); //"LeftQuarterTurn3Tiles" = 42,
        //     break;
        // }
        // case "left5Tile": {
        //     modelResponse = model.selectedBuild.set(16); //    "LeftQuarterTurn5Tiles" = 16,
        //     break;
        // }
        // case "noCurve": {
        //     modelResponse = model.selectedBuild.set(0); // "Flat" = 0
        //     // clear all other buttons
        //     break;
        // }
        // case "right5Tile": {
        //     modelResponse = model.selectedBuild.set(17); // "RightQuarterTurn5Tiles" = 17,
        //     break;
        // }
        // case "right3Tile": {
        //     modelResponse = model.selectedBuild.set(43); // "RightQuarterTurn3Tiles" = 43,
        //     break;
        // }
        // case "right1Tile": {
        //     modelResponse = model.selectedBuild.set(51); // "RightQuarterTurn1Tile" = 51,
        //     break;
        // }
        // case "leftLargeTurn": {
        //     // check if it's already diagonal;
        //     // starting straight uses     "LeftEighthToDiag" = 133,
        //     // starting diagonal uses     "LeftEighthToOrthogonal" = 135,

        //     // change if banked
        //     break;
        // }
        // case "rightLargeTurn": {
        //     // check if it's already diagonal;
        //     // starting straight uses     "RightEighthToDiag" = 134,
        //     // starting diagonal uses     "RightEighthToOrthogonal" = 136,
        //     break;
        // }
        // case "sBendLeft": {
        //     modelResponse = model.selectedBuild.set(38); //   "SBendLeft" = 38,
        //     break;
        // }
        // case "sBendRight": {
        //     modelResponse = model.selectedBuild.set(39); //  "SBendRight" = 39,
        //     break;
        // }

        // details
        case "chainLift": {
            // loop through all the elements of this segment and set "hasChainLift" to true
            break;
        }
        case "boosters": {
            modelResponse = model.selectedBuild.set(100); //     "Booster" = 100,
            break;
        }
        case "camera": {
            modelResponse = model.selectedBuild.set(114); //  "OnRidePhoto" = 114,
            break;
        }
        case "brakes": {
            modelResponse = model.selectedBuild.set(99); //      "Brakes" = 99,
            break;
        }
        case "blockBrakes": {
            modelResponse = model.selectedBuild.set(216); //   "BlockBrakes" = 216,
            break;
        }
    }
    debug(`What pieces could be built given the currently pressed buttons?`)
    buttonMap.getElementsFromGivenButtons(buttonsPressed.get());

    model.debugButtonChange({ buttonType, isPressed, modelResponse });

};
