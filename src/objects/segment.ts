import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';
import * as finder from "../services/trackElementFinder"

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
    nextLocation!: CoordsXYZD | null;
    previousLocation!: CoordsXYZD | null;

    constructor(segment: SegmentDescriptor) {
        this._location = segment.location;
        this._ride = segment.ride;
        this._trackType = segment.trackType;
        this._rideType = segment.rideType;

        // set the next and previous locations
        const thisTI = finder.getTIAtSegment(this);
        this.nextLocation = thisTI?.nextPosition || null;
        this.previousLocation = thisTI?.previousPosition || null;
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
