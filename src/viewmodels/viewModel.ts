import { loadAllPropsOnOpen, propStorage as storage } from '../services/preferenceSerializer';
import { Store, store, arrayStore, compute } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { findIndex } from "../utilities/arrayHelper";
import { TrainWatcher } from '../services/trainWatcher';
import ColourChange from '../services/ridePainter';
import { PaintProps, PaintPropsObj } from '../objects/PaintPropsObj';
import * as Log from "../utilities/logger";
import _ from "lodash-es";


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


        this.painter.trainModeProps.colourSets.subscribe(() => this.onVehicleColourChange()); // handle painting the trains
        this.painter.trainModeProps.numberVehicleSets.subscribe(() => this.onVehicleColourChange()); // handle painting the trains
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
        Log.debug(`On ride selection change`);
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
            ? this.painter.trainModeProps.setFromExistingProps(props.trainModeProps)
            : this.painter.trainModeProps.reset();

        props?.tailModeProps
            ? this.painter.tailModeProps.setFromExistingProps(props.tailModeProps)
            : this.painter.tailModeProps.reset();
    }

    private onVehicleColourChange(): void {
        this.updateTrainColours();
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
        this.ridesToPaint.splice(rideIndex, 1);
        this.ridesToPaint.push(props);
        return;
    }

    private loadAllPreferencesOnOpen(): void {
        // const loadedPreferences = loadAllPropsOnOpen({ reset: true });
        const loadedPreferences = loadAllPropsOnOpen();
        Log.debug(`Loading preferences:`);
        // let's add a safety check by looping through and making sure that the ride exists in the park before pushing it
        loadedPreferences.forEach((p, i) => {
            const ride = p.ride;
            if (!ride) {
                Log.debug(`Ride does not exist in the park. Removing from preferences.`);
                loadedPreferences.splice(i, 1);
            }
            const rideOnMap = map.getRide(ride[0].id);
            if (!rideOnMap) {
                Log.debug(`Ride  does not exist on the map. Removing from preferences.`);
                loadedPreferences.splice(i, 1);
            }
        });
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

    updateTrainColours(): void {

        const ride = this.painter.ride;
        if (!ride) return;

        const colourSets = this.painter.trainModeProps.colourSets.get();
        const numTrains = ride[0].trains().length;
        const numberOfVehicleSets = this.painter.trainModeProps.numberVehicleSets.get();

        ColourChange.setRideVehicleScheme({ rideID: ride[0].ride().id, scheme: "perTrain" });

        for (let i = 0; i < numTrains; i++) {
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 3,
                colour: colourSets[(i % numberOfVehicleSets)].vehicleColours.body
            });
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 4,
                colour: colourSets[i % numberOfVehicleSets].vehicleColours.trim
            });
            paintVehicle({
                rideID: ride[0].ride().id,
                trainIndex: i,
                partNumber: 5,
                colour: colourSets[i % numberOfVehicleSets].vehicleColours.tertiary
            });
        }
    }

    /**
     * Triggers for every executed player action.
     * @param event The arguments describing the executed action.
     */
    private _onPlayerActionExecuted(event: GameActionEventArgs): void {

        const action = event.action as ActionType;

        type argArgs = { ride: number; flags: number };
        const args = event.args as argArgs; // guards to make sure it's not a ghost create/delete

        switch (action) {
            case "ridecreate":
            case "ridesetname":
                {
                    if (args.flags < 1) { // flag to make sure it's not a ghost create/delete
                        Log.debug("Ride created or renamed");
                        this.rides.set(getAllRides());
                    }
                    break;
                }
            case "ridedemolish":
                {
                    if (args.flags < 1) { // flag to make sure it's not a ghost create/delete
                        Log.debug("Ride demolished");
                        this.rides.set(getAllRides());

                        // remove the ride from the list of rides to paint
                        const _ridesToPaint = this.ridesToPaint.get();
                        const rideID = (event.args as RideDemolishArgs).ride;
                        const paintPropIdx = _.findIndex(_ridesToPaint, r => r.ride[0].ride().id === rideID);

                        if (paintPropIdx !== -1) {
                            this.ridesToPaint.splice(paintPropIdx, 1);
                        }
                    }
                    break;
                }
            case "ridesetvehicle":
                {
                    if (this.painter.ride && args.ride === this.painter.ride[0].id) {
                        Log.debug("Ride vehicle changed");
                        this.rides.set(getAllRides());
                    }
                    break;
                }
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
    // Log.debug(JSON.stringify(params));
    const { rideID, trainIndex, partNumber, colour } = params;
    if (rideID == null || trainIndex == null || partNumber == null || colour == null) { Log.debug(`Unable to paint, something is missing`); return; }

    context.queryAction("ridesetappearance", {
        ride: params.rideID,
        type: params.partNumber,
        index: params.trainIndex,
        value: params.colour,
    },
        result => {
            if (!result.error) {
                context.executeAction("ridesetappearance", {
                    ride: params.rideID,
                    type: params.partNumber,
                    value: params.colour,
                    index: params.trainIndex,
                },
                    (result) => {
                        // Log.debug(`${JSON.stringify(result, null, 2)}`);
                    });
                return;
            }
            Log.debug(`ridesetappearance returned error: ${JSON.stringify(result, null, 2)}`);
        })

}
