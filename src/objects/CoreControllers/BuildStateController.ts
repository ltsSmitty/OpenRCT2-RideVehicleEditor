import { RideType } from "../../utilities/rideType";
import { TrackElementType } from "../../utilities/trackElementType";

interface IBuildStateController {
    rideType: RideType | null;
    ride: number | null;
    trackElementType: TrackElementType | null;
    initialBuildLocation: CoordsXYZD | null; // what the TI says the location to build is

    // location after considering building forward/backward, inverted, up vs down, etc.
    // this may or may not be the same as the initialBuildLocation.
    computedBuildLocation: CoordsXYZD | null;
    computeBuildLocation(): CoordsXYZD | null; // compute the build location based on the initialBuildLocation, rideType, trackElementType, etc.
}

export class BuildStateController implements IBuildStateController {
    rideType: RideType | null;
    ride: number | null;
    trackElementType: TrackElementType | null;
    initialBuildLocation: CoordsXYZD | null; // what the TI says the location to build is

    // location after considering building forward/backward, inverted, up vs down, etc.
    // this may or may not be the same as the initialBuildLocation.
    computedBuildLocation: CoordsXYZD | null;

    constructor() {
        this.rideType = null;
        this.ride = null;
        this.trackElementType = null;
        this.initialBuildLocation = null;
        this.computedBuildLocation = null;
    }

    // todo import the function from the old code and do a bit of smashing together the zModifier,
    // todo  direction modifier, etc.
    computeBuildLocation(): CoordsXYZD | null {
        return null;
    }
}
