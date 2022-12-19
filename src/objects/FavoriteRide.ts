import { RideType } from './../utilities/rideType';
import { TrackElementType } from './../utilities/trackElementType';
import { AvailableTrackSegmentTypes } from '../objects/trackTypeSelector';
import { getAvailableTrackSegmentsForRideType } from '../objects/AvailableTrackSegments/availableTrackSegments';

export class FavoriteRide {
    rideType: RideType;
    private availableTrackTypes: AvailableTrackSegmentTypes;
    selectedTrackTypes: TrackElementType[];

    constructor(rideType: RideType, trackConstructionMode?: "enabled" | "extra") {
        this.rideType = rideType;
        this.availableTrackTypes = getAvailableTrackSegmentsForRideType(rideType);
        if (trackConstructionMode === "extra") {
            this.selectedTrackTypes = [...this.availableTrackTypes.enabled, ...this.availableTrackTypes.covered, ...this.availableTrackTypes.extra];
        } else {
            this.selectedTrackTypes = [...this.availableTrackTypes.enabled, ...this.availableTrackTypes.covered]
        }
        return this;
    }

    updateTrackConstructionMode(trackConstructionMode: "enabled" | "extra"): this {
        if (trackConstructionMode === "extra") {
            this.selectedTrackTypes = [...this.availableTrackTypes.enabled, ...this.availableTrackTypes.covered, ...this.availableTrackTypes.extra];
        } else {
            this.selectedTrackTypes = [...this.availableTrackTypes.enabled, ...this.availableTrackTypes.covered];
        }
        return this;
    }
}
