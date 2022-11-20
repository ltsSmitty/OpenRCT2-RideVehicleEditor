/* eslint-disable prefer-const */
import { TrackElementType } from './../utilities/trackElementType';
import { CurveButton, PitchButton, BankButton, SpecialButton, DetailButton, SelectionButton, MiscButton, BuildWindowButton } from './../services/buttonActions/buttonTypes';
import { debug } from '../utilities/logger';

type ButtonPressOptions =
    [CurveButton, PitchButton, BankButton] | //standard buttonToElementMap
    [CurveButton, PitchButton, BankButton, DetailButton] | // standard map + covered/chains
    [CurveButton, PitchButton, BankButton, DetailButton, DetailButton] | // standard map + covered & chains
    [SpecialButton] | // special elements
    [MiscButton];  // booster, camera, brakes, block brakes

type ButtonToElementMap = Partial<Record<TrackElementType, ButtonPressOptions>>;

export const getButtonsForElement = (element: TrackElementType): SelectionButton[] => {
    return trackElementToButtonMap[element] || [];
};

// todo actually write this out
const getTrackELementTypesByRideType = (rideType: number): TrackElementType[] => {
    return [];
}

// Copilot wrote this one. not sure if it actually works
const createFilteredTEBMForRideType = (rideType: number): ButtonToElementMap => {
    const availableTrackElementTypes = getTrackELementTypesByRideType(rideType);
    const filteredTEBM = Object.keys(trackElementToButtonMap).reduce((acc, key) => {
        if (availableTrackElementTypes.includes(key as unknown as TrackElementType)) {
            acc[key as unknown as TrackElementType] = trackElementToButtonMap[key as unknown as TrackElementType];
        }
        return acc;
    }, {} as ButtonToElementMap);
    return filteredTEBM;
};

/**
 *
 * @param buttons Given the buttons that are pressed, return the track elements that are possible to build. Filtering this response with the direction (next/previous), piece end details, and the current segment (e.g. diagonal, inverted, covered or not), this should narrow down the possible track elements to build to one single piece.
 * @returns
 */
export const getElementsFromGivenButtons = (buttons: BuildWindowButton[], availableTrackElementTypes?: TrackElementType[]): TrackElementType[] => {
    const elements: TrackElementType[] = [];
    // debug(`Searching for TrackElements that can be built with buttons: ${buttons}`);

    for (const [element, buttonsRequiredToBuildElement] of Object.entries(trackElementToButtonMap)) {
        // debug(`${element} requires buttons: ${buttonArray}`);
        // debug(`Buttons pressed: ${buttons}`);
        // debug(`is this an intersection? `);

        // casting to string[] because the typescript compiler doesn't know that the buttonArray is a string[]
        if (buttons.every((button) => (<string[]>buttonsRequiredToBuildElement).indexOf(button) > -1) && buttonsRequiredToBuildElement.length === buttons.length) {
            // debug(`pushing ${element} to elements`);
            elements.push(element as unknown as TrackElementType);
        }
    }
    debug(`There are ${elements.length} elements which can built with the given buttons ${buttons}: ${JSON.stringify(elements, null, 2)}`);
    return elements;
};

const trackElementToButtonMap: ButtonToElementMap = {
    // Go through each TrackELementType and store the array of buttons that are needed to place the element
    [TrackElementType.Flat]: // 0
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.EndStation]: // 1
        ["special"],
    [TrackElementType.BeginStation]: // 2
        ["special"],
    [TrackElementType.MiddleStation]: // 3
        ["special"],
    [TrackElementType.Up25]: // 4
        ["noCurve", "up25", "noBank"],
    [TrackElementType.Up60]: // 5
        ["noCurve", "up60", "noBank"],
    [TrackElementType.FlatToUp25]: // 6
        ["noCurve", "up25", "noBank"],
    [TrackElementType.Up25ToUp60]: // 7
        ["noCurve", "up60", "noBank"],
    [TrackElementType.Up60ToUp25]: // 8
        ["noCurve", "up25", "noBank"],
    [TrackElementType.Up25ToFlat]: // 9
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.Down25]: // 10
        ["noCurve", "down25", "noBank"],
    [TrackElementType.Down60]: // 11
        ["noCurve", "down60", "noBank"],
    [TrackElementType.FlatToDown25]: // 12
        ["noCurve", "down25", "noBank"],
    [TrackElementType.Down25ToDown60]: // 13
        ["noCurve", "down60", "noBank"],
    [TrackElementType.Down60ToDown25]: // 14
        ["noCurve", "down25", "noBank"],
    [TrackElementType.Down25ToFlat]: // 15
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.LeftQuarterTurn5Tiles]: // 16
        ["left5Tile", "noPitch", "noBank"],
    [TrackElementType.RightQuarterTurn5Tiles]: // 17
        ["right5Tile", "noPitch", "noBank"],
    [TrackElementType.FlatToLeftBank]: // 18
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.FlatToRightBank]: // 19
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankToFlat]: // 20
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankToFlat]: // 21
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.BankedLeftQuarterTurn5Tiles]: // 22
        ["left5Tile", "noPitch", "bankLeft"],
    [TrackElementType.BankedRightQuarterTurn5Tiles]: // 23
        ["right5Tile", "noPitch", "bankRight"],
    [TrackElementType.LeftBankToUp25]: // 24
        ["noCurve", "up25", "noBank"],
    [TrackElementType.RightBankToUp25]: // 25
        ["noCurve", "up25", "noBank"],
    [TrackElementType.Up25ToLeftBank]: // 26
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.Up25ToRightBank]: // 27
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankToDown25]: // 28
        ["noCurve", "down25", "noBank"],
    [TrackElementType.RightBankToDown25]: // 29
        ["noCurve", "down25", "noBank"],
    [TrackElementType.Down25ToLeftBank]: // 30
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.Down25ToRightBank]: // 31
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBank]: // 32
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.RightBank]: // 33
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftQuarterTurn5TilesUp25]: // 34
        ["left5Tile", "up25", "noBank"],//
    [TrackElementType.RightQuarterTurn5TilesUp25]: // 35
        ["right5Tile", "up25", "noBank"],
    [TrackElementType.LeftQuarterTurn5TilesDown25]: // 36
        ["left5Tile", "down25", "noBank"],
    [TrackElementType.RightQuarterTurn5TilesDown25]: // 37
        ["right5Tile", "down25", "noBank"],
    [TrackElementType.SBendLeft]: // 38
        ["sBendLeft", "noPitch", "noBank"],
    [TrackElementType.SBendRight]: // 39
        ["sBendRight", "noPitch", "noBank"],
    [TrackElementType.LeftVerticalLoop]: // 40
        ["special"],
    [TrackElementType.RightVerticalLoop]: // 41
        ["special"],
    [TrackElementType.LeftQuarterTurn3Tiles]: // 42
        ["left3Tile", "noPitch", "noBank"],
    [TrackElementType.RightQuarterTurn3Tiles]: // 43
        ["right3Tile", "noPitch", "noBank"],
    [TrackElementType.LeftBankedQuarterTurn3Tiles]: // 44
        ["left3Tile", "noPitch", "bankLeft"],
    [TrackElementType.RightBankedQuarterTurn3Tiles]: // 45
        ["right3Tile", "noPitch", "bankRight"],
    [TrackElementType.LeftQuarterTurn3TilesUp25]: // 46
        ["left3Tile", "up25", "noBank"],
    [TrackElementType.RightQuarterTurn3TilesUp25]: // 47
        ["right3Tile", "up25", "noBank"],
    [TrackElementType.LeftQuarterTurn3TilesDown25]: // 48
        ["left3Tile", "down25", "noBank"],
    [TrackElementType.RightQuarterTurn3TilesDown25]: // 49
        ["right3Tile", "down25", "noBank"],
    [TrackElementType.LeftQuarterTurn1Tile]: // 50
        ["left1Tile", "noPitch", "noBank"],
    [TrackElementType.RightQuarterTurn1Tile]: // 51
        ["right1Tile", "noPitch", "noBank"],
    //     [TrackElementType.LeftTwistDownToUp]: // 52 //todo what are these?
    // [TrackElementType.RightTwistDownToUp]: // 53
    //     [TrackElementType.LeftTwistUpToDown]: // 54
    // [TrackElementType.RightTwistUpToDown]: // 55
    [TrackElementType.HalfLoopUp]: // 56
        ["special"],
    [TrackElementType.HalfLoopDown]: // 57
        ["special"],
    [TrackElementType.LeftCorkscrewUp]: // 58
        ["special"],
    [TrackElementType.RightCorkscrewUp]: // 59
        ["special"],
    [TrackElementType.LeftCorkscrewDown]: // 60
        ["special"],
    [TrackElementType.RightCorkscrewDown]: // 61
        ["special"],
    [TrackElementType.FlatToUp60]: // 62
        ["noCurve", "up60", "noBank"],
    [TrackElementType.Up60ToFlat]: // 63
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.FlatToDown60]: // 64
        ["noCurve", "down60", "noBank"],
    [TrackElementType.Down60ToFlat]: // 65
        ["noCurve", "noPitch", "noBank"],
    // [TrackElementType.TowerBase]: // 66
    //     [TrackElementType.TowerSection]: // 67

    [TrackElementType.FlatCovered]: // 68
        ["noCurve", "noPitch", "noBank", "covered"],
    [TrackElementType.Up25Covered]: // 69
        ["noCurve", "up25", "noBank", "covered"],
    [TrackElementType.Up60Covered]: // 70
        ["noCurve", "up60", "noBank", "covered"],
    [TrackElementType.FlatToUp25Covered]: // 71
        ["noCurve", "up25", "noBank", "covered"],
    [TrackElementType.Up25ToUp60Covered]: // 72
        ["noCurve", "up60", "noBank", "covered"],
    [TrackElementType.Up60ToUp25Covered]: // 73
        ["noCurve", "up25", "noBank", "covered"],
    [TrackElementType.Up25ToFlatCovered]: // 74
        ["noCurve", "noPitch", "noBank", "covered"],
    [TrackElementType.Down25Covered]: // 75
        ["noCurve", "down25", "noBank", "covered"],
    [TrackElementType.Down60Covered]: // 76
        ["noCurve", "down60", "noBank", "covered"],
    [TrackElementType.FlatToDown25Covered]: // 77
        ["noCurve", "down25", "noBank", "covered"],
    [TrackElementType.Down25ToDown60Covered]: // 78
        ["noCurve", "down60", "noBank", "covered"],
    [TrackElementType.Down60ToDown25Covered]: // 79
        ["noCurve", "down25", "noBank", "covered"],
    [TrackElementType.Down25ToFlatCovered]: // 80
        ["noCurve", "noPitch", "noBank", "covered"],
    [TrackElementType.LeftQuarterTurn5TilesCovered]: // 81
        ["left5Tile", "noPitch", "noBank", "covered"],
    [TrackElementType.RightQuarterTurn5TilesCovered]: // 82
        ["right5Tile", "noPitch", "noBank", "covered"],
    [TrackElementType.SBendLeftCovered]: // 83
        ["sBendLeft", "noPitch", "noBank", "covered"],
    [TrackElementType.SBendRightCovered]: // 84
        ["sBendRight", "noPitch", "noBank", "covered"],
    [TrackElementType.LeftQuarterTurn3TilesCovered]: // 85
        ["left3Tile", "noPitch", "noBank", "covered"],
    [TrackElementType.RightQuarterTurn3TilesCovered]: // 86
        ["right3Tile", "noPitch", "noBank", "covered"],

    // todo do i use a helix button or special?
    [TrackElementType.LeftHalfBankedHelixUpSmall]: // 87
        ["special"],
    [TrackElementType.RightHalfBankedHelixUpSmall]: // 88
        ["special"],
    [TrackElementType.LeftHalfBankedHelixDownSmall]: // 89
        ["special"],
    [TrackElementType.RightHalfBankedHelixDownSmall]: // 90
        ["special"],
    [TrackElementType.LeftHalfBankedHelixUpLarge]: // 91
        ["special"],
    [TrackElementType.RightHalfBankedHelixUpLarge]: // 92
        ["special"],
    [TrackElementType.LeftHalfBankedHelixDownLarge]: // 93
        ["special"],
    [TrackElementType.RightHalfBankedHelixDownLarge]: // 94
        ["special"],
    [TrackElementType.LeftQuarterTurn1TileUp60]: // 95 these is intentionally different since it's the only 1-tile 60
        ["left3Tile", "up60", "noBank"],
    [TrackElementType.RightQuarterTurn1TileUp60]: // 96
        ["right3Tile", "up60", "noBank"],
    [TrackElementType.LeftQuarterTurn1TileDown60]: // 97
        ["left3Tile", "down60", "noBank"],
    [TrackElementType.RightQuarterTurn1TileDown60]: // 98
        ["right3Tile", "down60", "noBank"],
    [TrackElementType.Brakes]: // 99
        ["brakes"],
    // [TrackElementType.RotationControlToggleAlias]: // 100
    [TrackElementType.Booster]: // 101
        ["boosters"],
    // [TrackElementType.Maze]: // 102
    [TrackElementType.LeftQuarterBankedHelixLargeUp]: // 103
        ["special"],
    [TrackElementType.RightQuarterBankedHelixLargeUp]: // 104
        ["special"],
    [TrackElementType.LeftQuarterBankedHelixLargeDown]: // 105
        ["special"],
    [TrackElementType.RightQuarterBankedHelixLargeDown]: // 106
        ["special"],
    [TrackElementType.LeftQuarterHelixLargeUp]: // 107
        ["special"],
    [TrackElementType.RightQuarterHelixLargeUp]: // 108
        ["special"],
    [TrackElementType.LeftQuarterHelixLargeDown]: // 109
        ["special"],
    [TrackElementType.RightQuarterHelixLargeDown]: // 110
        ["special"],
    [TrackElementType.Up25LeftBanked]: // 111
        ["noCurve", "up25", "bankLeft"],
    [TrackElementType.Up25RightBanked]: // 112
        ["noCurve", "up25", "bankRight"],
    [TrackElementType.Waterfall]: // 113
        ["special"],
    [TrackElementType.Rapids]: // 114
        ["special"],
    [TrackElementType.OnRidePhoto]: // 115
        ["camera"],
    [TrackElementType.Down25LeftBanked]: // 116
        ["noCurve", "down25", "bankLeft"],
    [TrackElementType.Down25RightBanked]: // 117
        ["noCurve", "down25", "bankRight"],
    [TrackElementType.Watersplash]: // 118
        ["special"],
    [TrackElementType.FlatToUp60LongBase]: // 119
        ["noCurve", "up60", "noBank"],
    [TrackElementType.Up60ToFlatLongBase]: // 120
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.Whirlpool]: // 121
        ["special"],
    [TrackElementType.Down60ToFlatLongBase]: // 122
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.FlatToDown60LongBase]: // 123
        ["noCurve", "down60", "noBank"],
    [TrackElementType.CableLiftHill]: // 124
        ["special"],
    [TrackElementType.ReverseFreefallSlope]: // 125
        ["special"],
    [TrackElementType.ReverseFreefallVertical]: // 126
        ["special"],
    [TrackElementType.Up90]: // 127
        ["noCurve", "up90", "noBank"],
    [TrackElementType.Down90]: // 128
        ["noCurve", "down90", "noBank"],
    [TrackElementType.Up60ToUp90]: // 129
        ["noCurve", "up90", "noBank"],
    [TrackElementType.Down90ToDown60]: // 130
        ["noCurve", "down60", "noBank"],
    [TrackElementType.Up90ToUp60]: // 131
        ["noCurve", "up60", "noBank"],
    [TrackElementType.Down60ToDown90]: // 132
        ["noCurve", "down90", "noBank"],
    [TrackElementType.BrakeForDrop]: // 133
        ["special"],
    [TrackElementType.LeftEighthToDiag]: // 134
        ["leftLargeTurn", "noPitch", "noBank"],
    [TrackElementType.RightEighthToDiag]: // 135
        ["rightLargeTurn", "noPitch", "noBank"],
    [TrackElementType.LeftEighthToOrthogonal]: // 136
        ["leftLargeTurn", "noPitch", "noBank"],
    [TrackElementType.RightEighthToOrthogonal]: // 137
        ["rightLargeTurn", "noPitch", "noBank"],
    [TrackElementType.LeftEighthBankToDiag]: // 138
        ["leftLargeTurn", "noPitch", "bankLeft"],
    [TrackElementType.RightEighthBankToDiag]: // 139
        ["rightLargeTurn", "noPitch", "bankRight"],
    [TrackElementType.LeftEighthBankToOrthogonal]: // 140
        ["leftLargeTurn", "noPitch", "bankLeft"],
    [TrackElementType.RightEighthBankToOrthogonal]: // 141
        ["rightLargeTurn", "noPitch", "bankRight"],
    [TrackElementType.DiagFlat]: // 142
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagUp25]: // 143
        ["noCurve", "up25", "noBank"],
    [TrackElementType.DiagUp60]: // 144
        ["noCurve", "up60", "noBank"],
    [TrackElementType.DiagFlatToUp25]: // 145
        ["noCurve", "up25", "noBank"],
    [TrackElementType.DiagUp25ToUp60]: // 146
        ["noCurve", "up60", "noBank"],
    [TrackElementType.DiagUp60ToUp25]: // 147
        ["noCurve", "up25", "noBank"],
    [TrackElementType.DiagUp25ToFlat]: // 148
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagDown25]: // 149
        ["noCurve", "down25", "noBank"],
    [TrackElementType.DiagDown60]: // 150
        ["noCurve", "down60", "noBank"],
    [TrackElementType.DiagFlatToDown25]: // 151
        ["noCurve", "down25", "noBank"],
    [TrackElementType.DiagDown25ToDown60]: // 152
        ["noCurve", "down60", "noBank"],
    [TrackElementType.DiagDown60ToDown25]: // 153
        ["noCurve", "down25", "noBank"],
    [TrackElementType.DiagDown25ToFlat]: // 154
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagFlatToUp60]: // 155
        ["noCurve", "up60", "noBank"],
    [TrackElementType.DiagUp60ToFlat]: // 156
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagFlatToDown60]: // 157
        ["noCurve", "down60", "noBank"],
    [TrackElementType.DiagDown60ToFlat]: // 158
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagFlatToLeftBank]: // 159
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.DiagFlatToRightBank]: // 160
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.DiagLeftBankToFlat]: // 161
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagRightBankToFlat]: // 162
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.DiagLeftBankToUp25]: // 163
        ["noCurve", "up25", "bankLeft"],
    [TrackElementType.DiagRightBankToUp25]: // 164
        ["noCurve", "up25", "bankRight"],
    [TrackElementType.DiagUp25ToLeftBank]: // 165
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.DiagUp25ToRightBank]: // 166
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.DiagLeftBankToDown25]: // 167
        ["noCurve", "down25", "bankLeft"],
    [TrackElementType.DiagRightBankToDown25]: // 168
        ["noCurve", "down25", "bankRight"],
    [TrackElementType.DiagDown25ToLeftBank]: // 169
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.DiagDown25ToRightBank]: // 170
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.DiagLeftBank]: // 171
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.DiagRightBank]: // 172
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LogFlumeReverser]: // 173
        ["special"],
    [TrackElementType.SpinningTunnel]: // 174
        ["special"],
    [TrackElementType.LeftBarrelRollUpToDown]: // 175
        ["special"],
    [TrackElementType.RightBarrelRollUpToDown]: // 176
        ["special"],
    [TrackElementType.LeftBarrelRollDownToUp]: // 177
        ["special"],
    [TrackElementType.RightBarrelRollDownToUp]: // 178
        ["special"],
    [TrackElementType.LeftBankToLeftQuarterTurn3TilesUp25]: // 179
        ["left3Tile", "up25", "noBank"],
    [TrackElementType.RightBankToRightQuarterTurn3TilesUp25]: // 180
        ["right3Tile", "up25", "noBank"],
    [TrackElementType.LeftQuarterTurn3TilesDown25ToLeftBank]: // 181
        ["left3Tile", "down25", "noBank"],
    [TrackElementType.RightQuarterTurn3TilesDown25ToRightBank]: // 182
        ["right3Tile", "down25", "noBank"],
    [TrackElementType.PoweredLift]: // 183
        ["special"],
    [TrackElementType.LeftLargeHalfLoopUp]: // 184
        ["special"],
    [TrackElementType.RightLargeHalfLoopUp]: // 185
        ["special"],
    [TrackElementType.RightLargeHalfLoopDown]: // 186
        ["special"],
    [TrackElementType.LeftLargeHalfLoopDown]: // 187
        ["special"],
    [TrackElementType.LeftFlyerTwistUp]: // 188
        ["special"],
    [TrackElementType.RightFlyerTwistUp]: // 189
        ["special"],
    [TrackElementType.LeftFlyerTwistDown]: // 190
        ["special"],
    [TrackElementType.RightFlyerTwistDown]: // 191
        ["special"],
    [TrackElementType.FlyerHalfLoopUninvertedUp]: // 192
        ["special"],
    [TrackElementType.FlyerHalfLoopInvertedDown]: // 193
        ["special"],
    [TrackElementType.LeftFlyerCorkscrewUp]: // 194
        ["special"],
    [TrackElementType.RightFlyerCorkscrewUp]: // 195
        ["special"],
    [TrackElementType.LeftFlyerCorkscrewDown]: // 196
        ["special"],
    [TrackElementType.RightFlyerCorkscrewDown]: // 197
        ["special"],
    [TrackElementType.HeartLineTransferUp]: // 198
        ["special"],
    [TrackElementType.HeartLineTransferDown]: // 199
        ["special"],
    [TrackElementType.LeftHeartLineRoll]: // 200
        ["special"],
    [TrackElementType.RightHeartLineRoll]: // 201
        ["special"],
    // [TrackElementType.MinigolfHoleA]: // 202
    //     [TrackElementType.MinigolfHoleB]: // 203
    // [TrackElementType.MinigolfHoleC]: // 204
    //     [TrackElementType.MinigolfHoleD]: // 205
    // [TrackElementType.MinigolfHoleE]: // 206
    [TrackElementType.MultiDimInvertedFlatToDown90QuarterLoop]: // 207
        ["special"],
    [TrackElementType.Up90ToInvertedFlatQuarterLoop]: // 208
        ["special"],
    [TrackElementType.InvertedFlatToDown90QuarterLoop]: // 209
        ["special"],
    [TrackElementType.LeftCurvedLiftHill]: // 210
        ["special"],
    [TrackElementType.RightCurvedLiftHill]: // 211
        ["special"],
    [TrackElementType.LeftReverser]: // 212
        ["special"],
    [TrackElementType.RightReverser]: // 213
        ["special"],
    [TrackElementType.AirThrustTopCap]: // 214
        ["special"],
    [TrackElementType.AirThrustVerticalDown]: // 215 // todo i think this and the up version can also be done with down25 and up25
        ["special"],
    [TrackElementType.AirThrustVerticalDownToLevel]: // 216
        ["special"],
    [TrackElementType.BlockBrakes]: // 217
        ["blockBrakes"],
    [TrackElementType.LeftBankedQuarterTurn3TileUp25]: // 218
        ["left3Tile", "up25", "bankLeft"],
    [TrackElementType.RightBankedQuarterTurn3TileUp25]: // 219
        ["right3Tile", "up25", "bankRight"],
    [TrackElementType.LeftBankedQuarterTurn3TileDown25]: // 220
        ["left3Tile", "down25", "bankLeft"],
    [TrackElementType.RightBankedQuarterTurn3TileDown25]: // 221
        ["right3Tile", "down25", "bankRight"],
    [TrackElementType.LeftBankedQuarterTurn5TileUp25]: // 222
        ["left5Tile", "up25", "bankLeft"],
    [TrackElementType.RightBankedQuarterTurn5TileUp25]: // 223
        ["right5Tile", "up25", "bankRight"],
    [TrackElementType.LeftBankedQuarterTurn5TileDown25]: // 224
        ["left5Tile", "down25", "bankLeft"],
    [TrackElementType.RightBankedQuarterTurn5TileDown25]: // 225
        ["right5Tile", "down25", "bankRight"],
    [TrackElementType.Up25ToLeftBankedUp25]: // 226
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.Up25ToRightBankedUp25]: // 227
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedUp25ToUp25]: // 228
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankedUp25ToUp25]: // 229
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.Down25ToLeftBankedDown25]: // 230
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.Down25ToRightBankedDown25]: // 231
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedDown25ToDown25]: // 232
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankedDown25ToDown25]: // 233
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.LeftBankedFlatToLeftBankedUp25]: // 234
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.RightBankedFlatToRightBankedUp25]: // 235
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedUp25ToLeftBankedFlat]: // 236
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.RightBankedUp25ToRightBankedFlat]: // 237
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedFlatToLeftBankedDown25]: // 238
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.RightBankedFlatToRightBankedDown25]: // 239
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedDown25ToLeftBankedFlat]: // 240
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankedDown25ToRightBankedFlat]: // 241
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.FlatToLeftBankedUp25]: // 242
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.FlatToRightBankedUp25]: // 243
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedUp25ToFlat]: // 244
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankedUp25ToFlat]: // 245
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.FlatToLeftBankedDown25]: // 246
        ["noCurve", "noPitch", "bankLeft"],
    [TrackElementType.FlatToRightBankedDown25]: // 247
        ["noCurve", "noPitch", "bankRight"],
    [TrackElementType.LeftBankedDown25ToFlat]: // 248
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.RightBankedDown25ToFlat]: // 249
        ["noCurve", "noPitch", "noBank"],
    [TrackElementType.LeftQuarterTurn1TileUp90]: // 250
        ["left3Tile", "up90", "noBank"],
    [TrackElementType.RightQuarterTurn1TileUp90]: // 251
        ["right3Tile", "up90", "noBank"],
    [TrackElementType.LeftQuarterTurn1TileDown90]: // 252 //todo purposely changing this to left3Tile again because vertical coasters don't have any other 1tile turns
        ["left3Tile", "down90", "noBank"],
    [TrackElementType.RightQuarterTurn1TileDown90]: // 253
        ["right3Tile", "down90", "noBank"],
    [TrackElementType.MultiDimUp90ToInvertedFlatQuarterLoop]: // 254
        ["special"],
    [TrackElementType.MultiDimFlatToDown90QuarterLoop]: // 255
        ["special"],
    [TrackElementType.MultiDimInvertedUp90ToFlatQuarterLoop]: // 256
        ["special"]
    // [TrackElementType.RotationControlToggle]: // 257
}

