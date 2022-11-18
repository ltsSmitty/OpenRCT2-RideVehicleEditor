import { SegmentModel } from './../viewmodels/segmentModel';
import { ArrayStore } from "openrct2-flexui";
import { TrackElementType } from '../utilities/trackElementType';
import * as actions from '../services/actions';

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
    buttonsPressed.push(buttonType);
    let modelResponse;

    switch (buttonType) {
        case "iterateNext": {
            modelResponse = model.moveToFollowingSegment("next");
            model.buildDirection.set("next");
            break;
        }
        case "iteratePrevious": {
            modelResponse = model.moveToFollowingSegment("previous");
            model.buildDirection.set("previous");
            break;
        }
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
        case "simulate": {
            const thisRide = model.selectedSegment.get()?.get().ride
            modelResponse = actions.beginSimulation(thisRide || 0);
        }

    }
    model.debugButtonChange({ buttonType, isPressed, modelResponse });

};

// const removeAllTurnsExcept()


