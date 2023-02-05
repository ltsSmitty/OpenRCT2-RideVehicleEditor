import { loadAllPreferencesOnOpen, PreferenceStorage } from './../services/preferenceSerializer';
import { Store, store, arrayStore, Colour, ArrayStore } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { findIndex } from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";
import { PreferenceStorage as storage } from "../services/preferenceSerializer";
import _ from "lodash-es";
import { TrainWatcher } from '../services/trainWatcher';

type PaintMode = "train" | "tail";

type PaintStartProps = "withFirstCar" | "afterLastCar";

type PaintEndProps = "afterFirstCar" | "afterLastCar" | "perpetual";

type NumberOfSetsOrColours = 1 | 2 | 3;

export const propKeyStrings: Record<PaintEndProps | PaintStartProps, string> = {
    "afterFirstCar": "After first car",
    "afterLastCar": "After last car",
    "perpetual": "Perpetual",
    "withFirstCar": "With first car",
} as const;

export type ColourSet = {
    vehicleColours: [Colour, Colour, Colour];
    trackColours: [Colour, Colour, Colour];
};

export interface TrainModeProps {
    mode: "train",
    numberVehicleSets: NumberOfSetsOrColours,
    vehicleSetColours: ColourSet[],
    paintStart: PaintStartProps,
    paintEnd: PaintEndProps,
}

export type TailProps = {
    tailColours: [Colour, Colour, Colour];
    tailLength: number;
};

export interface TailModeProps {
    mode: "tail",
    numberOfTailColours: NumberOfSetsOrColours,
    paintStart: PaintStartProps,
    tailProps: TailProps[],
}

export type PaintModeProps = TrainModeProps | TailModeProps;

export type PaintProps = {
    ride: ParkRide,
    colouringEnabled: boolean,
    props: PaintModeProps;
};

export type RidePaintPreference = {
    ride: ParkRide,
    values: {
        enableColourMatching: boolean,
        enableColourReset: boolean,
    },
};

const defaultTailProp: TailProps = {
    tailColours: [Colour.BordeauxRed, Colour.DarkOrange, Colour.DarkYellow],
    tailLength: 3,
};

export class PaintPropsObj {
    readonly ride = store<ParkRide | null>(null);
    readonly colouringEnabled = store<boolean>(false);
    readonly mode: Store<PaintMode> = store<PaintMode>("train");
    readonly tailModeProps = { // default preset values
        numberOfTailColours: store<NumberOfSetsOrColours>(3),
        paintStart: store<PaintStartProps>("afterLastCar"),
        tailProps: arrayStore<TailProps>([defaultTailProp]),
    };
    readonly trainModeProps = { // default preset values
        numberVehicleSets: store<NumberOfSetsOrColours>(3),
        vehicleSetColours: arrayStore<ColourSet>([
            {
                vehicleColours: [Colour.Black, Colour.Black, Colour.Black],
                trackColours: [Colour.Black, Colour.Black, Colour.Black],
            },
            {
                vehicleColours: [Colour.Black, Colour.White, Colour.Black],
                trackColours: [Colour.White, Colour.Black, Colour.White],
            },
            {
                vehicleColours: [Colour.Grey, Colour.Grey, Colour.White],
                trackColours: [Colour.Black, Colour.Grey, Colour.Grey],
            },
        ]),
        paintStart: store<PaintStartProps>("withFirstCar"),
        paintEnd: store<PaintEndProps>("afterLastCar"),
    };
}

export class RideViewModel {
    readonly selectedRide = store<[ParkRide, number] | null>(null);
    readonly colouringEnabled = store<boolean>(false);
    readonly paintMode: Store<PaintMode> = store<PaintMode>("train");
    readonly paintProps = store<PaintModeProps | null>(null);

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
        // Log.debug(`Loaded values: ${JSON.stringify(values)}`);
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

        Log.debug(`Repaint preference set for ${selectedParkRide[0].ride().name} to ${enableColourMatching}.`);

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
        Log.debug(`Loading preferences:`);
        Log.debug(JSON.stringify(loadedPreferences, null, 2));
        this.ridesToPaint.set(loadedPreferences);
    }

    private onRidesToPaintChange(): void {
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
