
import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';

export type SegmentDescriptor = {
    location: CoordsXYZD;
    ride: number; //
    trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType;
};

export class Segment {
    location: CoordsXYZD;
    ride: number; //
    trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType;

    constructor(segment: SegmentDescriptor) {
        this.location = segment.location;
        this.ride = segment.ride;
        this.trackType = segment.trackType;
        this.rideType = segment.rideType;
    }


    public get(): SegmentDescriptor {
        return {
            location: this.location,
            ride: this.ride,
            trackType: this.trackType,
            rideType: this.rideType
        };
    }
}
