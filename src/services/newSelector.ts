import { SegmentDescriptor, Segment } from "../objects/segment";
import { RideType } from "../utilities/rideType";
import { TrackElementType } from "../utilities/trackElementType";
import { getBuildableSegments } from "./segmentValidator";

export class SegmentSelector {
    private _location: CoordsXYZD;
    private _ride: number; //
    private _trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    private _rideType: RideType;
    private _nextLocation: CoordsXYZD | null = null;
    private _previousLocation: CoordsXYZD | null = null;
    private _buildableSegments: { next: TrackElementType[], previous: TrackElementType[] } = { next: [], previous: [] };

    constructor(segment: SegmentDescriptor) {
        this._location = segment.location;
        this._ride = segment.ride;
        this._trackType = segment.trackType;
        this._rideType = segment.rideType;
        this.refreshBuildableSegments();
    }

    public updateSegment(segment: SegmentDescriptor) {
        this._location = segment.location;
        this._ride = segment.ride;
        this._trackType = segment.trackType;
        this._rideType = segment.rideType;
        this.refreshBuildableSegments();
    }

    public next() {

    }

    public previous()

    public setRideType(rideType: number) {
        this._rideType = rideType;
        this.refreshBuildableSegments();
    }

    private refreshBuildableSegments() {
        const nextSegmentsOptions = getBuildableSegments(this._trackType, this._rideType, "next");
        const previousSegmentsOptions = getBuildableSegments(this._trackType, this._rideType, "previous");
        this._buildableSegments = { next: nextSegmentsOptions, previous: previousSegmentsOptions };
    }


}
