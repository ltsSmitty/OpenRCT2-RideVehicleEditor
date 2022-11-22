import { BuildWindowButton, CurveButton, BankButton, PitchButton, DetailButton, MiscButton, SpecialButton, SelectionControlButton } from "./buttonTypes";



export const isCurveButton = (button: BuildWindowButton): button is CurveButton => {
    return button === "left1Tile" ||
        button === "left3Tile" ||
        button === "left5Tile" ||
        button === "noCurve" ||
        button === "right1Tile" ||
        button === "right3Tile" ||
        button === "right5Tile" ||
        button === "leftLargeTurn" ||
        button === "rightLargeTurn";
};

export const isBankButton = (button: BuildWindowButton): button is BankButton => {
    return button === "bankLeft" ||
        button === "bankRight" ||
        button === "noBank";
};

export const isPitchButton = (button: BuildWindowButton): button is PitchButton => {
    return button === "down90" ||
        button === "down60" ||
        button === "down25" ||
        button === "noPitch" ||
        button === "up25" ||
        button === "up60" ||
        button === "up90";
};

export const isDetailButton = (button: BuildWindowButton): button is DetailButton => {
    return button === "chainLift" ||
        button === "covered";
};

export const isMiscButton = (button: BuildWindowButton): button is MiscButton => {
    return button === "boosters" ||
        button === "camera" ||
        button === "brakes" ||
        button === "blockBrakes" ||
        button === "entrance" ||
        button === "exit" ||
        button === "sBendLeft" ||
        button === "sBendRight"
};

export const isSpecialButton = (button: BuildWindowButton): button is SpecialButton => {
    return button === "special";
};

export const isSelectionControlButton = (button: BuildWindowButton): button is SelectionControlButton => {
    return button === "demolish" ||
        button === "iterateNext" ||
        button === "select" ||
        button === "iteratePrevious" ||
        button === "simulate" ||
        button === "build";
};
