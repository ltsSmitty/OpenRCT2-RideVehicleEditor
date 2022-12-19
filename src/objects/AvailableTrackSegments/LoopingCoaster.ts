import { AvailableTrackSegmentTypes } from "../trackTypeSelector";
import { TrackSegmentTypeFamilies as rideType, RideSegmentCollection } from "./SegmentTypeFamilies";

const LoopingCoasterSegmentEnabledCollection: RideSegmentCollection = [
    rideType.genericTrackedRideAvailableSegmentTypes,
    rideType.hasDiagonals,
    rideType.has3TileTurns,
    rideType.has5TileTurns,
    rideType.hasSBends,
    rideType.hasBanks,
    rideType.hasBlockBrakes,
    rideType.hasPitched3TileTurns,
    rideType.hasPitched5TileTurns,
    rideType.hasPitchedBankedTurns,
    rideType.hasTurnsUp60Down60,
    rideType.hasBrakes,
    rideType.hasBooster,
    rideType.hasOnRidePhoto,
    rideType.hasVerticalLoops,
    rideType.hasHelixes,
    rideType.hasFlatToUpDown60LongBase
];

const LoopingCoasterSegmentExtraCollection: RideSegmentCollection = [
    rideType.hasUpDown90,
    rideType.hasCorkscrews,
    rideType.hasBarrelRolls,
    rideType.hasHalfLoops,
    rideType.hasFlatToUpDown60,
];

const LoopingCoasterSegmentCoveredCollection: RideSegmentCollection = [];

const computeAvailableTrackSegmentTypes = (enabledCollection: RideSegmentCollection, extraCollection: RideSegmentCollection, coveredCollection: RideSegmentCollection): AvailableTrackSegmentTypes => {
    const enabled = enabledCollection.reduce((acc, curr) => [...acc, ...curr], []);
    const extra = extraCollection.reduce((acc, curr) => [...acc, ...curr], []);
    const covered = coveredCollection.reduce((acc, curr) => [...acc, ...curr], []);

    return {
        enabled,
        extra,
        covered
    };
};

const LoopingCoasterAvailableSegmentTypes: AvailableTrackSegmentTypes = computeAvailableTrackSegmentTypes(
    LoopingCoasterSegmentEnabledCollection,
    LoopingCoasterSegmentExtraCollection,
    LoopingCoasterSegmentCoveredCollection);

export default LoopingCoasterAvailableSegmentTypes;
