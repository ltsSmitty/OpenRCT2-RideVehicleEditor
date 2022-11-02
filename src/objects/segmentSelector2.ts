import { Segment } from './segment';
import { getBuildableSegments } from '../services/segmentValidator';
import { getSpecificTrackElement } from '../services/trackElementFinder';
import { debug } from '../utilities/logger';

export class SegmentSelector2 {
    private _selectedSegment: Segment | null;
    private _nextSegmentChoices: Segment[] = [];
    private _previousSegmentChoices: Segment[] = [];

    constructor(segment: Segment) {
        this._selectedSegment = segment;
        this.updateNextSegmentOptions();
        this.updatePreviousSegmentOptions();
    }

    updateSegment(segment: Segment) {
        this._selectedSegment = segment;
        this.updateNextSegmentOptions();
        this.updatePreviousSegmentOptions();
    }

    updateNextSegmentOptions(): void {
        if (!this._selectedSegment) {
            this._nextSegmentChoices = [];
            return;
        }
        const seg = this._selectedSegment.get(); // shorthand for this segment
        const thisSegmentIndex = getSpecificTrackElement(seg.ride, seg.location).index; // needed for iterator
        const newTI = map.getTrackIterator(<CoordsXY>seg.location, thisSegmentIndex); // set up TI

        if (newTI == null) {
            debug(`There was an issue creating the track iterator to get next segment options.`);
            return;
        }
        if (!newTI.nextPosition) {
            this._nextSegmentChoices = [];
            return;
        } // guard

        const buildableTrackTypes = getBuildableSegments(this._selectedSegment.get().trackType);
        const buildableSegments = buildableTrackTypes.map(elementType => {
            return new Segment({
                location: newTI.nextPosition,
                ride: seg.ride,
                trackType: elementType,
                rideType: seg.rideType
            });
        });
        this._nextSegmentChoices = buildableSegments;

    }

    updatePreviousSegmentOptions() {
        // todo update getBuildableSegments to return things behind

    }

}
