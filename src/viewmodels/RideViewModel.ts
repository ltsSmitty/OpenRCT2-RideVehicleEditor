import { loadAllPreferencesOnOpen, PreferenceStorage } from './../services/preferenceSerializer';
import { Colour, compute, Store, store, arrayStore } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { findIndex } from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";
import { PreferenceStorage as storage } from "../services/preferenceSerializer";
import _ from "lodash-es";
import { TrainWatcher } from '../services/trainWatcher';

export type RidePaintPreference = {
    ride: ParkRide,
    values: {
        enableColourMatching: boolean,
        enableColourReset: boolean,
    },
};


export class RideViewModel {
    readonly selectedRide = store<[ParkRide, number] | null>(null);
    readonly rides = store<ParkRide[]>([]);
    readonly ridesToPaint = arrayStore<RidePaintPreference>([]);
    readonly enableColourMatching = store<boolean>(false);
    readonly enableColourReset = store<boolean>(false);

    readonly isPicking = store<boolean>(false);

    private _onPlayerAction?: IDisposable;

    constructor() {
        this.rides.subscribe(r => updateSelectionOrNull(this.selectedRide, r));
        this.selectedRide.subscribe(() => this.onRideSelectionChange()); // handle updating the booleans
        this.enableColourMatching.subscribe(() => this.onPaintPreferenceChange()); // handle updating the serialised values
        this.enableColourReset.subscribe(() => this.onPaintPreferenceChange()); // handle updating the serialised values
        this.ridesToPaint.subscribe(() => this.onRidesToPaintChange()); // handle updating the serialised values
        this._onPlayerAction ||= context.subscribe("action.execute", e => this._onPlayerActionExecuted(e));

        // initialize the train watcher
        const trainWatcher = new TrainWatcher(this.ridesToPaint);

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
        this.selectedRide.set([rides[rideIndex], rideIndex]);
        if (coords) { ui.mainViewport.scrollTo(coords); }
    }

    private onRideSelectionChange(): void {
        const selectedParkRide = this.selectedRide.get();
        Log.debug(`Updated selected ride to ${selectedParkRide?.[0].ride().name}`);
        const rideIDAsKey = selectedParkRide?.[0].ride().id.toString();

        if (!rideIDAsKey || !selectedParkRide) return; // verify that a ride is selected

        // check if the selected ride has already been serialized
        // if it has, update the values to match
        const { values } = storage.getRidePreferences(rideIDAsKey);
        Log.debug(`Loaded values: ${JSON.stringify(values)}`);
        if (values) {
            this.enableColourMatching.set(values.enableColourMatching);
            this.enableColourReset.set(values.enableColourReset);
        } else {
            this.enableColourMatching.set(false);
            this.enableColourReset.set(false);
        }

    }

    private onPaintPreferenceChange(): void {
        const selectedParkRide = this.selectedRide.get();
        const rideIDAsKey = selectedParkRide?.[0].ride().id.toString();

        if (!rideIDAsKey || !selectedParkRide) return; // verify that a ride is selected


        const enableColourMatching = this.enableColourMatching.get();
        const enableColourReset = this.enableColourReset.get();

        // update the serialised values
        storage.saveRidePreferences({
            rideIDAsKey,
            values: {
                enableColourMatching,
                enableColourReset,
            }
        });

        const _ridesToPaint = this.ridesToPaint.get();
        const ridePaintPreferenceIdx = _.findIndex(_ridesToPaint, r => r.ride.ride().id === selectedParkRide[0].ride().id);
        const ridePaintPreference = _ridesToPaint[ridePaintPreferenceIdx];

        if (ridePaintPreference) {
            ridePaintPreference.values.enableColourReset = enableColourReset;
            ridePaintPreference.values.enableColourMatching = enableColourMatching;
            // replace the old preference with the new one
            this.ridesToPaint.splice(ridePaintPreferenceIdx, 1);
            this.ridesToPaint.push(ridePaintPreference);
            return;
        }

        // otherwise add it to the array
        const thisPaintPreference: RidePaintPreference = {
            ride: selectedParkRide[0],
            values: {
                enableColourMatching,
                enableColourReset,
            }
        };
        this.ridesToPaint.push(thisPaintPreference);
    }

    private loadAllPreferencesOnOpen(): void {
        const loadedPreferences = loadAllPreferencesOnOpen();
        this.ridesToPaint.set(loadedPreferences);
        Log.debug(JSON.stringify(loadedPreferences, null, 2));
    }

    onRidesToPaintChange(): void {
        Log.debug("Rides to paint changed");
        const _ridesToPaint = this.ridesToPaint.get();
        // loop through each and if the values are both false, remove it from the array
        _ridesToPaint.forEach((r, i) => {
            if (!r.values.enableColourMatching && !r.values.enableColourReset) {
                this.ridesToPaint.splice(i, 1);
            }
        });
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
                    this.rides.set(getAllRides());
                    break;
                }
            case "ridedemolish":
                {
                    this.rides.set(getAllRides());
                    // remove the ride from the list of rides to paint
                    const _ridesToPaint = this.ridesToPaint.get();
                    const rideID = (event.args as RideDemolishArgs).ride;
                    const ridePaintPreferenceIdx = _.findIndex(_ridesToPaint, r => r.ride.ride().id === rideID);
                    if (ridePaintPreferenceIdx !== -1) {
                        PreferenceStorage.saveRidePreferences({
                            rideIDAsKey: rideID.toString(),
                            values: {
                                enableColourMatching: false,
                                enableColourReset: false,
                            }
                        });
                        this.ridesToPaint.splice(ridePaintPreferenceIdx, 1);
                    }
                    break;
                }
            /* case "ridesetstatus": // close/reopen ride
            {
                const index = this.selector.rideIndex;
                if (index !== null)
                {
                    const ride = this.selector.ride.get();
                    const statusUpdate = (event.args as RideSetStatusArgs);

                    if (ride !== null && ride.rideId === statusUpdate.ride)
                    {
                        Log.debug("(watcher) Ride status changed.");
                        this.selector.selectRide(index, this.selector.trainIndex ?? 0, this.selector.vehicleIndex ?? 0);
                    }
                }
                break;
            } */
        }

        // Log.debug(`<${action}>\n\t- type: ${event.type}\n\t- args: ${JSON.stringify(event.args)}\n\t- result: ${JSON.stringify(event.result)}`);
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
