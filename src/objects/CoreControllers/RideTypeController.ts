import { TrackElementType } from '../../utilities/trackElementType';
import { getAvailableTrackElementTypes } from './../../services/TrackTypeValidator';
import { RideConstructionProps } from './CoreInterface';
// use this object to get/set the ride type of the selected segment.
// use this object to infer the available TrackElementTypes based on the ride type


export class RideTypeController extends RideConstructionProps {

    private _rideType: number;

    constructor(props: RideConstructionProps) {
        super(props);
        this._rideType = 0;
    }

    get rideType(): number {
        return this._rideType;
    }

    set rideType(rideType) {
        this._rideType = rideType;
    }

    get availableTrackElementTypes(): TrackElementType[] {
        return getAvailableTrackElementTypes(this._rideType);
    }

}

const rideTypeController = new RideTypeController();
const trackTypes = rideTypeController.availableTrackElementTypes;

