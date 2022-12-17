import { RideType } from "../../utilities/rideType";
import { TrackElementType } from "../../utilities/trackElementType";
import { RideTypeController } from "./RideTypeController";


export class BuildController {
    private rideController: RideTypeController;
    private _location: CoordsXYZD | null;
    private _rideType: RideType | null;
    private _trackType: typeof TrackElementType | null;

    constructor() {
        this.rideController = new RideTypeController();

        this._location = null;
        this._rideType = null;
        this._trackType = null;
    }

    get ride(): number | null {
        return this.rideController.rideType;
    }


    set ride(ride) {
        this.rideController.rideType = ride;
    }

    ride() {
        return this.rideController;
    }


    get availableTrackElementTypes(): typeof TrackElementType[] {
        return this.rideController.availableTrackElementTypes;
    }


}

const buildController = new BuildController();

// buildController.
