import { store, Store } from "openrct2-flexui";
import { NumberOfSetsOrColours } from "./PaintPropsObj";
import * as Log from "../utilities/logger";
import _ from "lodash-es";

export type PaintStartProps = "withFirstCar" | "afterLastCar";

export type PaintEndProps = "afterFirstCar" | "afterLastCar" | "perpetual" | "afterNSegments";

export type ColourSet = {
    vehicleColours: { body: number, trim: number, tertiary: number },
    trackColours: { main: number, additional: number, supports: number };
};

type ThreeTuple<T> = [T, T, T];

export interface TrainModeProperties {
    colourSets: ThreeTuple<ColourSet>,
    paintStart: ThreeTuple<PaintStartProps>,
    paintEnd: ThreeTuple<PaintEndProps>,
    numberOfNSegments: ThreeTuple<number>
}

type TrainPropertiesStoreType = {
    // create a type the turns TrainModeProperties into TrainModePropertiesStore
    [P in keyof TrainModeProperties]: TrainModeProperties[P] extends infer U ? Store<U> : never;
};

const defaultColourSet: ColourSet = {
    vehicleColours: { body: 0, trim: 0, tertiary: 0 },
    trackColours: { main: 0, additional: 0, supports: 0 }
};
const defaultColourSets: ThreeTuple<ColourSet> = [{ ...defaultColourSet }, { ...defaultColourSet }, { ...defaultColourSet }];
const defaultPaintStart: ThreeTuple<PaintStartProps> = ["withFirstCar", "withFirstCar", "withFirstCar"];
const defaultPaintEnd: ThreeTuple<PaintEndProps> = ["perpetual", "perpetual", "perpetual"];
const defaultNSegments: ThreeTuple<number> = [3, 3, 3];
const defaultNumberVehicleSets: NumberOfSetsOrColours = 1;

const defaultTrainModePropsStore: TrainPropertiesStoreType = {
    colourSets: store<ThreeTuple<ColourSet>>(defaultColourSets),
    paintStart: store<ThreeTuple<PaintStartProps>>(defaultPaintStart),
    paintEnd: store<ThreeTuple<PaintEndProps>>(defaultPaintEnd),
    numberOfNSegments: store<ThreeTuple<number>>(defaultNSegments),
};

export type FlatTrainProperties = TrainModeProperties & { numberVehicleSets: NumberOfSetsOrColours };

export class TrainModePropertiesObj implements TrainPropertiesStoreType {
    readonly numberVehicleSets = store<NumberOfSetsOrColours>(defaultNumberVehicleSets);
    readonly colourSets = store<ThreeTuple<ColourSet>>(defaultColourSets);
    readonly paintStart = store<ThreeTuple<PaintStartProps>>(defaultPaintStart);
    readonly paintEnd = store<ThreeTuple<PaintEndProps>>(defaultPaintEnd);
    readonly numberOfNSegments = store<ThreeTuple<number>>(defaultNSegments);

    // areColourSetsTheSame(): void {
    //     Log.debug(`Are the vehicle sets the same object? ${this.colourSets.get()[0].vehicleColours === this.colourSets.get()[1].vehicleColours}`);
    //     Log.debug(`Are the vehicle sets the same object? ${this.colourSets.get()[0].vehicleColours == this.colourSets.get()[1].vehicleColours}`);
    // }

    reset(): void {
        Log.debug(`Resetting train mode properties to defaults.`);
        this.colourSets.set({ ...defaultColourSets });
        this.paintStart.set({ ...defaultTrainModePropsStore.paintStart.get() });
        this.paintEnd.set({ ...defaultTrainModePropsStore.paintEnd.get() });
        this.numberOfNSegments.set({ ...defaultTrainModePropsStore.numberOfNSegments.get() });
        this.numberVehicleSets.set(defaultNumberVehicleSets);
    }

    setVehicleColour(params: { trainIndex: 0 | 1 | 2, part: keyof ColourSet["vehicleColours"], colour: number }): void {
        const colourSets = this.colourSets.get();
        colourSets[params.trainIndex].vehicleColours[params.part] = (params.colour);

        this.colourSets.set({ ...colourSets });
    }

    setTrackColour(params: { trainIndex: 0 | 1 | 2, part: keyof ColourSet["trackColours"], colour: number }): void {
        const colourSets = this.colourSets.get();
        colourSets[params.trainIndex].trackColours[params.part] = (params.colour);

        this.colourSets.set({ ...colourSets });
    }

    prettyPrintVehicleColours(): void {
        Log.debug(`Vehicle colours:
        [ ${this.colourSets.get()[0].vehicleColours.body}, ${this.colourSets.get()[0].vehicleColours.trim}, ${this.colourSets.get()[0].vehicleColours.tertiary} ]
        [ ${this.colourSets.get()[1].vehicleColours.body}, ${this.colourSets.get()[1].vehicleColours.trim}, ${this.colourSets.get()[1].vehicleColours.tertiary} ]
        [ ${this.colourSets.get()[2].vehicleColours.body}, ${this.colourSets.get()[2].vehicleColours.trim}, ${this.colourSets.get()[2].vehicleColours.tertiary} ]`);
    }

    setPaintStart(params: { trainIndex: 0 | 1 | 2, paintStart: PaintStartProps }): void {
        const paintStart = this.paintStart.get();
        paintStart[params.trainIndex] = params.paintStart;
        this.paintStart.set({ ...paintStart });
    }

    setPaintEnd(params: { trainIndex: 0 | 1 | 2, paintEnd: PaintEndProps }): void {
        const paintEnd = this.paintEnd.get();
        paintEnd[params.trainIndex] = params.paintEnd;
        this.paintEnd.set({ ...paintEnd });
    }

    setNumberOfNSegments(params: { trainIndex: 0 | 1 | 2, numberOfNSegments: number }): void {
        const numberOfNSegments = this.numberOfNSegments.get();
        numberOfNSegments[params.trainIndex] = params.numberOfNSegments;
        this.numberOfNSegments.set({ ...numberOfNSegments });
    }

    setFromExistingProps(trainModeProps: TrainModePropertiesObj): void {
        this.colourSets.set(trainModeProps.colourSets.get());
        this.paintStart.set(trainModeProps.paintStart.get());
        this.paintEnd.set(trainModeProps.paintEnd.get());
        this.numberOfNSegments.set(trainModeProps.numberOfNSegments.get());
        this.numberVehicleSets.set(trainModeProps.numberVehicleSets.get());
    }

    flatten(): FlatTrainProperties {
        return {
            colourSets: { ...this.colourSets.get() },
            paintStart: this.paintStart.get(),
            paintEnd: this.paintEnd.get(),
            numberOfNSegments: this.numberOfNSegments.get(),
            numberVehicleSets: this.numberVehicleSets.get(),
        };
    }

    setColourSets(colourSets: ThreeTuple<ColourSet>): void {
        this.colourSets.set([
            {
                vehicleColours: _.cloneDeep(colourSets[0].vehicleColours),
                trackColours: _.cloneDeep(colourSets[0].trackColours),
            },
            {
                vehicleColours: _.cloneDeep(colourSets[1].vehicleColours),
                trackColours: _.cloneDeep(colourSets[1].trackColours),
            },
            {
                vehicleColours: _.cloneDeep(colourSets[2].vehicleColours),
                trackColours: _.cloneDeep(colourSets[2].trackColours),
            }]);

    }

    unflatten(flatProps: FlatTrainProperties): void {

        if (!flatProps.colourSets) { return; }
        Log.debug(`Unflatten`);
        // Log.debug(`flatProps.colourSets: ${JSON.stringify(flatProps.colourSets)}`);

        const vehicleProps = [flatProps.colourSets[0].vehicleColours, flatProps.colourSets[1].vehicleColours, flatProps.colourSets[2].vehicleColours];

        this.setColourSets(flatProps.colourSets);
        this.paintStart.set(flatProps.paintStart);
        this.paintEnd.set(flatProps.paintEnd);
        this.numberOfNSegments.set(flatProps.numberOfNSegments);
        this.numberVehicleSets.set(flatProps.numberVehicleSets);

    }
}
