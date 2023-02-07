import { loadAllPropsOnOpen, propStorage as storage } from '../services/preferenceSerializer';
import { Store, store, arrayStore, ArrayStore } from "openrct2-flexui";
import { getAllRides, ParkRide } from "../objects/parkRide";
import { findIndex } from "../utilities/arrayHelper";
import * as Log from "../utilities/logger";
import _ from "lodash-es";
import { TrainWatcher } from '../services/trainWatcher';
import ColourChange from '../services/ridePainter';

type PaintMode = "train" | "tail";

export const paintModes: PaintMode[] = ["train", "tail"];

type PaintStartProps = "withFirstCar" | "afterLastCar";

type PaintEndProps = "afterFirstCar" | "afterLastCar" | "perpetual" | "afterNSegments";

export type NumberOfSetsOrColours = 1 | 2 | 3;

export const propKeyStrings: Record<PaintEndProps | PaintStartProps | PaintMode | NumberOfSetsOrColours, string> = {
    "afterFirstCar": "After first car",
    "afterLastCar": "After last car",
    "perpetual": "Perpetual",
    "afterNSegments": "After N segments",
    "withFirstCar": "With first car",
    "train": "Train Mode",
    "tail": "Tail Mode",
    1: "1",
    2: "2",
    3: "3",
} as const;

export type ColourSet = {
    vehicleColours: [number, number, number];
    trackColours: [number, number, number];
};

export interface TrainModeProps {
    numberVehicleSets: NumberOfSetsOrColours,
    vehicleSetColours: ColourSet[],
    paintStart: PaintStartProps,
    paintEnd: PaintEndProps,
}

export type TailProps = {
    tailColours: {
        main: number,
        additional: number,
        supports: number
    };
    tailLength: number;
};

export interface TailModeProps {
    numberOfTailColours: NumberOfSetsOrColours,
    paintStart: PaintStartProps,
    tailProps: TailProps[],
}

export type PaintProps = {
    ride: [ParkRide, number],
    colouringEnabled: boolean,
    mode: PaintMode,
    trainModeProps: TrainModeProps;
    tailModeProps: TailModeProps;
};


const defaultTailColourProps: TailProps[] = [
    {
        tailColours: {
            main: 26,
            additional: 21,
            supports: 26
        },
        tailLength: 3,
    },
    {
        tailColours: {
            main: 21,
            additional: 20,
            supports: 21
        },
        tailLength: 2,
    },
    {
        tailColours: {
            main: 20,
            additional: 19,
            supports: 20
        },
        tailLength: 1,
    }
];

const defaultTailModeProps: TailModeProps = {
    numberOfTailColours: 3,
    paintStart: "afterLastCar",
    tailProps: defaultTailColourProps
};

const defaultTrainModeProps: TrainModeProps = {
    numberVehicleSets: 1,
    vehicleSetColours: [
        {
            vehicleColours: [0, 0, 0],
            trackColours: [0, 0, 0],
        },
        {
            vehicleColours: [0, 2, 0],
            trackColours: [2, 0, 2],
        },
        {
            vehicleColours: [1, 1, 1],
            trackColours: [9, 1, 1],
        }
    ],
    paintStart: "afterLastCar",
    paintEnd: "afterLastCar",
};

export type TrainModeStores = {
    numberVehicleSets: Store<NumberOfSetsOrColours>,
    vehicleSetColours: Store<ColourSet[]>, // 3
    paintStart: Store<PaintStartProps>,
    paintEnd: Store<PaintEndProps>,
};

export class PaintPropsObj {
    readonly rideStore = store<[ParkRide, number] | null>(null);
    readonly colouringEnabledStore = store<boolean>(false);
    readonly modeStore: Store<PaintMode> = store<PaintMode>("train");
    readonly tailModeProps: Store<TailModeProps> = store<TailModeProps>(defaultTailModeProps);
    readonly trainModePropsStores: TrainModeStores = {
        numberVehicleSets: store<NumberOfSetsOrColours>(1),
        vehicleSetColours: store<ColourSet[]>([
            (defaultTrainModeProps.vehicleSetColours[0]),
            (defaultTrainModeProps.vehicleSetColours[1]),
            (defaultTrainModeProps.vehicleSetColours[2]),
        ]),
        paintStart: store<PaintStartProps>("withFirstCar"),
        paintEnd: store<PaintEndProps>("perpetual"),
    };

    private propChangeCallback: (props: PaintProps) => void;

    constructor(propChangeCallback: (props: PaintProps) => void) {
        this.propChangeCallback = propChangeCallback;
    }

    get ride(): [ParkRide, number] | null {
        return this.rideStore.get();
    }

    set ride(ride: [ParkRide, number] | null) {
        this.rideStore.set(ride);

        const savedValues = storage.getRideProps(ride ? ride[0].id : undefined);
        if (!savedValues) { // set default values]
            this.resetValues();
            return;
        }

        // set the loaded values
        this.colouringEnabled = savedValues.colouringEnabled;
        this.mode = savedValues.mode;
        this.trainModeProps = savedValues.trainModeProps;
        // this.tailModeProps.set(savedValues.tailModeProps);

        this.saveProps();
    }

    set numberVehicleSets(numberOfSets: NumberOfSetsOrColours) {
        this.trainModeProps.numberVehicleSets = numberOfSets;
        this.saveProps();
    }

    get numberVehicleSets(): NumberOfSetsOrColours {
        return this.trainModeProps.numberVehicleSets;
    }


    set mode(mode: PaintMode) {
        this.modeStore.set(mode);
        this.saveProps();
    }

    get mode(): PaintMode {
        return this.modeStore.get();
    }

    set colouringEnabled(enabled: boolean) {
        this.colouringEnabledStore.set(enabled);
        this.saveProps();
    }

    get colouringEnabled(): boolean {
        return this.colouringEnabledStore.get();
    }

    set trainModeProps(props: TrainModeProps) {
        this.trainModePropsStores.numberVehicleSets.set(props.numberVehicleSets);
        this.trainModePropsStores.vehicleSetColours.set([
            props.vehicleSetColours[0],
            props.vehicleSetColours[1],
            props.vehicleSetColours[2],
        ]);
        this.trainModePropsStores.paintStart.set(props.paintStart);
        this.trainModePropsStores.paintEnd.set(props.paintEnd);
        this.saveProps();
    }

    get trainModeProps(): TrainModeProps {
        return {
            numberVehicleSets: this.trainModePropsStores.numberVehicleSets.get(),
            vehicleSetColours: this.trainModePropsStores.vehicleSetColours.get(),
            paintStart: this.trainModePropsStores.paintStart.get(),
            paintEnd: this.trainModePropsStores.paintEnd.get(),
        };
    }

    updateTailModeProps(props: TailModeProps): void {
        this.tailModeProps.set(props);
        this.saveProps();
    }

    resetValues(): void {
        this.colouringEnabled = false;
        this.mode = "train";
        this.trainModeProps = defaultTrainModeProps;
        // this.tailModeProps.set(defaultTailModeProps);
        this.saveProps();
    }

    private saveProps(): void {
        if (!this.ride) {
            Log.debug(`Attempted to save, but no ride was selected.`);
            return;
        }

        const props: PaintProps = {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            ride: this.ride,
            colouringEnabled: this.colouringEnabled,
            mode: this.mode,
            trainModeProps: this.trainModeProps,
            tailModeProps: this.tailModeProps.get(),
        };

        storage.saveRideProps(props);
        this.propChangeCallback(props);
    }
}

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
        this.painter.trainModePropsStores.vehicleSetColours.subscribe(() => this.onVehicleColourSetChange()); // handle updating the serialised values
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
        this.painter.trainModeProps = (props?.trainModeProps ?? defaultTrainModeProps);
        // this.painter.tailModeProps =(props?.tailModeProps ?? defaultTailModeProps);
    }

    private onVehicleColourSetChange(): void {
        const colourSets = this.painter.trainModePropsStores.vehicleSetColours.get();
        Log.debug(`Colour sets changed to ${JSON.stringify(colourSets, null, 2)}`);
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
        Log.debug(JSON.stringify(loadedPreferences, null, 2));
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
        // loop through all the trains of the ride and paint them accordingly
        const ride = this.painter.ride;
        const colours = this.painter.trainModePropsStores.vehicleSetColours.get();
        Log.debug(`Colours: ${JSON.stringify(colours, null, 2)}`);
        const { numberVehicleSets, vehicleSetColours } = this.painter.trainModePropsStores;

        if (!ride) return;
        const numTrains = ride[0].trains().length;

        ColourChange.setRideVehicleScheme({ rideID: ride[0].ride().id, scheme: "perTrain" });


        for (let i = 0; i < numTrains; i++) {
            Log.debug(`Colouring train ${i}`);
            if (numberVehicleSets.get() === 1) {
                // set all vehicles to the same colour
                Log.debug(`colours ${JSON.stringify(vehicleSetColours)[0]}`);
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 3,
                    colour: vehicleSetColours.get()[0].vehicleColours[0],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 4,
                    colour: vehicleSetColours.get()[0].vehicleColours[1],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 5,
                    colour: vehicleSetColours.get()[0].vehicleColours[2],
                });
            }
            if (numberVehicleSets.get() === 2) {
                // check i % 2 for colouration
                Log.debug(`colours ${JSON.stringify(vehicleSetColours)[1]}`);
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 3,
                    colour: vehicleSetColours.get()[(i % 2)].vehicleColours[0],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 4,
                    colour: vehicleSetColours.get()[(i % 2)].vehicleColours[1],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 5,
                    colour: vehicleSetColours.get()[(i % 2)].vehicleColours[2],
                });
            }
            if (numberVehicleSets.get() === 3) {
                // check i % 3 for colouration
                Log.debug(`colours ${JSON.stringify(vehicleSetColours)[2]}`);
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 3,
                    colour: vehicleSetColours.get()[(i % 3)].vehicleColours[0],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 4,
                    colour: vehicleSetColours.get()[(i % 3)].vehicleColours[1],
                });
                paintVehicle({
                    rideID: ride[0].ride().id,
                    trainIndex: i,
                    partNumber: 5,
                    colour: vehicleSetColours.get()[(i % 3)].vehicleColours[2],
                });
            }
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

// function paintTrains({ ride, trainIndex, colour, part, numberVehicleSets }:
//     {
//         ride: [ParkRide, number] | null,
//         trainIndex: number,
//         colour: number,
//         part: "body" | "trim" | "tertiary",
//         numberVehicleSets: NumberOfSetsOrColours
//     }): void {

//     if (!ride) return;
//     const partNumber = part === "body" ? 3 : part === "trim" ? 4 : 5;

//     const _ride = ride[0].ride();
//     const numTrains = ride[0].trains().length;

//     ColourChange.setRideVehicleScheme({ rideID: ride[0].id, scheme: "perTrain" });

//     for (let i = trainIndex; i < numTrains; i += numberVehicleSets) {
//         Log.debug(`attempting to paint vehicle ${i} of ${numTrains} with colour ${colour} and part ${partNumber} `);
//         paintVehicle({ rideID: _ride.id, trainIndex: i, colour: colour, partNumber });

//     }
// }

function paintVehicle(params: {
    rideID: number,
    trainIndex: number,
    partNumber: number,
    colour: number,
}): void {
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
