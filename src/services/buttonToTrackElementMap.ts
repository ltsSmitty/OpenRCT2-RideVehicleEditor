import { SelectionControlButton } from './buttonActions/buttonTypes';
/* eslint-disable prefer-const */
import { TrackElementType } from './../utilities/trackElementType';
import { CurveButton, PitchButton, BankButton, SpecialButton, DetailButton, SelectionButton, MiscButton } from './../services/buttonActions/buttonTypes';
import { debug } from '../utilities/logger';
import _ from 'lodash-es';

/**
 * The set of buttons which are actively pressed (excludes buttons which are pressed but which are disabled).
 */
export type ButtonsActivelyPressed = {
    curve?: CurveButton;
    pitch?: PitchButton;
    bank?: BankButton;
    special?: SpecialButton;
    misc?: MiscButton;
    detail?: DetailButton[];
    other?: SelectionControlButton;
};

type ButtonToElementMap = Record<TrackElementType, ButtonsActivelyPressed>;


// polyfill for Object.values
if (!Object.values) {
    Object.values = function (obj: { [x: string]: unknown; }): unknown[] {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    };
}

export const getButtonsForElement = (element: TrackElementType): SelectionButton[] => {
    const buttonSet = trackElementToButtonMap[element];
    const buttons = _.flatMap(Object.values(buttonSet));
    return buttons;
};

// todo actually write this out
const getTrackElementTypesByRideType = (rideType: number): TrackElementType[] => {
    // return all the TrackELementTypes
    return Object.keys(trackElementToButtonMap).map((key) => parseInt(key)) as TrackElementType[];
};

export const getValidButtonSetForRideType = (rideType: number): SelectionButton[] => {
    const validElements = getTrackElementTypesByRideType(rideType);

    const buttonsForELements = validElements.map(element => getButtonsForElement(element));
    const allButtons = _.flatMapDeep(buttonsForELements);
    const uniqueButtons = _.uniq(allButtons);
    return uniqueButtons;
};

const trackElementToButtonMap: ButtonToElementMap = {
    // Go through each TrackELementType and store the array of buttons that are needed to place the element
    0: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Flat
    1: { special: `special` }, // EndStation
    2: { special: `special` }, // BeginStation
    3: { special: `special` }, // MiddleStation
    4: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // Up25
    5: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // Up60
    6: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // FlatToUp25
    7: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // Up25ToUp60
    8: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // Up60ToUp25
    9: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Up25ToFlat
    10: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // Down25
    11: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // Down60
    12: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // FlatToDown25
    13: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // Down25ToDown60
    14: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // Down60ToDown25
    15: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Down25ToFlat
    16: { curve: 'left5Tile', pitch: 'noPitch', bank: 'noBank' }, // LeftQuarterTurn5Tiles
    17: { curve: 'right5Tile', pitch: 'noPitch', bank: 'noBank' }, // RightQuarterTurn5Tiles
    18: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // FlatToLeftBank
    19: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // FlatToRightBank
    20: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankToFlat
    21: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankToFlat
    22: { curve: 'left5Tile', pitch: 'noPitch', bank: 'bankLeft' }, // BankedLeftQuarterTurn5Tiles
    23: { curve: 'right5Tile', pitch: 'noPitch', bank: 'bankRight' }, // BankedRightQuarterTurn5Tiles
    24: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // LeftBankToUp25
    25: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // RightBankToUp25
    26: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // Up25ToLeftBank
    27: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // Up25ToRightBank
    28: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // LeftBankToDown25
    29: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // RightBankToDown25
    30: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // Down25ToLeftBank
    31: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // Down25ToRightBank
    32: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // LeftBank
    33: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // RightBank
    34: { curve: 'left5Tile', pitch: 'up25', bank: 'noBank' }, // LeftQuarterTurn5TilesUp25
    35: { curve: 'right5Tile', pitch: 'up25', bank: 'noBank' }, // RightQuarterTurn5TilesUp25
    36: { curve: 'left5Tile', pitch: 'down25', bank: 'noBank' }, // LeftQuarterTurn5TilesDown25
    37: { curve: 'right5Tile', pitch: 'down25', bank: 'noBank' }, // RightQuarterTurn5TilesDown25
    38: { misc: 'sBendLeft' }, // SBendLeft
    39: { misc: 'sBendRight' }, // SBendRight
    40: { special: `special` }, // LeftVerticalLoop
    41: { special: `special` }, // RightVerticalLoop
    42: { curve: 'left3Tile', pitch: 'noPitch', bank: 'noBank' }, // LeftQuarterTurn3Tiles
    43: { curve: 'right3Tile', pitch: 'noPitch', bank: 'noBank' }, // RightQuarterTurn3Tiles
    44: { curve: 'left3Tile', pitch: 'noPitch', bank: 'bankLeft' }, // LeftBankedQuarterTurn3Tiles
    45: { curve: 'right3Tile', pitch: 'noPitch', bank: 'bankRight' }, // RightBankedQuarterTurn3Tiles
    46: { curve: 'left3Tile', pitch: 'up25', bank: 'noBank' }, // LeftQuarterTurn3TilesUp25
    47: { curve: 'right3Tile', pitch: 'up25', bank: 'noBank' }, // RightQuarterTurn3TilesUp25
    48: { curve: 'left3Tile', pitch: 'down25', bank: 'noBank' }, // LeftQuarterTurn3TilesDown25
    49: { curve: 'right3Tile', pitch: 'down25', bank: 'noBank' }, // RightQuarterTurn3TilesDown25
    50: { curve: 'left1Tile', pitch: 'noPitch', bank: 'noBank' }, // LeftQuarterTurn1Tile
    51: { curve: 'right1Tile', pitch: 'noPitch', bank: 'noBank' }, // RightQuarterTurn1Tile
    52: { special: `special` }, // LeftTwistDownToUp
    53: { special: `special` }, // RightTwistDownToUp
    54: { special: `special` }, // LeftTwistUpToDown
    55: { special: `special` }, // RightTwistUpToDown
    56: { special: `special` }, // HalfLoopUp
    57: { special: `special` }, // HalfLoopDown
    58: { special: `special` }, // LeftCorkscrewUp
    59: { special: `special` }, // RightCorkscrewUp
    60: { special: `special` }, // LeftCorkscrewDown
    61: { special: `special` }, // RightCorkscrewDown
    62: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // FlatToUp60
    63: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Up60ToFlat
    64: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // FlatToDown60
    65: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Down60ToFlat
    66: { special: `special` }, // TowerBase
    67: { special: `special` }, // TowerSection
    68: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // FlatCovered
    69: { curve: 'noCurve', pitch: 'up25', bank: 'noBank', detail: ["covered"] }, // Up25Covered
    70: { curve: 'noCurve', pitch: 'up60', bank: 'noBank', detail: ["covered"] }, // Up60Covered
    71: { curve: 'noCurve', pitch: 'up25', bank: 'noBank', detail: ["covered"] }, // FlatToUp25Covered
    72: { curve: 'noCurve', pitch: 'up60', bank: 'noBank', detail: ["covered"] }, // Up25ToUp60Covered
    73: { curve: 'noCurve', pitch: 'up25', bank: 'noBank', detail: ["covered"] }, // Up60ToUp25Covered
    74: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // Up25ToFlatCovered
    75: { curve: 'noCurve', pitch: 'down25', bank: 'noBank', detail: ["covered"] }, // Down25Covered
    76: { curve: 'noCurve', pitch: 'down60', bank: 'noBank', detail: ["covered"] }, // Down60Covered
    77: { curve: 'noCurve', pitch: 'down25', bank: 'noBank', detail: ["covered"] }, // FlatToDown25Covered
    78: { curve: 'noCurve', pitch: 'down60', bank: 'noBank', detail: ["covered"] }, // Down25ToDown60Covered
    79: { curve: 'noCurve', pitch: 'down25', bank: 'noBank', detail: ["covered"] }, // Down60ToDown25Covered
    80: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // Down25ToFlatCovered
    81: { curve: 'left5Tile', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // LeftQuarterTurn5TilesCovered
    82: { curve: 'right5Tile', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // RightQuarterTurn5TilesCovered
    83: { misc: 'sBendLeft', detail: ["covered"] }, // SBendLeftCovered
    84: { misc: 'sBendRight', detail: ["covered"] }, // SBendRightCovered
    85: { curve: 'left3Tile', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // LeftQuarterTurn3TilesCovered
    86: { curve: 'right3Tile', pitch: 'noPitch', bank: 'noBank', detail: ["covered"] }, // RightQuarterTurn3TilesCovered
    87: { special: `special` }, // LeftHalfBankedHelixUpSmall
    88: { special: `special` }, // RightHalfBankedHelixUpSmall
    89: { special: `special` }, // LeftHalfBankedHelixDownSmall
    90: { special: `special` }, // RightHalfBankedHelixDownSmall
    91: { special: `special` }, // LeftHalfBankedHelixUpLarge
    92: { special: `special` }, // RightHalfBankedHelixUpLarge
    93: { special: `special` }, // LeftHalfBankedHelixDownLarge
    94: { special: `special` }, // RightHalfBankedHelixDownLarge
    95: { curve: 'left3Tile', pitch: 'up60', bank: 'noBank' }, // LeftQuarterTurn1TileUp60
    96: { curve: 'right3Tile', pitch: 'up60', bank: 'noBank' }, // RightQuarterTurn1TileUp60
    97: { curve: 'left3Tile', pitch: 'down60', bank: 'noBank' }, // LeftQuarterTurn1TileDown60
    98: { curve: 'right3Tile', pitch: 'down60', bank: 'noBank' }, // RightQuarterTurn1TileDown60
    99: { misc: 'brakes' }, // Brakes and also the RotationControlToggleAlias
    100: { misc: 'boosters' }, // Booster
    101: { special: `special` }, // Maze
    102: { special: `special` }, // LeftQuarterBankedHelixLargeUp
    103: { special: `special` }, // RightQuarterBankedHelixLargeUp
    104: { special: `special` }, // LeftQuarterBankedHelixLargeDown
    105: { special: `special` }, // RightQuarterBankedHelixLargeDown
    106: { special: `special` }, // LeftQuarterHelixLargeUp
    107: { special: `special` }, // RightQuarterHelixLargeUp
    108: { special: `special` }, // LeftQuarterHelixLargeDown
    109: { special: `special` }, // RightQuarterHelixLargeDown
    110: { curve: 'noCurve', pitch: 'up25', bank: 'bankLeft' }, // Up25LeftBanked
    111: { curve: 'noCurve', pitch: 'up25', bank: 'bankRight' }, // Up25RightBanked
    112: { special: `special` }, // Waterfall
    113: { special: `special` }, // Rapids
    114: { misc: 'camera' }, // OnRidePhoto
    115: { curve: 'noCurve', pitch: 'down25', bank: 'bankLeft' }, // Down25LeftBanked
    116: { curve: 'noCurve', pitch: 'down25', bank: 'bankRight' }, // Down25RightBanked
    117: { special: `special` }, // Watersplash
    118: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // FlatToUp60LongBase
    119: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Up60ToFlatLongBase
    120: { special: `special` }, // Whirlpool
    121: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // Down60ToFlatLongBase
    122: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // FlatToDown60LongBase
    123: { special: `special` }, // CableLiftHill
    124: { special: `special` }, // ReverseFreefallSlope
    125: { special: `special` }, // ReverseFreefallVertical
    126: { curve: 'noCurve', pitch: 'up90', bank: 'noBank' }, // Up90
    127: { curve: 'noCurve', pitch: 'down90', bank: 'noBank' }, // Down90
    128: { curve: 'noCurve', pitch: 'up90', bank: 'noBank' }, // Up60ToUp90
    129: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // Down90ToDown60
    130: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // Up90ToUp60
    131: { curve: 'noCurve', pitch: 'down90', bank: 'noBank' }, // Down60ToDown90
    132: { special: `special` }, // BrakeForDrop
    133: { curve: 'leftLargeTurn', pitch: 'noPitch', bank: 'noBank' }, // LeftEighthToDiag
    134: { curve: 'rightLargeTurn', pitch: 'noPitch', bank: 'noBank' }, // RightEighthToDiag
    135: { curve: 'leftLargeTurn', pitch: 'noPitch', bank: 'noBank' }, // LeftEighthToOrthogonal
    136: { curve: 'rightLargeTurn', pitch: 'noPitch', bank: 'noBank' }, // RightEighthToOrthogonal
    137: { curve: 'leftLargeTurn', pitch: 'noPitch', bank: 'bankLeft' }, // LeftEighthBankToDiag
    138: { curve: 'rightLargeTurn', pitch: 'noPitch', bank: 'bankRight' }, // RightEighthBankToDiag
    139: { curve: 'leftLargeTurn', pitch: 'noPitch', bank: 'bankLeft' }, // LeftEighthBankToOrthogonal
    140: { curve: 'rightLargeTurn', pitch: 'noPitch', bank: 'bankRight' }, // RightEighthBankToOrthogonal
    141: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagFlat
    142: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // DiagUp25
    143: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // DiagUp60
    144: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // DiagFlatToUp25
    145: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // DiagUp25ToUp60
    146: { curve: 'noCurve', pitch: 'up25', bank: 'noBank' }, // DiagUp60ToUp25
    147: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagUp25ToFlat
    148: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // DiagDown25
    149: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // DiagDown60
    150: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // DiagFlatToDown25
    151: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // DiagDown25ToDown60
    152: { curve: 'noCurve', pitch: 'down25', bank: 'noBank' }, // DiagDown60ToDown25
    153: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagDown25ToFlat
    154: { curve: 'noCurve', pitch: 'up60', bank: 'noBank' }, // DiagFlatToUp60
    155: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagUp60ToFlat
    156: { curve: 'noCurve', pitch: 'down60', bank: 'noBank' }, // DiagFlatToDown60
    157: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagDown60ToFlat
    158: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // DiagFlatToLeftBank
    159: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // DiagFlatToRightBank
    160: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagLeftBankToFlat
    161: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // DiagRightBankToFlat
    162: { curve: 'noCurve', pitch: 'up25', bank: 'bankLeft' }, // DiagLeftBankToUp25
    163: { curve: 'noCurve', pitch: 'up25', bank: 'bankRight' }, // DiagRightBankToUp25
    164: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // DiagUp25ToLeftBank
    165: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // DiagUp25ToRightBank
    166: { curve: 'noCurve', pitch: 'down25', bank: 'bankLeft' }, // DiagLeftBankToDown25
    167: { curve: 'noCurve', pitch: 'down25', bank: 'bankRight' }, // DiagRightBankToDown25
    168: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // DiagDown25ToLeftBank
    169: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // DiagDown25ToRightBank
    170: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // DiagLeftBank
    171: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // DiagRightBank
    172: { special: `special` }, // LogFlumeReverser
    173: { special: `special` }, // SpinningTunnel
    174: { special: `special` }, // LeftBarrelRollUpToDown
    175: { special: `special` }, // RightBarrelRollUpToDown
    176: { special: `special` }, // LeftBarrelRollDownToUp
    177: { special: `special` }, // RightBarrelRollDownToUp
    178: { curve: 'left3Tile', pitch: 'up25', bank: 'noBank' }, // LeftBankToLeftQuarterTurn3TilesUp25
    179: { curve: 'right3Tile', pitch: 'up25', bank: 'noBank' }, // RightBankToRightQuarterTurn3TilesUp25
    180: { curve: 'left3Tile', pitch: 'down25', bank: 'noBank' }, // LeftQuarterTurn3TilesDown25ToLeftBank
    181: { curve: 'right3Tile', pitch: 'down25', bank: 'noBank' }, // RightQuarterTurn3TilesDown25ToRightBank
    182: { special: `special` }, // PoweredLift
    183: { special: `special` }, // LeftLargeHalfLoopUp
    184: { special: `special` }, // RightLargeHalfLoopUp
    185: { special: `special` }, // RightLargeHalfLoopDown
    186: { special: `special` }, // LeftLargeHalfLoopDown
    187: { special: `special` }, // LeftFlyerTwistUp
    188: { special: `special` }, // RightFlyerTwistUp
    189: { special: `special` }, // LeftFlyerTwistDown
    190: { special: `special` }, // RightFlyerTwistDown
    191: { special: `special` }, // FlyerHalfLoopUninvertedUp
    192: { special: `special` }, // FlyerHalfLoopInvertedDown
    193: { special: `special` }, // LeftFlyerCorkscrewUp
    194: { special: `special` }, // RightFlyerCorkscrewUp
    195: { special: `special` }, // LeftFlyerCorkscrewDown
    196: { special: `special` }, // RightFlyerCorkscrewDown
    197: { special: `special` }, // HeartLineTransferUp
    198: { special: `special` }, // HeartLineTransferDown
    199: { special: `special` }, // LeftHeartLineRoll
    200: { special: `special` }, // RightHeartLineRoll
    201: { special: `special` }, // MinigolfHoleA
    202: { special: `special` }, // MinigolfHoleB
    203: { special: `special` }, // MinigolfHoleC
    204: { special: `special` }, // MinigolfHoleD
    205: { special: `special` }, // MinigolfHoleE
    206: { special: `special` }, // MultiDimInvertedFlatToDown90QuarterLoop
    207: { special: `special` }, // Up90ToInvertedFlatQuarterLoop
    208: { special: `special` }, // InvertedFlatToDown90QuarterLoop
    209: { special: `special` }, // LeftCurvedLiftHill
    210: { special: `special` }, // RightCurvedLiftHill
    211: { special: `special` }, // LeftReverser
    212: { special: `special` }, // RightReverser
    213: { special: `special` }, // AirThrustTopCap
    214: { special: `special` }, // AirThrustVerticalDown
    215: { special: `special` }, // AirThrustVerticalDownToLevel
    216: { misc: 'blockBrakes' }, // BlockBrakes
    217: { curve: 'left3Tile', pitch: 'up25', bank: 'bankLeft' }, // LeftBankedQuarterTurn3TileUp25
    218: { curve: 'right3Tile', pitch: 'up25', bank: 'bankRight' }, // RightBankedQuarterTurn3TileUp25
    219: { curve: 'left3Tile', pitch: 'down25', bank: 'bankLeft' }, // LeftBankedQuarterTurn3TileDown25
    220: { curve: 'right3Tile', pitch: 'down25', bank: 'bankRight' }, // RightBankedQuarterTurn3TileDown25
    221: { curve: 'left5Tile', pitch: 'up25', bank: 'bankLeft' }, // LeftBankedQuarterTurn5TileUp25
    222: { curve: 'right5Tile', pitch: 'up25', bank: 'bankRight' }, // RightBankedQuarterTurn5TileUp25
    223: { curve: 'left5Tile', pitch: 'down25', bank: 'bankLeft' }, // LeftBankedQuarterTurn5TileDown25
    224: { curve: 'right5Tile', pitch: 'down25', bank: 'bankRight' }, // RightBankedQuarterTurn5TileDown25
    225: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // Up25ToLeftBankedUp25
    226: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // Up25ToRightBankedUp25
    227: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankedUp25ToUp25
    228: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankedUp25ToUp25
    229: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // Down25ToLeftBankedDown25
    230: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // Down25ToRightBankedDown25
    231: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankedDown25ToDown25
    232: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankedDown25ToDown25
    233: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // LeftBankedFlatToLeftBankedUp25
    234: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // RightBankedFlatToRightBankedUp25
    235: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // LeftBankedUp25ToLeftBankedFlat
    236: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // RightBankedUp25ToRightBankedFlat
    237: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // LeftBankedFlatToLeftBankedDown25
    238: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // RightBankedFlatToRightBankedDown25
    239: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankedDown25ToLeftBankedFlat
    240: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankedDown25ToRightBankedFlat
    241: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // FlatToLeftBankedUp25
    242: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // FlatToRightBankedUp25
    243: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankedUp25ToFlat
    244: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankedUp25ToFlat
    245: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankLeft' }, // FlatToLeftBankedDown25
    246: { curve: 'noCurve', pitch: 'noPitch', bank: 'bankRight' }, // FlatToRightBankedDown25
    247: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // LeftBankedDown25ToFlat
    248: { curve: 'noCurve', pitch: 'noPitch', bank: 'noBank' }, // RightBankedDown25ToFlat
    249: { curve: 'left3Tile', pitch: 'up90', bank: 'noBank' }, // LeftQuarterTurn1TileUp90
    250: { curve: 'right3Tile', pitch: 'up90', bank: 'noBank' }, // RightQuarterTurn1TileUp90
    251: { curve: 'left3Tile', pitch: 'down90', bank: 'noBank' }, // LeftQuarterTurn1TileDown90
    252: { curve: 'right3Tile', pitch: 'down90', bank: 'noBank' }, // RightQuarterTurn1TileDown90
    253: { special: `special` }, // MultiDimUp90ToInvertedFlatQuarterLoop
    254: { special: `special` }, // MultiDimFlatToDown90QuarterLoop
    255: { special: `special` }, // MultiDimInvertedUp90ToFlatQuarterLoop
    256: { special: `special` }, // RotationControlToggle // currently undocumented


    // 257-265: These are unused, and all the pieces after are OpenRCT pieces: {
    267: { special: `special` }, // LeftLargeCorkscrewUp
    268: { special: `special` }, // RightLargeCorkscrewUp
    269: { special: `special` }, // LeftLargeCorkscrewDown
    270: { special: `special` }, // RightLargeCorkscrewDown
    271: { special: `special` }, // LeftMediumHalfLoopUp
    272: { special: `special` }, // RightMediumHalfLoopUp
    273: { special: `special` }, // LeftMediumHalfLoopDown
    274: { special: `special` }, // RightMediumHalfLoopDown
    275: { special: `special` }, // LeftZeroGRollUp
    276: { special: `special` }, // RightZeroGRollUp
    277: { special: `special` }, // LeftZeroGRollDown
    278: { special: `special` }, // RightZeroGRollDown
    279: { special: `special` }, // LeftLargeZeroGRollUp
    280: { special: `special` }, // RightLargeZeroGRollUp
    281: { special: `special` }, // LeftLargeZeroGRollDown
    282: { special: `special` }, // RightLargeZeroGRollDown
    283: { special: `special` }, // LeftFlyerLargeHalfLoopUninvertedUp
    284: { special: `special` }, // RightFlyerLargeHalfLoopUninvertedUp
    285: { special: `special` }, // RightFlyerLargeHalfLoopInvertedDown
    286: { special: `special` }, // LeftFlyerLargeHalfLoopInvertedDown
    287: { special: `special` }, // LeftFlyerLargeHalfLoopInvertedUp
    288: { special: `special` }, // RightFlyerLargeHalfLoopInvertedUp
    289: { special: `special` }, // RightFlyerLargeHalfLoopUninvertedDown
    290: { special: `special` }, // LeftFlyerLargeHalfLoopUninvertedDown
    291: { special: `special` }, // FlyerHalfLoopInvertedUp
    292: { special: `special` }, // FlyerHalfLoopUninvertedDown
};





// export const getValidButtonSetForRideType = (rideType: number): SelectionButton[] => {
//     const validElements = getTrackElementTypesByRideType(rideType);

//     // use validELements as keys to filter trackElementToButtonMap, and accumulate a unique list of buttons
//     const filteredTEBM = Object.keys(trackElementToButtonMap).filter((key) => {
//         return validElements.includes(parseInt(key));
//     });
//     const allButtonMaps = _.flatMapDeep(filteredTEBM.map((key) => {
//         return trackElementToButtonMap[key as unknown as TrackElementType];
//     }));

//     const allButtons = allButtonMaps.map((buttonMap) => {
//         // return an array of all the values of buttonMap
//         return _.flatMapDeep(Object.values(buttonMap)) as SelectionButton[];
//     });

//     // flatten the array of arrays, and remove duplicates
//     return _.uniq(_.flatMapDeep(allButtons));
// }

/**
 *Given the buttons that are pressed, return the track elements that are possible to build. Filtering this response with the direction (next/previous), piece end details, and the current segment (e.g. diagonal, inverted, covered or not), this should narrow down the possible track elements to build to one single piece.
 * @param activelyPressedButtons The buttons which are pressed AND active (i.e. not disabled)
 * @param availableTrackElementTypes The track elements that are available to build. This might include only the standard allowed pieces, or might include the extra pieces that are drawable but not technically allowed to be built.
 * @returns
 */
export const getElementsFromGivenButtons = (activelyPressedButtons: ButtonsActivelyPressed, availableTrackElementTypes: TrackElementType[] = allTrackELementTypes): TrackElementType[] => {

    debug(`Searching for TrackElements that can be built with buttons: ${JSON.stringify(activelyPressedButtons)}`);
    debug(`activelyPressedButtons: ${JSON.stringify(activelyPressedButtons, null, 2)}`);

    const matchingTrackElements = availableTrackElementTypes.filter((element) => {
        const elementButtonMap = trackElementToButtonMap[element];

        const curvesMatch = activelyPressedButtons.curve === elementButtonMap.curve;
        const pitchesMatch = activelyPressedButtons.pitch === elementButtonMap.pitch;
        const banksMatch = activelyPressedButtons.bank === elementButtonMap.bank;
        const miscsMatch = activelyPressedButtons.misc === elementButtonMap.misc;
        const specialsMatch = activelyPressedButtons.special === elementButtonMap.special;
        const detailsMatch = (activelyPressedButtons.detail?.length == 0 && elementButtonMap.detail?.length == 0) ||
            activelyPressedButtons.detail?.every((detail, index) => (elementButtonMap.detail && detail === elementButtonMap.detail[index]));


        return curvesMatch && pitchesMatch && banksMatch && miscsMatch && specialsMatch && detailsMatch;
    });

    // console.log(`matchingTrackElements: ${JSON.stringify(matchingTrackElements, null, 2)}`)
    return matchingTrackElements;
};

const allTrackELementTypes = Object.keys(trackElementToButtonMap).map((key) => parseInt(key)) as TrackElementType[];

// const trackElementToButtonMap: ButtonToElementMap = {
//     // Go through each TrackELementType and store the array of buttons that are needed to place the element
//     [TrackElementType.Flat]: // 0
//         ["noCurve", "noPitch", "noBank"],  // Flat
//     [TrackElementType.EndStation]: // 1
//         ["special"],
//     [TrackElementType.BeginStation]: // 2
//         ["special"],
//     [TrackElementType.MiddleStation]: // 3
//         ["special"],
//     [TrackElementType.Up25]: // 4
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.Up60]: // 5
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.FlatToUp25]: // 6
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.Up25ToUp60]: // 7
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.Up60ToUp25]: // 8
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.Up25ToFlat]: // 9
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.Down25]: // 10
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.Down60]: // 11
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.FlatToDown25]: // 12
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.Down25ToDown60]: // 13
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.Down60ToDown25]: // 14
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.Down25ToFlat]: // 15
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.LeftQuarterTurn5Tiles]: // 16
//         ["left5Tile", "noPitch", "noBank"],
//     [TrackElementType.RightQuarterTurn5Tiles]: // 17
//         ["right5Tile", "noPitch", "noBank"],
//     [TrackElementType.FlatToLeftBank]: // 18
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.FlatToRightBank]: // 19
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankToFlat]: // 20
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankToFlat]: // 21
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.BankedLeftQuarterTurn5Tiles]: // 22
//         ["left5Tile", "noPitch", "bankLeft"],
//     [TrackElementType.BankedRightQuarterTurn5Tiles]: // 23
//         ["right5Tile", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankToUp25]: // 24
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.RightBankToUp25]: // 25
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.Up25ToLeftBank]: // 26
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.Up25ToRightBank]: // 27
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankToDown25]: // 28
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.RightBankToDown25]: // 29
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.Down25ToLeftBank]: // 30
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.Down25ToRightBank]: // 31
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBank]: // 32
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.RightBank]: // 33
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftQuarterTurn5TilesUp25]: // 34
//         ["left5Tile", "up25", "noBank"],//
//     [TrackElementType.RightQuarterTurn5TilesUp25]: // 35
//         ["right5Tile", "up25", "noBank"],
//     [TrackElementType.LeftQuarterTurn5TilesDown25]: // 36
//         ["left5Tile", "down25", "noBank"],
//     [TrackElementType.RightQuarterTurn5TilesDown25]: // 37
//         ["right5Tile", "down25", "noBank"],
//     [TrackElementType.SBendLeft]: // 38
//         ["sBendLeft"],
//     [TrackElementType.SBendRight]: // 39
//         ["sBendRight"],
//     [TrackElementType.LeftVerticalLoop]: // 40
//         ["special"],
//     [TrackElementType.RightVerticalLoop]: // 41
//         ["special"],
//     [TrackElementType.LeftQuarterTurn3Tiles]: // 42
//         ["left3Tile", "noPitch", "noBank"],
//     [TrackElementType.RightQuarterTurn3Tiles]: // 43
//         ["right3Tile", "noPitch", "noBank"],
//     [TrackElementType.LeftBankedQuarterTurn3Tiles]: // 44
//         ["left3Tile", "noPitch", "bankLeft"],
//     [TrackElementType.RightBankedQuarterTurn3Tiles]: // 45
//         ["right3Tile", "noPitch", "bankRight"],
//     [TrackElementType.LeftQuarterTurn3TilesUp25]: // 46
//         ["left3Tile", "up25", "noBank"],
//     [TrackElementType.RightQuarterTurn3TilesUp25]: // 47
//         ["right3Tile", "up25", "noBank"],
//     [TrackElementType.LeftQuarterTurn3TilesDown25]: // 48
//         ["left3Tile", "down25", "noBank"],
//     [TrackElementType.RightQuarterTurn3TilesDown25]: // 49
//         ["right3Tile", "down25", "noBank"],
//     [TrackElementType.LeftQuarterTurn1Tile]: // 50
//         ["left1Tile", "noPitch", "noBank"],
//     [TrackElementType.RightQuarterTurn1Tile]: // 51
//         ["right1Tile", "noPitch", "noBank"],
//     //     [TrackElementType.LeftTwistDownToUp]: // 52 //todo what are these?
//     // [TrackElementType.RightTwistDownToUp]: // 53
//     //     [TrackElementType.LeftTwistUpToDown]: // 54
//     // [TrackElementType.RightTwistUpToDown]: // 55
//     [TrackElementType.HalfLoopUp]: // 56
//         ["special"],
//     [TrackElementType.HalfLoopDown]: // 57
//         ["special"],
//     [TrackElementType.LeftCorkscrewUp]: // 58
//         ["special"],
//     [TrackElementType.RightCorkscrewUp]: // 59
//         ["special"],
//     [TrackElementType.LeftCorkscrewDown]: // 60
//         ["special"],
//     [TrackElementType.RightCorkscrewDown]: // 61
//         ["special"],
//     [TrackElementType.FlatToUp60]: // 62
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.Up60ToFlat]: // 63
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.FlatToDown60]: // 64
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.Down60ToFlat]: // 65
//         ["noCurve", "noPitch", "noBank"],
//     // [TrackElementType.TowerBase]: // 66
//     //     [TrackElementType.TowerSection]: // 67

//     [TrackElementType.FlatCovered]: // 68
//         ["noCurve", "noPitch", "noBank", "covered"],
//     [TrackElementType.Up25Covered]: // 69
//         ["noCurve", "up25", "noBank", "covered"],
//     [TrackElementType.Up60Covered]: // 70
//         ["noCurve", "up60", "noBank", "covered"],
//     [TrackElementType.FlatToUp25Covered]: // 71
//         ["noCurve", "up25", "noBank", "covered"],
//     [TrackElementType.Up25ToUp60Covered]: // 72
//         ["noCurve", "up60", "noBank", "covered"],
//     [TrackElementType.Up60ToUp25Covered]: // 73
//         ["noCurve", "up25", "noBank", "covered"],
//     [TrackElementType.Up25ToFlatCovered]: // 74
//         ["noCurve", "noPitch", "noBank", "covered"],
//     [TrackElementType.Down25Covered]: // 75
//         ["noCurve", "down25", "noBank", "covered"],
//     [TrackElementType.Down60Covered]: // 76
//         ["noCurve", "down60", "noBank", "covered"],
//     [TrackElementType.FlatToDown25Covered]: // 77
//         ["noCurve", "down25", "noBank", "covered"],
//     [TrackElementType.Down25ToDown60Covered]: // 78
//         ["noCurve", "down60", "noBank", "covered"],
//     [TrackElementType.Down60ToDown25Covered]: // 79
//         ["noCurve", "down25", "noBank", "covered"],
//     [TrackElementType.Down25ToFlatCovered]: // 80
//         ["noCurve", "noPitch", "noBank", "covered"],
//     [TrackElementType.LeftQuarterTurn5TilesCovered]: // 81
//         ["left5Tile", "noPitch", "noBank", "covered"],
//     [TrackElementType.RightQuarterTurn5TilesCovered]: // 82
//         ["right5Tile", "noPitch", "noBank", "covered"],
//     [TrackElementType.SBendLeftCovered]: // 83
//         ["sBendLeft", "covered"],
//     [TrackElementType.SBendRightCovered]: // 84
//         ["sBendRight", "covered"],
//     [TrackElementType.LeftQuarterTurn3TilesCovered]: // 85
//         ["left3Tile", "noPitch", "noBank", "covered"],
//     [TrackElementType.RightQuarterTurn3TilesCovered]: // 86
//         ["right3Tile", "noPitch", "noBank", "covered"],

//     // todo do i use a helix button or special?
//     [TrackElementType.LeftHalfBankedHelixUpSmall]: // 87
//         ["special"],
//     [TrackElementType.RightHalfBankedHelixUpSmall]: // 88
//         ["special"],
//     [TrackElementType.LeftHalfBankedHelixDownSmall]: // 89
//         ["special"],
//     [TrackElementType.RightHalfBankedHelixDownSmall]: // 90
//         ["special"],
//     [TrackElementType.LeftHalfBankedHelixUpLarge]: // 91
//         ["special"],
//     [TrackElementType.RightHalfBankedHelixUpLarge]: // 92
//         ["special"],
//     [TrackElementType.LeftHalfBankedHelixDownLarge]: // 93
//         ["special"],
//     [TrackElementType.RightHalfBankedHelixDownLarge]: // 94
//         ["special"],
//     [TrackElementType.LeftQuarterTurn1TileUp60]: // 95 these is intentionally different since it's the only 1-tile 60
//         ["left3Tile", "up60", "noBank"],
//     [TrackElementType.RightQuarterTurn1TileUp60]: // 96
//         ["right3Tile", "up60", "noBank"],
//     [TrackElementType.LeftQuarterTurn1TileDown60]: // 97
//         ["left3Tile", "down60", "noBank"],
//     [TrackElementType.RightQuarterTurn1TileDown60]: // 98
//         ["right3Tile", "down60", "noBank"],
//     [TrackElementType.Brakes]: // 99
//         ["brakes"],
//     // [TrackElementType.RotationControlToggleAlias]: // 100
//     [TrackElementType.Booster]: // 101
//         ["boosters"],
//     // [TrackElementType.Maze]: // 102
//     [TrackElementType.LeftQuarterBankedHelixLargeUp]: // 103
//         ["special"],
//     [TrackElementType.RightQuarterBankedHelixLargeUp]: // 104
//         ["special"],
//     [TrackElementType.LeftQuarterBankedHelixLargeDown]: // 105
//         ["special"],
//     [TrackElementType.RightQuarterBankedHelixLargeDown]: // 106
//         ["special"],
//     [TrackElementType.LeftQuarterHelixLargeUp]: // 107
//         ["special"],
//     [TrackElementType.RightQuarterHelixLargeUp]: // 108
//         ["special"],
//     [TrackElementType.LeftQuarterHelixLargeDown]: // 109
//         ["special"],
//     [TrackElementType.RightQuarterHelixLargeDown]: // 110
//         ["special"],
//     [TrackElementType.Up25LeftBanked]: // 111
//         ["noCurve", "up25", "bankLeft"],
//     [TrackElementType.Up25RightBanked]: // 112
//         ["noCurve", "up25", "bankRight"],
//     [TrackElementType.Waterfall]: // 113
//         ["special"],
//     [TrackElementType.Rapids]: // 114
//         ["special"],
//     [TrackElementType.OnRidePhoto]: // 115
//         ["camera"],
//     [TrackElementType.Down25LeftBanked]: // 116
//         ["noCurve", "down25", "bankLeft"],
//     [TrackElementType.Down25RightBanked]: // 117
//         ["noCurve", "down25", "bankRight"],
//     [TrackElementType.Watersplash]: // 118
//         ["special"],
//     [TrackElementType.FlatToUp60LongBase]: // 119
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.Up60ToFlatLongBase]: // 120
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.Whirlpool]: // 121
//         ["special"],
//     [TrackElementType.Down60ToFlatLongBase]: // 122
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.FlatToDown60LongBase]: // 123
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.CableLiftHill]: // 124
//         ["special"],
//     [TrackElementType.ReverseFreefallSlope]: // 125
//         ["special"],
//     [TrackElementType.ReverseFreefallVertical]: // 126
//         ["special"],
//     [TrackElementType.Up90]: // 127
//         ["noCurve", "up90", "noBank"],
//     [TrackElementType.Down90]: // 128
//         ["noCurve", "down90", "noBank"],
//     [TrackElementType.Up60ToUp90]: // 129
//         ["noCurve", "up90", "noBank"],
//     [TrackElementType.Down90ToDown60]: // 130
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.Up90ToUp60]: // 131
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.Down60ToDown90]: // 132
//         ["noCurve", "down90", "noBank"],
//     [TrackElementType.BrakeForDrop]: // 133
//         ["special"],
//     [TrackElementType.LeftEighthToDiag]: // 134
//         ["leftLargeTurn", "noPitch", "noBank"],
//     [TrackElementType.RightEighthToDiag]: // 135
//         ["rightLargeTurn", "noPitch", "noBank"],
//     [TrackElementType.LeftEighthToOrthogonal]: // 136
//         ["leftLargeTurn", "noPitch", "noBank"],
//     [TrackElementType.RightEighthToOrthogonal]: // 137
//         ["rightLargeTurn", "noPitch", "noBank"],
//     [TrackElementType.LeftEighthBankToDiag]: // 138
//         ["leftLargeTurn", "noPitch", "bankLeft"],
//     [TrackElementType.RightEighthBankToDiag]: // 139
//         ["rightLargeTurn", "noPitch", "bankRight"],
//     [TrackElementType.LeftEighthBankToOrthogonal]: // 140
//         ["leftLargeTurn", "noPitch", "bankLeft"],
//     [TrackElementType.RightEighthBankToOrthogonal]: // 141
//         ["rightLargeTurn", "noPitch", "bankRight"],
//     [TrackElementType.DiagFlat]: // 142
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagUp25]: // 143
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.DiagUp60]: // 144
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.DiagFlatToUp25]: // 145
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.DiagUp25ToUp60]: // 146
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.DiagUp60ToUp25]: // 147
//         ["noCurve", "up25", "noBank"],
//     [TrackElementType.DiagUp25ToFlat]: // 148
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagDown25]: // 149
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.DiagDown60]: // 150
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.DiagFlatToDown25]: // 151
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.DiagDown25ToDown60]: // 152
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.DiagDown60ToDown25]: // 153
//         ["noCurve", "down25", "noBank"],
//     [TrackElementType.DiagDown25ToFlat]: // 154
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagFlatToUp60]: // 155
//         ["noCurve", "up60", "noBank"],
//     [TrackElementType.DiagUp60ToFlat]: // 156
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagFlatToDown60]: // 157
//         ["noCurve", "down60", "noBank"],
//     [TrackElementType.DiagDown60ToFlat]: // 158
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagFlatToLeftBank]: // 159
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.DiagFlatToRightBank]: // 160
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.DiagLeftBankToFlat]: // 161
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagRightBankToFlat]: // 162
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.DiagLeftBankToUp25]: // 163
//         ["noCurve", "up25", "bankLeft"],
//     [TrackElementType.DiagRightBankToUp25]: // 164
//         ["noCurve", "up25", "bankRight"],
//     [TrackElementType.DiagUp25ToLeftBank]: // 165
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.DiagUp25ToRightBank]: // 166
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.DiagLeftBankToDown25]: // 167
//         ["noCurve", "down25", "bankLeft"],
//     [TrackElementType.DiagRightBankToDown25]: // 168
//         ["noCurve", "down25", "bankRight"],
//     [TrackElementType.DiagDown25ToLeftBank]: // 169
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.DiagDown25ToRightBank]: // 170
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.DiagLeftBank]: // 171
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.DiagRightBank]: // 172
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LogFlumeReverser]: // 173
//         ["special"],
//     [TrackElementType.SpinningTunnel]: // 174
//         ["special"],
//     [TrackElementType.LeftBarrelRollUpToDown]: // 175
//         ["special"],
//     [TrackElementType.RightBarrelRollUpToDown]: // 176
//         ["special"],
//     [TrackElementType.LeftBarrelRollDownToUp]: // 177
//         ["special"],
//     [TrackElementType.RightBarrelRollDownToUp]: // 178
//         ["special"],
//     [TrackElementType.LeftBankToLeftQuarterTurn3TilesUp25]: // 179
//         ["left3Tile", "up25", "noBank"],
//     [TrackElementType.RightBankToRightQuarterTurn3TilesUp25]: // 180
//         ["right3Tile", "up25", "noBank"],
//     [TrackElementType.LeftQuarterTurn3TilesDown25ToLeftBank]: // 181
//         ["left3Tile", "down25", "noBank"],
//     [TrackElementType.RightQuarterTurn3TilesDown25ToRightBank]: // 182
//         ["right3Tile", "down25", "noBank"],
//     [TrackElementType.PoweredLift]: // 183
//         ["special"],
//     [TrackElementType.LeftLargeHalfLoopUp]: // 184
//         ["special"],
//     [TrackElementType.RightLargeHalfLoopUp]: // 185
//         ["special"],
//     [TrackElementType.RightLargeHalfLoopDown]: // 186
//         ["special"],
//     [TrackElementType.LeftLargeHalfLoopDown]: // 187
//         ["special"],
//     [TrackElementType.LeftFlyerTwistUp]: // 188
//         ["special"],
//     [TrackElementType.RightFlyerTwistUp]: // 189
//         ["special"],
//     [TrackElementType.LeftFlyerTwistDown]: // 190
//         ["special"],
//     [TrackElementType.RightFlyerTwistDown]: // 191
//         ["special"],
//     [TrackElementType.FlyerHalfLoopUninvertedUp]: // 192
//         ["special"],
//     [TrackElementType.FlyerHalfLoopInvertedDown]: // 193
//         ["special"],
//     [TrackElementType.LeftFlyerCorkscrewUp]: // 194
//         ["special"],
//     [TrackElementType.RightFlyerCorkscrewUp]: // 195
//         ["special"],
//     [TrackElementType.LeftFlyerCorkscrewDown]: // 196
//         ["special"],
//     [TrackElementType.RightFlyerCorkscrewDown]: // 197
//         ["special"],
//     [TrackElementType.HeartLineTransferUp]: // 198
//         ["special"],
//     [TrackElementType.HeartLineTransferDown]: // 199
//         ["special"],
//     [TrackElementType.LeftHeartLineRoll]: // 200
//         ["special"],
//     [TrackElementType.RightHeartLineRoll]: // 201
//         ["special"],
//     // [TrackElementType.MinigolfHoleA]: // 202
//     //     [TrackElementType.MinigolfHoleB]: // 203
//     // [TrackElementType.MinigolfHoleC]: // 204
//     //     [TrackElementType.MinigolfHoleD]: // 205
//     // [TrackElementType.MinigolfHoleE]: // 206
//     [TrackElementType.MultiDimInvertedFlatToDown90QuarterLoop]: // 207
//         ["special"],
//     [TrackElementType.Up90ToInvertedFlatQuarterLoop]: // 208
//         ["special"],
//     [TrackElementType.InvertedFlatToDown90QuarterLoop]: // 209
//         ["special"],
//     [TrackElementType.LeftCurvedLiftHill]: // 210
//         ["special"],
//     [TrackElementType.RightCurvedLiftHill]: // 211
//         ["special"],
//     [TrackElementType.LeftReverser]: // 212
//         ["special"],
//     [TrackElementType.RightReverser]: // 213
//         ["special"],
//     [TrackElementType.AirThrustTopCap]: // 214
//         ["special"],
//     [TrackElementType.AirThrustVerticalDown]: // 215 // todo i think this and the up version can also be done with down25 and up25
//         ["special"],
//     [TrackElementType.AirThrustVerticalDownToLevel]: // 216
//         ["special"],
//     [TrackElementType.BlockBrakes]: // 217
//         ["blockBrakes"],
//     [TrackElementType.LeftBankedQuarterTurn3TileUp25]: // 218
//         ["left3Tile", "up25", "bankLeft"],
//     [TrackElementType.RightBankedQuarterTurn3TileUp25]: // 219
//         ["right3Tile", "up25", "bankRight"],
//     [TrackElementType.LeftBankedQuarterTurn3TileDown25]: // 220
//         ["left3Tile", "down25", "bankLeft"],
//     [TrackElementType.RightBankedQuarterTurn3TileDown25]: // 221
//         ["right3Tile", "down25", "bankRight"],
//     [TrackElementType.LeftBankedQuarterTurn5TileUp25]: // 222
//         ["left5Tile", "up25", "bankLeft"],
//     [TrackElementType.RightBankedQuarterTurn5TileUp25]: // 223
//         ["right5Tile", "up25", "bankRight"],
//     [TrackElementType.LeftBankedQuarterTurn5TileDown25]: // 224
//         ["left5Tile", "down25", "bankLeft"],
//     [TrackElementType.RightBankedQuarterTurn5TileDown25]: // 225
//         ["right5Tile", "down25", "bankRight"],
//     [TrackElementType.Up25ToLeftBankedUp25]: // 226
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.Up25ToRightBankedUp25]: // 227
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedUp25ToUp25]: // 228
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankedUp25ToUp25]: // 229
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.Down25ToLeftBankedDown25]: // 230
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.Down25ToRightBankedDown25]: // 231
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedDown25ToDown25]: // 232
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankedDown25ToDown25]: // 233
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.LeftBankedFlatToLeftBankedUp25]: // 234
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.RightBankedFlatToRightBankedUp25]: // 235
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedUp25ToLeftBankedFlat]: // 236
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.RightBankedUp25ToRightBankedFlat]: // 237
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedFlatToLeftBankedDown25]: // 238
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.RightBankedFlatToRightBankedDown25]: // 239
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedDown25ToLeftBankedFlat]: // 240
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankedDown25ToRightBankedFlat]: // 241
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.FlatToLeftBankedUp25]: // 242
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.FlatToRightBankedUp25]: // 243
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedUp25ToFlat]: // 244
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankedUp25ToFlat]: // 245
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.FlatToLeftBankedDown25]: // 246
//         ["noCurve", "noPitch", "bankLeft"],
//     [TrackElementType.FlatToRightBankedDown25]: // 247
//         ["noCurve", "noPitch", "bankRight"],
//     [TrackElementType.LeftBankedDown25ToFlat]: // 248
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.RightBankedDown25ToFlat]: // 249
//         ["noCurve", "noPitch", "noBank"],
//     [TrackElementType.LeftQuarterTurn1TileUp90]: // 250
//         ["left3Tile", "up90", "noBank"],
//     [TrackElementType.RightQuarterTurn1TileUp90]: // 251
//         ["right3Tile", "up90", "noBank"],
//     [TrackElementType.LeftQuarterTurn1TileDown90]: // 252 //todo purposely changing this to left3Tile again because vertical coasters don't have any other 1tile turns
//         ["left3Tile", "down90", "noBank"],
//     [TrackElementType.RightQuarterTurn1TileDown90]: // 253
//         ["right3Tile", "down90", "noBank"],
//     [TrackElementType.MultiDimUp90ToInvertedFlatQuarterLoop]: // 254
//         ["special"],
//     [TrackElementType.MultiDimFlatToDown90QuarterLoop]: // 255
//         ["special"],
//     [TrackElementType.MultiDimInvertedUp90ToFlatQuarterLoop]: // 256
//         ["special"],
//     // [TrackElementType.RotationControlToggle]: // 257

//     // New OpenRCT2 track elements
//     [TrackElementType.LeftLargeCorkscrewUp]: // 267
//         ["special"],
//     [TrackElementType.RightLargeCorkscrewUp]: // 268
//         ["special"],
//     [TrackElementType.LeftLargeCorkscrewDown]: // 269
//         ["special"],
//     [TrackElementType.RightLargeCorkscrewDown]: // 270
//         ["special"],
//     [TrackElementType.LeftMediumHalfLoopUp]: // 271
//         ["special"],
//     [TrackElementType.RightMediumHalfLoopUp]: // 272
//         ["special"],
//     [TrackElementType.LeftMediumHalfLoopDown]: // 273
//         ["special"],
//     [TrackElementType.RightMediumHalfLoopDown]: // 274
//         ["special"],
//     [TrackElementType.LeftZeroGRollUp]: // 275
//         ["special"],
//     [TrackElementType.RightZeroGRollUp]: // 276
//         ["special"],
//     [TrackElementType.LeftZeroGRollDown]: // 277
//         ["special"],
//     [TrackElementType.RightZeroGRollDown]: // 278
//         ["special"],
//     [TrackElementType.LeftLargeZeroGRollUp]: // 279
//         ["special"],
//     [TrackElementType.RightLargeZeroGRollUp]: // 280
//         ["special"],
//     [TrackElementType.LeftLargeZeroGRollDown]: // 281
//         ["special"],
//     [TrackElementType.RightLargeZeroGRollDown]: // 282
//         ["special"],
//     [TrackElementType.LeftFlyerLargeHalfLoopUninvertedUp]: // 283
//         ["special"],
//     [TrackElementType.RightFlyerLargeHalfLoopUninvertedUp]: // 284
//         ["special"],
//     [TrackElementType.RightFlyerLargeHalfLoopInvertedDown]: // 285
//         ["special"],
//     [TrackElementType.LeftFlyerLargeHalfLoopInvertedDown]: // 286
//         ["special"],
//     [TrackElementType.LeftFlyerLargeHalfLoopInvertedUp]: // 287
//         ["special"],
//     [TrackElementType.RightFlyerLargeHalfLoopInvertedUp]: // 288
//         ["special"],
//     [TrackElementType.RightFlyerLargeHalfLoopUninvertedDown]: // 289
//         ["special"],
//     [TrackElementType.LeftFlyerLargeHalfLoopUninvertedDown]: // 290
//         ["special"],
//     [TrackElementType.FlyerHalfLoopInvertedUp]: // 291
//         ["special"],
//     [TrackElementType.FlyerHalfLoopUninvertedDown]: // 292
//         ["special"],
// }

