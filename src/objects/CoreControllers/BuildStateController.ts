import { RideType } from "../../utilities/rideType";
import { TrackElementType } from "../../utilities/trackElementType";
import { Store, store, compute } from "openrct2-flexui";
import { GlobalStateController } from "../GlobalConstructionController";
import { computeBuildLocation } from "../../services/computeBuildLocation";
import { debug } from "../../utilities/logger";


export class BuildStateController {

    private readonly _globalState: GlobalStateController;

    readonly rideType: Store<RideType | null> = store<RideType | null>(null);

    readonly ride: Store<number | null> = store<number | null>(null);

    readonly trackElementType: Store<TrackElementType | null> = store<TrackElementType | null>(null);

    /**
     * The build location which the TI says a new track should be placed to build it properly. This store's value gets computed on change.
     */
    private readonly initialBuildLocation: Store<CoordsXYZD | null> = store<CoordsXYZD | null>(null);
    /**
     * Location after considering building forward/backward, inverted, up vs down, etc.
     * this may or may not be the same as the initialBuildLocation.
    */
    private readonly computedBuildLocation: Store<CoordsXYZD | null> = store<CoordsXYZD | null>(null);

    /**
     * Set this the location which the TI says a new track should be placed to build it properly.
     * When `get`ting, will return the computed build location based on the other dependencies.
     */
    set buildLocation(newBuildLocation: CoordsXYZD | null) {
        this.initialBuildLocation.set(newBuildLocation);
    }

    get buildLocation(): CoordsXYZD | null {
        return this.computedBuildLocation.get();
    }

    /**
     * Replacement for `buildLocation.subscribe()` since that's been hidden by the getter/setter.
     * This functions exactly like the original subscribe method.
     */
    subscribeToBuildLocation(callback: (newBuildLocation: CoordsXYZD | null) => void): void {
        this.computedBuildLocation.subscribe(callback);
    }

    constructor(globalState: GlobalStateController) {
        this._globalState = globalState;

        this._globalState.buildDirection.subscribe(newBuildDirection => this.onBuildDirectionChange(newBuildDirection));
        this.rideType.subscribe(newRideType => this.onRideTypeChange(newRideType));
        this.ride.subscribe(newRide => this.onRideChange(newRide));
        this.trackElementType.subscribe(newTrackElementType => this.onTrackElementTypeChange(newTrackElementType));
        this.initialBuildLocation.subscribe(newInitialBuildLocation => this.onInitialBuildLocationChange(newInitialBuildLocation));
        this.computedBuildLocation.subscribe(newComputedBuildLocation => this.onComputedBuildLocationChange(newComputedBuildLocation));

        this.computedBuildLocation = compute((this._globalState.buildDirection, this.initialBuildLocation, this.trackElementType), () => {
            return this.computeBuildLocation();
        });
    }



    private computeBuildLocation(): CoordsXYZD | null {
        const { buildDirection: buildDirectionStore } = this._globalState;
        // need to get buildDirection, initialBuildLocation, trackElementType as values

        const buildDirection = buildDirectionStore.get();
        const initialLocation = this.initialBuildLocation.get();
        const trackElementType = this.trackElementType.get();

        if (buildDirection == null || initialLocation == null || trackElementType == null) {
            debug("BuildStateController.computeBuildLocation: one of the required values is null");
            return null;
        }

        const newBuildLocation = computeBuildLocation({
            buildDirection,
            initialLocation,
            trackElementType
        });
        return newBuildLocation;
    }


    private onTrackElementTypeChange(newTrackElementType: TrackElementType | null): void {
        // compute the buildLocation
        const newBuildLocation = this.computeBuildLocation();
        if (newBuildLocation == null) {
            debug("BuildStateController.onTrackElementTypeChange: newBuildLocation is null");
            return;
        }
    }

    private onInitialBuildLocationChange(newInitialBuildLocation: CoordsXYZD | null): void {
        // compute the buildLocation
        const newBuildLocation = this.computeBuildLocation();
        if (newBuildLocation == null) {
            debug("BuildStateController.onInitialBuildLocationChange: newBuildLocation is null");
            return;
        }
    }

    private onComputedBuildLocationChange(newomputedBuildLocation: CoordsXYZD | null): void {
        // nothing here right now
    }

    private onRideChange(newRide: number | null): void {
        // nothing here right now
    }

    private onRideTypeChange(newRideType: RideType | null): void {
        // nothing here right now
    }

    private onBuildDirectionChange(newBuildDirection: BuildDirection | null): void {
        // compute the buildLocation
        const newBuildLocation = this.computeBuildLocation();
        if (newBuildLocation == null) {
            debug("BuildStateController.onBuildDirectionChange: newBuildLocation is null");
            return;
        }
    }


}

const buildStateController = new BuildStateController(new GlobalStateController());
buildStateController.ride;
