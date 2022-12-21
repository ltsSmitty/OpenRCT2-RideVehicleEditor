import { TrackElementType } from '../../utilities/trackElementType';
import { getAvailableTrackElementTypes } from './../../services/TrackTypeValidator';
import { RideType } from '../../utilities/rideType';
// use this object to get/set the ride type of the selected segment.
// use this object to infer the available TrackElementTypes based on the ride type


export class RideTypeController {

    private _rideType: RideType | null = null;

    constructor() {
        this.rideType = null;
    }
    get rideType(): RideType | null {
        return this.rideType;
    }

    set rideType(rideType) {
        this.rideType = rideType;
    }
    get availableTrackElementTypes(): TrackElementType[] {
        return getAvailableTrackElementTypes(this._rideType);
    }

}


