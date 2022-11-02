import { Segment } from './segment';
import { getBuildableSegments } from '../services/segmentValidator';
import { getSpecificTrackElement } from '../services/trackElementFinder';
import { debug } from '../utilities/logger';

export class SegmentSelector2 {
    private _selectedSegment: Segment | null;
    private _nextSegmentChoices: Segment[] = [];
    private _previousSegmentChoices: Segment[] = [];

    constructor(segment: Segment | null) {
        this._selectedSegment = segment;
        this.updateSegmentOptions();
    }

    public updateSegment(segment: Segment) {
        this._selectedSegment = segment;
        this.updateSegmentOptions();
        return this.getBuildableSegmentOptions();
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

    private updateSegmentOptions(): void {
        if (!this._selectedSegment) {
            this._nextSegmentChoices = [];
            this._previousSegmentChoices = [];
            return;
        }
        const seg = this._selectedSegment.get(); // shorthand for this segment
        const thisSegmentIndex = getSpecificTrackElement(seg.ride, seg.location).index; // needed for iterator
        const newTI = map.getTrackIterator(<CoordsXY>seg.location, thisSegmentIndex); // set up TI

        if (newTI == null) {
            debug(`There was an issue creating the track iterator to get next segment options.`);
            return;
        }

        // calculate both the forward and backward.

        // start with forward
        const forwardPosition = newTI.nextPosition;

        if (!forwardPosition) { // guard
            this._nextSegmentChoices = [];
        } else {
            const buildableTrackTypes = getBuildableSegments(this._selectedSegment.get().trackType);
            debug(`There are ${buildableTrackTypes.length} potential segments that can be build next forward from the current ${seg.trackType} segment.`);

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
            debug(`There are ${buildableTrackTypes.length} potential segments that can be build next backward from the current ${seg.trackType} segment.`);

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
}
