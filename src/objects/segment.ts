import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';

export type SegmentDescriptor = {
    location: CoordsXYZD;
    ride: number; // will log an error if you specify a ride # that doesn't exist
    trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType;
};

export class Segment {
    private _location: CoordsXYZD;
    private _ride: number; // will log an error if you specify a ride # that doesn't exist
    private _trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    private _rideType: RideType;

    constructor(segment: SegmentDescriptor) {
        this._location = segment.location;
        this._ride = segment.ride;
        this._trackType = segment.trackType;
        this._rideType = segment.rideType;
    }

    public get(): SegmentDescriptor {
        return {
            location: this._location,
            ride: this._ride,
            trackType: this._trackType,
            rideType: this._rideType
        };
    }
}
