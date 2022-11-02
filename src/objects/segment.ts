import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';

export class Segment {
    location: CoordsXYZD;
    ride: number; // will log an error if you specify a ride # that doesn't exist
    trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType;

    constructor(loc: CoordsXYZD, r: number, tType: TrackElementType, rType: RideType) {
        this.location = loc;
        this.ride = r;
        this.trackType = tType;
        this.rideType = rType;
    }

    public get() {
        return {
            location: this.location,
            ride: this.ride,
            trackType: this.trackType,
            rideType: this.rideType
        };
    }
}

export type trackPlaceInstructions = {
    brakeSpeed?: number;
    colour?: number;
    seatRotation?: number | null;
    trackPlaceFlags?: number; // the ghost flag is 104
    isFromTrackDesign?: boolean; // default is false
    flags?: typeof Flags;
};

export type trackRemoveInstructions = {
    buildLocation: CoordsXYZD,
    trackType: TrackElementType,
    sequence: number, // not really sure what this is
    flags: typeof Flags
};
