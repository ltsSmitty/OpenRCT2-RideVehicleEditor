export type CurveButton =
    // direction buttons
    "left1Tile" |
    "left3Tile" |
    "left5Tile" |
    "noCurve" |
    "right1Tile" |
    "right3Tile" |
    "right5Tile" |
    "leftLargeTurn" | //diagonal
    "rightLargeTurn";  //diagonal

export type BankButton =
    // banking
    "bankLeft" |
    "bankRight" |
    "noBank";

export type PitchButton =
    "down90" |
    "down60" |
    "down25" |
    "noPitch" |
    "up25" |
    "up60" |
    "up90";

export type DetailButton =
    "chainLift" |
    "covered";

export type MiscButton =
    "sBendLeft" |
    "sBendRight" |
    "boosters" |
    "camera" |
    "brakes" |
    "blockBrakes" |
    "entrance" |
    "exit";

export type SpecialButton = "special";

export type SelectionControlButton =
    "demolish" |
    "iterateNext" |
    "select" |
    "iteratePrevious" |
    "simulate" |
    "build";

export type BuildWindowButton = SelectionButton | SelectionControlButton;

export type SelectionButton = CurveButton | BankButton | PitchButton | SpecialButton | DetailButton | MiscButton;

export type ButtonPressed<T extends SelectionButton> = {
    [button in T]?: boolean;
};
