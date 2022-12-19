import { TrackElementType } from "../../utilities/trackElementType";


// has stations, flat, up and down 25 and 3 tile turns
const genericTrackedRideAvailableSegmentTypes: TrackElementType[] = [0, 1, 2, 3, 4, 6, 9, 10, 12, 15];

// this includes UpDown60, so it might be too much, but this is just for testing
const hasDiagonals: TrackElementType[] = [
    // from 133 to 171
    133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171
];
const has1TileTurns = [50, 51];
const has3TileTurns = [42, 43];
const has5TileTurns = [16, 17];
const hasSBends: TrackElementType[] = [38, 39];
const hasBanks: TrackElementType[] = [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 44, 45, 110, 111, 115, 116];
const hasPitched3TileTurns: TrackElementType[] = [46, 47, 48, 49];
const hasPitched5TileTurns: TrackElementType[] = [34, 35, 36, 37];
const hasPitchedBankedTurns: TrackElementType[] = [178, 179, 180, 181,
    // 217 through 248
    217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248
];

const hasFlatToUpDown60: TrackElementType[] = [62, 63, 64, 65];
const hasUpDown90: TrackElementType[] = [126, 127, 128, 129, 130, 131, 249, 250, 251, 252];
const hasBrakes = [99];
const hasBooster = [100];
const hasBlockBrakes = [216];
const hasOnRidePhoto = [114];

// covered
const hasCoveredSections: TrackElementType[] = [
    // from 71 to 86
    71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86
];

// specials
const hasTwists: TrackElementType[] = [52, 53, 54, 55];
const hasVerticalLoops: TrackElementType[] = [40, 41];
const hasHalfLoops: TrackElementType[] = [56, 57];
const hasCorkscrews: TrackElementType[] = [58, 59, 60, 61];
const hasHelixes: TrackElementType[] = [87, 88, 89, 90, 91, 92, 93, 94];
const hasBarrelRolls: TrackElementType[] = [174, 175, 176, 177];
const hasLargeHalfLoops: TrackElementType[] = [183, 184, 185, 186];

const hasTurnsUp60Down60: TrackElementType[] = [95, 96, 97, 98];
const hasQuarterHelixes = [106, 107, 108, 109];
const hasQuarterHelixesBanked = [102, 103, 104, 105];
const hasLargeCorkscrew = [267, 268, 269, 270];
const hasMediumHalfLoop = [271, 272, 273, 274];
const hasZeroGRoll = [275, 276, 277, 278, 279, 280, 281, 282];

// niche
const hasTowerPieces: TrackElementType[] = [66, 67];
const isMaze = [101];
const hasFlatToUpDown60LongBase: TrackElementType[] = [118, 119, 121, 122];
const hasFlyerTrack: TrackElementType[] = [187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 283, 284, 285, 286, 287, 288, 289, 290, 291, 292];
const hasHeartlineTrack: TrackElementType[] = [197, 198, 199, 200];
const isMiniGolf = [201, 202, 203, 204, 205];

// export all as rideType
export const TrackSegmentTypeFamilies = {
    genericTrackedRideAvailableSegmentTypes,
    hasDiagonals,
    has1TileTurns,
    has3TileTurns,
    has5TileTurns,
    hasSBends,
    hasBanks,
    hasPitched3TileTurns,
    hasPitched5TileTurns,
    hasPitchedBankedTurns,
    hasFlatToUpDown60,
    hasUpDown90,
    hasBrakes,
    hasBooster,
    hasBlockBrakes,
    hasOnRidePhoto,
    hasCoveredSections,
    hasTwists,
    hasVerticalLoops,
    hasHalfLoops,
    hasCorkscrews,
    hasHelixes,
    hasBarrelRolls,
    hasLargeHalfLoops,
    hasTurnsUp60Down60,
    hasQuarterHelixes,
    hasQuarterHelixesBanked,
    hasLargeCorkscrew,
    hasMediumHalfLoop,
    hasZeroGRoll,
    hasTowerPieces,
    isMaze,
    hasFlatToUpDown60LongBase,
    hasFlyerTrack,
    hasHeartlineTrack,
    isMiniGolf
};

export type RideSegmentCollection = TrackElementType[][];
