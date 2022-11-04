import { Segment } from './segment';
import { getBuildableSegments } from '../services/segmentValidator';
import { getSpecificTrackElement, getTIAtSegment } from '../services/trackElementFinder';
import { debug } from '../utilities/logger';
import { RideType } from '../utilities/rideType';

export class SegmentSelector2 {
    private _selectedSegment: Segment | null;
    private _nextSegmentChoices: Segment[] = [];
    private _previousSegmentChoices: Segment[] = [];

    constructor(segment?: Segment) {
        (segment ? this._selectedSegment = segment : this._selectedSegment = null);
        this.updateSegmentOptions();
    }

    public updateSegment(segment: Segment | null) {

        debug(`updating th SS copy of segment with new location.z: ${segment?.get().location.z}`);
        this._selectedSegment = segment;
        this.updateSegmentOptions();
        return this.getBuildableSegmentOptions();
    }

    public getselectedSegment(): Segment | null {
        return this._selectedSegment;
    }
    /**
     * Get the buildable segments from the segment provided to the SegmentSelector.
     * @
     */
    public getBuildableSegmentOptions(): { next: Segment[], previous: Segment[] } {
        return {
            next: this._nextSegmentChoices,
            previous: this._previousSegmentChoices
        }
    }

    public next() {
        if (!this._selectedSegment) {
            debug(`no segment has been set for the selector. set it and then try this again.`);
            return false;
        }
        const newTI = getTIAtSegment(this._selectedSegment);
        debug(`TI at original segment. Original segment type was ${newTI?.segment?.type}`);
        const nextSuccess = newTI?.next();
        debug(`TI at new segment. New segment type is ${newTI?.segment?.type}`);
        if (nextSuccess && newTI) {
            debug(`nextSuccess && newTI confirmed`);

            // this might be part of the problem?
            this.updateSegment(this.createSegmentFromTI(newTI));
        }
        debug(`about to return the alleged new selectedSegment: ${JSON.stringify(this._selectedSegment?.get())}`);
        return this._selectedSegment;
    }

    private updateSegmentOptions(): void {
        debug(`Updating ss SegmentOptions`);
        if (!this._selectedSegment) {
            this._nextSegmentChoices = [];
            this._previousSegmentChoices = [];
            return;
        }
        const seg = this._selectedSegment.get(); // shorthand for this segment
        debug(`\tthis seg location.z: ${seg.location.z}`);
        const thisSegmentIndex = getSpecificTrackElement(seg.ride, seg.location).index; // needed for iterator
        const newTI = map.getTrackIterator(<CoordsXY>seg.location, thisSegmentIndex); // set up TI

        if (newTI == null) {
            debug(`There was an issue creating the track iterator to get next segment options.`);
            return;
        }
        debug(`\tnewTI.position.z: ${newTI.position.z}`);
        // calculate both the forward and backward.

        // start with forward
        const forwardPosition = newTI.nextPosition;

        if (!forwardPosition) { // guard
            this._nextSegmentChoices = [];
        } else {
            const buildableTrackTypes = getBuildableSegments(this._selectedSegment.get().trackType);
            // debug(`There are ${buildableTrackTypes.length} potential segments that can be build next forward from the current ${seg.trackType} segment.`);

            const buildableSegments = buildableTrackTypes.map(elementType => {
                return new Segment({
                    location: forwardPosition,
                    ride: seg.ride,
                    trackType: elementType,
                    rideType: seg.rideType
                });
            });
            this._nextSegmentChoices = buildableSegments;
        }

        // get backward potential builds.
        const backPosition = newTI.previousPosition;

        if (!backPosition) {
            this._previousSegmentChoices = [];
        } else {
            // TODO reverse the buildable segments method since right now it's only the forward version
            const buildableTrackTypes = getBuildableSegments(this._selectedSegment.get().trackType, "previous");
            // debug(`There are ${buildableTrackTypes.length} potential segments that can be build next backward from the current ${seg.trackType} segment.`);

            const buildableSegments = buildableTrackTypes.map(elementType => {
                return new Segment({
                    location: backPosition,
                    ride: seg.ride,
                    trackType: elementType,
                    rideType: seg.rideType
                });
            });
            this._previousSegmentChoices = buildableSegments;
        }

    }

    private createSegmentFromTI(TI: TrackIterator): Segment | null {
        const oldSeg = this._selectedSegment?.get();
        if (!oldSeg) return null;


        return new Segment({
            location: TI.position,
            ride: oldSeg.ride,
            rideType: oldSeg.rideType,
            trackType: TI.segment?.type || 0
        })
    }
}

