import { store, Store } from "openrct2-flexui";
import { NumberOfSetsOrColours } from "./PaintPropsObj";
import * as Log from "../utilities/logger";

export type PaintStartProps = "withFirstCar" | "afterLastCar";

export type PaintEndProps = "afterFirstCar" | "afterLastCar" | "perpetual" | "afterNSegments";

export type ColourSet = {
    vehicleColours: [number, number, number];
    trackColours: [number, number, number];
};

export interface TrainModeProperties {
    colourSet: ColourSet,
    paintStart: PaintStartProps,
    paintEnd: PaintEndProps,
    numberOfNSegments: number
}

// create a type the turns TrainModeProperties into TrainModePropertiesStore
type TrainModePropertiesStoreType = {
    [P in keyof TrainModeProperties]: Store<TrainModeProperties[P]>
};

const defaultColourSet: ColourSet = {
    vehicleColours: [0, 0, 0],
    trackColours: [0, 0, 0],
};

const defaultPaintStart: PaintStartProps = "withFirstCar";
const defaultPaintEnd: PaintEndProps = "perpetual";
const defaultNSegments: number = 3;
const defaultNumberVehicleSets = 1;

const defaultTrainModeProps: TrainModePropertiesStoreType = {
    colourSet: store<ColourSet>({ ...defaultColourSet }),
    paintStart: store<PaintStartProps>(defaultPaintStart),
    paintEnd: store<PaintEndProps>(defaultPaintEnd),
    numberOfNSegments: store<number>(defaultNSegments),
};

export class TrainModeVehicleProps implements TrainModePropertiesStoreType {
    readonly id = Math.floor(Math.random() * 10000);
    readonly colourSet = store<ColourSet>(defaultTrainModeProps.colourSet.get());
    readonly paintStart = defaultTrainModeProps.paintStart;
    readonly paintEnd = defaultTrainModeProps.paintEnd;
    readonly numberOfNSegments = defaultTrainModeProps.numberOfNSegments;

    reset(): void {
        Log.debug(`Resetting train ${this.id}`);
        this.colourSet.set({ ...defaultColourSet });
        this.paintStart.set(defaultPaintStart);
        this.paintEnd.set(defaultPaintEnd);
        this.numberOfNSegments.set(defaultNSegments);
    }

    set(trainModeProperties: TrainModeProperties): void {
        Log.debug(`Setting train ${this.id}`);
        this.colourSet.set({ ...trainModeProperties.colourSet });
        this.paintStart.set(trainModeProperties.paintStart);
        this.paintEnd.set(trainModeProperties.paintEnd);
        this.numberOfNSegments.set(trainModeProperties.numberOfNSegments);
    }

    get(): TrainModeProperties {
        return {
            colourSet: this.colourSet.get(),
            paintStart: this.paintStart.get(),
            paintEnd: this.paintEnd.get(),
            numberOfNSegments: this.numberOfNSegments.get(),
        };
    }

    constructor() {
        this.colourSet.subscribe((newColourSet) => {
            Log.debug(`train ${this.id}: colourSet changed to ${JSON.stringify(newColourSet)}`);
        });
    }
}


export type FlatTrainModeProperties = { trainModeProperties: TrainModeProperties[], numberOfVehicleSets: NumberOfSetsOrColours };

export class TrainModePropertiesObj {
    readonly numberVehicleSets = store<NumberOfSetsOrColours>(defaultNumberVehicleSets);
    readonly vehicleProps: [TrainModeVehicleProps, TrainModeVehicleProps, TrainModeVehicleProps] = [new TrainModeVehicleProps(), new TrainModeVehicleProps(), new TrainModeVehicleProps()];

    get numberOfVehicleSets(): NumberOfSetsOrColours {
        return this.numberVehicleSets.get();
    }

    set numberOfVehicleSets(numberOfVehicleSets: NumberOfSetsOrColours) {
        this.numberVehicleSets.set(numberOfVehicleSets);
    }

    flatten(): FlatTrainModeProperties {
        const trainModeProperties: TrainModeProperties[] = [];
        for (let i = 0; i < this.numberOfVehicleSets; i++) {
            trainModeProperties.push({
                colourSet: this.vehicleProps[i].colourSet.get(),
                paintStart: this.vehicleProps[i].paintStart.get(),
                paintEnd: this.vehicleProps[i].paintEnd.get(),
                numberOfNSegments: this.vehicleProps[i].numberOfNSegments.get(),
            });
        }
        return { trainModeProperties, numberOfVehicleSets: this.numberOfVehicleSets };
    }

    unflatten(flatProps: FlatTrainModeProperties): void {
        this.numberOfVehicleSets = flatProps.numberOfVehicleSets;
        for (let i = 0; i < this.numberOfVehicleSets; i++) {
            this.vehicleProps[i].set(flatProps.trainModeProperties[i]);
        }
    }

    updateFromExisting(trainModePropsObj: TrainModePropertiesObj): void {
        this.numberOfVehicleSets = trainModePropsObj.numberOfVehicleSets;
        for (let i = 0; i < this.numberOfVehicleSets; i++) {
            this.vehicleProps[i].set(trainModePropsObj.vehicleProps[i].get());
        }
    }



    reset(): void {
        this.numberVehicleSets.set(defaultNumberVehicleSets);
        for (let i = 0; i < 3; i++) {
            this.vehicleProps[i].reset();
        }
    }
}
