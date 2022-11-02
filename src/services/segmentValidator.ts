import { TrackElementType } from "../utilities/trackElementType";

const endsFlat: TrackElementType[] = [
    TrackElementType.Flat,
    TrackElementType.EndStation,
    TrackElementType.BeginStation,
    TrackElementType.Up25ToFlat,
    TrackElementType.Down25ToFlat,
    TrackElementType.LeftQuarterTurn3Tiles,
    TrackElementType.LeftQuarterTurn5Tiles,
    TrackElementType.RightQuarterTurn3Tiles,
    TrackElementType.RightQuarterTurn5Tiles,
    TrackElementType.SBendLeft,
    TrackElementType.SBendRight,
    TrackElementType.Brakes,
    // TrackElementType.Booster,
    TrackElementType.OnRidePhoto,
];

const startsFlat: TrackElementType[] = [
    TrackElementType.Flat,
    TrackElementType.EndStation,
    TrackElementType.BeginStation,
    TrackElementType.FlatToDown25,
    TrackElementType.FlatToUp25,
    TrackElementType.LeftQuarterTurn3Tiles,
    TrackElementType.LeftQuarterTurn5Tiles,
    TrackElementType.RightQuarterTurn3Tiles,
    TrackElementType.RightQuarterTurn5Tiles,
    TrackElementType.SBendLeft,
    TrackElementType.SBendRight,
    TrackElementType.Brakes,
]

const startsUp25: TrackElementType[] = [
    TrackElementType.Up25,
    TrackElementType.Up25ToFlat,
    TrackElementType.LeftVerticalLoop,
    TrackElementType.RightVerticalLoop,
    TrackElementType.Up25ToUp60
]

const endsUp25: TrackElementType[] = [
    TrackElementType.FlatToUp25,
    TrackElementType.Up60ToUp25,
    TrackElementType.Up25
]

const startsDown25: TrackElementType[] = [
    TrackElementType.Down25,
    TrackElementType.Down25ToDown60,
    TrackElementType.Down25ToFlat
]

const endsDown25: TrackElementType[] = [
    TrackElementType.Down25,
    TrackElementType.LeftVerticalLoop,
    TrackElementType.RightVerticalLoop,
    TrackElementType.FlatToDown25,
    TrackElementType.Down60ToDown25
]

const startsUp60: TrackElementType[] = [
    TrackElementType.Up60,
    TrackElementType.Up60ToUp25
]

const endsUp60: TrackElementType[] = [
    TrackElementType.Up60,
    TrackElementType.Up25ToUp60
]

const startsDown60: TrackElementType[] = [
    TrackElementType.Down60,
    TrackElementType.Down60ToDown25
]

const endsDown60: TrackElementType[] = [
    TrackElementType.Down60,
    TrackElementType.Down25ToDown60
]



export const getBuildableSegments = (el: TrackElementType): TrackElementType[] => {
    // figure out how el ends
    if (endsFlat.indexOf(el) >= 0) { return startsFlat; }
    if (endsDown25.indexOf(el) >= 0) { return startsDown25; }
    if (endsDown60.indexOf(el) >= 0) { return startsDown60; }
    if (endsUp25.indexOf(el) >= 0) { return startsUp25; }
    if (endsUp60.indexOf(el) >= 0) { return startsUp60; }


    return [TrackElementType.Flat];
}
