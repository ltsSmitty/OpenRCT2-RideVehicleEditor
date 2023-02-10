import { loadAllPropsOnOpen, propStorage as storage } from '../services/preferenceSerializer';
import { Store, store, arrayStore, compute } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { findIndex } from "../utilities/arrayHelper";
import { TrainWatcher } from '../services/trainWatcher';
import ColourChange from '../services/ridePainter';
import { PaintProps, PaintPropsObj } from '../objects/PaintPropsObj';
import * as Log from "../utilities/logger";
import _ from "lodash-es";
import { ColourSet } from '../objects/trainModeProps';


export class RideViewModel {
    readonly rides = store<ParkRide[]>([]);
    readonly ridesToPaint = arrayStore<PaintProps>([]);
    readonly isPicking = store<boolean>(false);

    private _onPlayerAction?: IDisposable;
    painter = new PaintPropsObj(this.handleValueChange.bind(this));


    constructor() {
        this.rides.subscribe(r => updateSelectionOrNull(this.painter.rideStore, r));
        this.painter.rideStore.subscribe(() => this.onRideSelectionChange()); // handle updating the booleans
        this.ridesToPaint.subscribe(() => this.onRidesToPaintChange()); // handle updating the serialised values

        // handle updating the serialised values
        const vehicleColourStores = this.painter.trainModeProps.vehicleProps.map(v => v.colourSet);
        const _vehicleColourSetChangeStores = vehicleColourStores.map((v, i) => v.subscribe((newColourSet) => this.onVehicleColourSetChange(newColourSet, i)));

        this._onPlayerAction ||= context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));

        // initialize the train watcher
        const _trainWatcher = new TrainWatcher(this.ridesToPaint);

        this.loadAllPreferencesOnOpen();
    }

    /**
     * Reload available rides and ride types when the window opens.
     */
    open(): void {
        this.rides.set(getAllRides());

        this._onPlayerAction ||= context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));
    }

    /**
     * Disposes events that were being listened for.
     */
    close(): void {
        if (this._onPlayerAction) {
            this._onPlayerAction.dispose();
        }
        this._onPlayerAction = undefined;
    }

    /**
     * Selects a ride from the list of available rides.
     */
    select({ rideID, coords }: { rideID: number | undefined, coords: CoordsXYZ | undefined }): void {
        const rides = this.rides.get();
        const rideIndex = findIndex(rides, r => r.ride().id === rideID);

        if (rideIndex === null) {
            Log.debug(`Could not find ride id ${rideID}.`);
            return;
        }
        this.painter.ride = ([rides[rideIndex], rideIndex]);
        if (coords) { ui.mainViewport.scrollTo(coords); }
    }

    private onRideSelectionChange(): void {
        const selectedParkRide = this.painter.ride;
        const rideIDAsKey = selectedParkRide?.[0].ride().id.toString();

        if (!rideIDAsKey || !selectedParkRide) return; // verify that a ride is selected

        // check if the selected ride has already been serialized
        // if it has, update the values to match
        const props = storage.getRideProps(rideIDAsKey);

        // provide default values if the ride has not been serialized
        this.painter.colouringEnabled = (props?.colouringEnabled ?? false);
        this.painter.mode = (props?.mode ?? "train");

        // set the train mode props from storage, or to defaults if nothing was loaded
        props?.trainModeProps
            ? this.painter.trainModeProps.updateFromExisting(props.trainModeProps)
            : this.painter.trainModeProps.reset();

        // todo something for tail mode
        this.painter.tailModeProps.set(props?.tailModeProps ?? this.painter.tailModeProps.get());
    }

    private onVehicleColourSetChange(newColourSet: ColourSet, trainIndex: number): void {
        // Log.debug(`vehicle 0 ${this.painter.trainModeProps.vehicleProps[0].get().colourSet.vehicleColours}, ${this.painter.trainModeProps.vehicleProps[0].id}`);
        // Log.debug(`vehicle 1 ${this.painter.trainModeProps.vehicleProps[1].get().colourSet.vehicleColours}, ${this.painter.trainModeProps.vehicleProps[1].id}`);
        // Log.debug(`vehicle 2 ${this.painter.trainModeProps.vehicleProps[2].get().colourSet.vehicleColours}, ${this.painter.trainModeProps.vehicleProps[2].id}`);
        Log.debug(`New colour set for train ${trainIndex} id ${this.painter.trainModeProps.vehicleProps[trainIndex].id} is: ${JSON.stringify(newColourSet)}`);
        // it's not saving the colour update, so im trying it here to see if it makes a difference
        // this.painter.saveProps();
        this.updateTrainColours(newColourSet, trainIndex);
    }

    private handleValueChange(props: PaintProps): void {

        const rideIndex = _.findIndex(this.ridesToPaint.get(), r => r.ride[0].ride().id === props.ride[0].ride().id);

        if (props.colouringEnabled === false && rideIndex !== -1) {
            this.ridesToPaint.splice(rideIndex, 1);
            return;
        }

        if (rideIndex === -1) {
            this.ridesToPaint.push(props);
            return;
        }
        // splice out the old version and push the new one
        // Log.debug(`about to splice out ${JSON.stringify(JSON.stringify(this.ridesToPaint.get()[rideIndex]))}

        // and replace with

        // ${JSON.stringify(props)}`);
        this.ridesToPaint.splice(rideIndex, 1);
        this.ridesToPaint.push(props);
        return;
    }

    private loadAllPreferencesOnOpen(): void {
        // const loadedPreferences = loadAllPropsOnOpen({ reset: true });
        const loadedPreferences = loadAllPropsOnOpen();
        Log.debug(`Loading preferences:`);
        // Log.debug(JSON.stringify(loadedPreferences));
        this.ridesToPaint.set(loadedPreferences);
    }

    private onRidesToPaintChange(): void {

        const _ridesToPaint = this.ridesToPaint.get();
        // loop through each and if the values are both false, remove it from the array
        if (_ridesToPaint.length === 0) return;
        _ridesToPaint.forEach((r, i) => {
            if (!r.colouringEnabled) {
                this.ridesToPaint.splice(i, 1);
            }
        });
    }

    updateTrainColours(newColourSet: ColourSet, trainIndex: number): void {

        const ride = this.painter.ride;
        if (!ride) return;

        const { numberOfVehicleSets } = this.painter.trainModeProps;
        const numTrains = ride[0].trains().length;

        ColourChange.setRideVehicleScheme({ rideID: ride[0].ride().id, scheme: "perTrain" });

        for (let i = trainIndex; i < numTrains; i += numberOfVehicleSets) {
            Log.debug(`i: ${i}`);
            Log.debug(`Painting vehicle ${i} of ride ${ride[0].ride().id} with colours ${newColourSet.vehicleColours}`); // todo remove this
            // set all vehicles to the same colour
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 3,
                colour: newColourSet.vehicleColours[0],
            });
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 4,
                colour: newColourSet.vehicleColours[1],
            });
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 5,
                colour: newColourSet.vehicleColours[2],
            });
        }
    }


    /**
     * Triggers for every executed player action.
     * @param event The arguments describing the executed action.
     */
    private _onPlayerActionExecuted(event: GameActionEventArgs): void {
        const action = event.action as ActionType;
        switch (action) {
            case "ridecreate":
            case "ridesetname":
                {
                    Log.debug("Ride created or renamed");
                    this.rides.set(getAllRides());
                    break;
                }
            case "ridedemolish":
                {
                    Log.debug("Ride demolished");
                    this.rides.set(getAllRides());
                    // remove the ride from the list of rides to paint
                    const _ridesToPaint = this.ridesToPaint.get();
                    const rideID = (event.args as RideDemolishArgs).ride;
                    const paintPropIdx = _.findIndex(_ridesToPaint, r => r.ride[0].ride().id === rideID);
                    if (paintPropIdx !== -1) {
                        this.ridesToPaint.splice(paintPropIdx, 1);
                    }
                    break;
                }
            case "ridesetvehicle":
                {
                    Log.debug("Ride vehicle changed");
                    this.rides.set(getAllRides());
                    // this.painter.resetValues();
                    break;
                }
            case "ridesetappearance":
                {
                    Log.debug(`Ride appearance changed: ${JSON.stringify(event.args)}`);
                    // todo trigger something here to update the colour widgets, something like `this.painter.refreshColours()`
                    // this.painter.
                    break;
                }
            // case "ridesetcolourscheme": {
            //     Log.debug(`Ride colour scheme changed: ${JSON.stringify(event.args)}`);
            //     break;
            // }
        }
    }
}

function updateSelectionOrNull<T>(value: Store<[T, number] | null>, items: T[]): void {
    let selection: [T, number] | null = null;
    if (items.length > 0) {
        const previous = value.get();
        const selectedIdx = (previous && previous[1] < items.length) ? previous[1] : 0;
        selection = [items[selectedIdx], selectedIdx];
    }
    value.set(selection);
}

function paintVehicle(params: {
    rideID: number,
    trainIndex: number,
    partNumber: number,
    colour: number,
}): void {
    // Log.debug(`index/scheme: ${params.trainIndex}`);
    context.executeAction("ridesetappearance", {
        ride: params.rideID,
        type: params.partNumber,
        value: params.colour,
        index: params.trainIndex,
    },
        (result) => {
            // Log.debug(`${JSON.stringify(result, null, 2)}`);
        });
}
