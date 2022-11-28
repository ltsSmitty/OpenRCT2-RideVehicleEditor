import { RideType } from './../utilities/rideType';
import { TrackElementType } from './../utilities/trackElementType';
import { AvailableTrackSegmentTypes, getAvailableTrackSegmentsForRideType } from '../services/segmentValidator';


// export type RideFavorite = {
//     ride: RideType,
//     availableTrackTypes: AvailableTrackSegmentTypes
// };

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
