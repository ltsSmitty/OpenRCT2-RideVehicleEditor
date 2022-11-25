/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { TrackElementItem } from './../services/SegmentController';
import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';
import * as finder from "../services/trackElementFinder";

export type SegmentDescriptor = {
    location: CoordsXYZD;
    ride: number; //
    trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType;
};

export class Segment {
    private _location: CoordsXYZD;
    private _ride: number; //
    private _trackType: TrackElementType; // e.g. TrackElementType.LeftBankedDown25ToDown25
    private _rideType: RideType;
    private _nextLocation: CoordsXYZD | null = null;
    private _previousLocation: CoordsXYZD | null = null;

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

    public nextLocation = (): CoordsXYZD | null => {
        if (this._nextLocation) {
            return this._nextLocation;
        }
        // it's important to not initialize this._nextLocation/this._previousLocation because??
        const thisTI = finder.getTIAtSegment(this);
        this._nextLocation = thisTI?.nextPosition || null;
        this._previousLocation = thisTI?.previousPosition || null;
        return this._nextLocation;
    };

    public previousLocation = (): CoordsXYZD | null => {
        if (this._previousLocation) {
            return this._previousLocation;
        }
        const thisTI = finder.getTIAtSegment(this);
        this._nextLocation = thisTI?.nextPosition || null;
        this._previousLocation = thisTI?.previousPosition || null;
        return this._previousLocation;
    };

    public isThereAFollowingSegment = (direction: "next" | "previous" | null): { exists: false | "ghost" | "real", element: TrackElementItem | null } => {
        const thisTI = finder.getTIAtSegment(this);

        if (direction === "next") {
            const IsThereANextSegment = thisTI?.next(); // check if there's a next segment
            // debug(`Is there a next segment? ${IsThereANextSegment}`);
            if ((IsThereANextSegment)) {
                const thisElement = finder.getSpecificTrackElement(this._ride, thisTI?.position!);
                // debug(`The next element is ${JSON.stringify(thisElement, null, 2)}`);
                return { exists: (thisElement.element.isGhost ? "ghost" : "real"), element: thisElement };
            }

        }
        if (direction === "previous") {
            const IsThereAPreviousSegment = thisTI?.previous(); // check if there's a next segment
            if ((IsThereAPreviousSegment)) {
                const thisElement = finder.getSpecificTrackElement(this._ride, thisTI?.position!);
                return { exists: (thisElement.element.isGhost ? "ghost" : "real"), element: thisElement };
            }
        }
        return { exists: false, element: null };
    };
}
