import { SegmentModel } from './../viewmodels/segmentModel';
import { ArrayStore } from "openrct2-flexui";

import iterateSelection from './buttonActions/iterateSelection';
import simulateRide from './buttonActions/simulateRide';
import selectSegment from './buttonActions/selectSegment';
import { debug } from '../utilities/logger';
import buildSegment from './buttonActions/buildSegment';

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

type TurnButton = "left1Tile" | "left3Tile" | "left5Tile" | "straightTrack" | "right1Tile" | "right3Tile" | "right5Tile" | "sBendLeft" | "sBendRight" | "leftLargeTurn" | "rightLargeTurn";

type BankingButton = "bankLeft" | "bankRight" | "noBank";

type SteepnessButton = "down90" | "down60" | "down25" | "flat" | "up25" | "up60" | "up90";

type SpecialButton = "special";

type DetailButton = "chainLift" | "boosters" | "camera" | "brakes" | "blockBrakes";

type BuildingButton = "demolish" | "iterateNext" | "select" | "iteratePrevious" | "simulate" | "build" | "entrance" | "exit";


export const buttonToggleChanged = (options: {
    buttonType: SelectionButton,
    isPressed: boolean,
    segmentModel: SegmentModel,
    buttonsPressed: ArrayStore<SelectionButton>
}): void => {

    const { buttonType, isPressed, segmentModel: model, buttonsPressed } = options;
    // do something
    // if isPressed, add buttonType to buttonsPressed, otherwise remove it.
    if (isPressed) {
        debug(`${buttonType} pressed`);
        buttonsPressed.push(buttonType);
    } else {
        debug(`${buttonType} released`);
        const thisIndex = buttonsPressed.get().indexOf(buttonType);
        buttonsPressed.splice(thisIndex, 1);
    }




    let modelResponse;

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
            modelResponse = selectSegment(model, isPressed, buttonsPressed);
            break;
        }
        // action: change selected build
        // action: destroy segment
        // action: build selectedBuild
        case "build": {
            modelResponse = buildSegment(model);
            break;
        }
        // action: place entrance/exit
        // action
        case "left1Tile": {
            modelResponse = model.selectedBuild.set(50); //"LeftQuarterTurn1Tile" = 50,
            break;
        }
        case "left3Tile": {
            modelResponse = model.selectedBuild.set(42); //"LeftQuarterTurn3Tiles" = 42,
            break;
        }
        case "left5Tile": {
            modelResponse = model.selectedBuild.set(16); //    "LeftQuarterTurn5Tiles" = 16,
            break;
        }
        case "straightTrack": {
            modelResponse = model.selectedBuild.set(0); // "Flat" = 0
            // clear all other buttons
            break;
        }
        case "right5Tile": {
            modelResponse = model.selectedBuild.set(17); // "RightQuarterTurn5Tiles" = 17,
            break;
        }
        case "right3Tile": {
            modelResponse = model.selectedBuild.set(43); // "RightQuarterTurn3Tiles" = 43,
            break;
        }
        case "right1Tile": {
            modelResponse = model.selectedBuild.set(51); // "RightQuarterTurn1Tile" = 51,
            break;
        }
    }
    model.debugButtonChange({ buttonType, isPressed, modelResponse });

};
