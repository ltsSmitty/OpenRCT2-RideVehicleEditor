import { store, Store, Colour } from "openrct2-flexui";
import { NumberOfSetsOrColours } from "./PaintPropsObj";
import * as Log from "../utilities/logger";
import _ from "lodash-es";

export type PaintStartProps = "withFirstCar" | "afterLastCar" | "beforeNSegments";

export type PaintEndProps = "afterFirstCar" | "afterLastCar" | "perpetual" | "afterNSegments";

export type ColourSet = {
    vehicleColours: { body: Colour, trim: Colour, tertiary: Colour },
    trackColours: { main: Colour, additional: Colour, supports: Colour };
};

export type ThreeTuple<T> = [T, T, T];

export interface TrainModeProperties {
    colourSets: ThreeTuple<ColourSet>,
    paintStart: ThreeTuple<PaintStartProps>,
    paintEnd: ThreeTuple<PaintEndProps>,
    numberOfNSegmentsBefore: ThreeTuple<number>
    numberOfNSegmentsAfter: ThreeTuple<number>
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
    numberOfNSegmentsBefore: store<ThreeTuple<number>>(defaultNSegments),
    numberOfNSegmentsAfter: store<ThreeTuple<number>>(defaultNSegments),
};

export type FlatTrainProperties = TrainModeProperties & { numberVehicleSets: NumberOfSetsOrColours };

export class TrainModePropertiesObj implements TrainPropertiesStoreType {
    readonly numberVehicleSets = store<NumberOfSetsOrColours>(defaultNumberVehicleSets);
    readonly colourSets = store<ThreeTuple<ColourSet>>(defaultColourSets);
    readonly paintStart = store<ThreeTuple<PaintStartProps>>(defaultPaintStart);
    readonly paintEnd = store<ThreeTuple<PaintEndProps>>(defaultPaintEnd);
    readonly numberOfNSegmentsBefore = store<ThreeTuple<number>>(defaultNSegments);
    readonly numberOfNSegmentsAfter = store<ThreeTuple<number>>(defaultNSegments);

    reset(): void {
        Log.debug(`Resetting train mode properties to defaults.`);
        this.colourSets.set({ ...defaultColourSets });
        this.paintStart.set({ ...defaultTrainModePropsStore.paintStart.get() });
        this.paintEnd.set({ ...defaultTrainModePropsStore.paintEnd.get() });
        this.numberOfNSegmentsBefore.set({ ...defaultTrainModePropsStore.numberOfNSegmentsBefore.get() });
        this.numberOfNSegmentsAfter.set({ ...defaultTrainModePropsStore.numberOfNSegmentsAfter.get() });
        this.numberVehicleSets.set(defaultNumberVehicleSets);
    }

    setVehicleColour(params: { trainIndex: 0 | 1 | 2, part: keyof ColourSet["vehicleColours"], colour: number }): void {
        const colourSets = this.colourSets.get();
        colourSets[params.trainIndex].vehicleColours[params.part] = (params.colour);

        this.colourSets.set({ ...colourSets });
        this.prettyPrintVehicleColours();
    }

    setTrackColour(params: { trainIndex: 0 | 1 | 2, part: keyof ColourSet["trackColours"], colour: number }): void {
        const colourSets = this.colourSets.get();
        colourSets[params.trainIndex].trackColours[params.part] = (params.colour);

        this.colourSets.set({ ...colourSets });

        this.prettyPrintTrackColours();
    }

    prettyPrintVehicleColours(): void {
        Log.debug(`Vehicle colours:
        [ ${this.colourSets.get()[0].vehicleColours.body}, ${this.colourSets.get()[0].vehicleColours.trim}, ${this.colourSets.get()[0].vehicleColours.tertiary} ]
        [ ${this.colourSets.get()[1].vehicleColours.body}, ${this.colourSets.get()[1].vehicleColours.trim}, ${this.colourSets.get()[1].vehicleColours.tertiary} ]
        [ ${this.colourSets.get()[2].vehicleColours.body}, ${this.colourSets.get()[2].vehicleColours.trim}, ${this.colourSets.get()[2].vehicleColours.tertiary} ]`);
    }

    prettyPrintTrackColours(): void {
        Log.debug(`Track colours:
        [ ${this.colourSets.get()[0].trackColours.main}, ${this.colourSets.get()[0].trackColours.additional}, ${this.colourSets.get()[0].trackColours.supports} ]
        [ ${this.colourSets.get()[1].trackColours.main}, ${this.colourSets.get()[1].trackColours.additional}, ${this.colourSets.get()[1].trackColours.supports} ]
        [ ${this.colourSets.get()[2].trackColours.main}, ${this.colourSets.get()[2].trackColours.additional}, ${this.colourSets.get()[2].trackColours.supports} ]`);
    }

    setPaintStart(params: { trainIndex: 0 | 1 | 2, paintStart: PaintStartProps }): void {
        Log.debug(`Setting paint start to withFirstCar for train ${params.trainIndex}`);
        const paintStart = this.paintStart.get();
        paintStart[params.trainIndex] = params.paintStart;
        this.paintStart.set({ ...paintStart });
    }

    setPaintEnd(params: { trainIndex: 0 | 1 | 2, paintEnd: PaintEndProps }): void {
        Log.debug(`Setting paint end to afterFirstCar for train ${params.trainIndex}`);
        const paintEnd = this.paintEnd.get();
        paintEnd[params.trainIndex] = params.paintEnd;
        this.paintEnd.set({ ...paintEnd });
    }

    setNumberOfNSegments(params: { trainIndex: 0 | 1 | 2, numberOfNSegments: number, position: "before" | "after" }): void {
        Log.debug(`Setting number of n segments to ${params.numberOfNSegments} for train ${params.trainIndex}`);
        const numberOfNSegments = params.position == "before" ? this.numberOfNSegmentsBefore.get() : this.numberOfNSegmentsAfter.get();
        numberOfNSegments[params.trainIndex] = params.numberOfNSegments;
        params.position == "before"
            ? this.numberOfNSegmentsBefore.set({ ...numberOfNSegments })
            : this.numberOfNSegmentsAfter.set({ ...numberOfNSegments });
    }

    setFromExistingProps(trainModeProps: TrainModePropertiesObj): void {
        this.colourSets.set(trainModeProps.colourSets.get());
        this.paintStart.set(trainModeProps.paintStart.get());
        this.paintEnd.set(trainModeProps.paintEnd.get());
        this.numberOfNSegmentsBefore.set(trainModeProps.numberOfNSegmentsBefore?.get() ?? defaultNSegments);
        this.numberOfNSegmentsAfter.set(trainModeProps.numberOfNSegmentsAfter?.get() ?? defaultNSegments);
        this.numberVehicleSets.set(trainModeProps.numberVehicleSets.get());
    }

    flatten(): FlatTrainProperties {
        return {
            colourSets: { ...this.colourSets.get() },
            paintStart: this.paintStart.get(),
            paintEnd: this.paintEnd.get(),
            numberOfNSegmentsBefore: this.numberOfNSegmentsBefore.get(),
            numberOfNSegmentsAfter: this.numberOfNSegmentsAfter.get(),
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

        this.setColourSets(flatProps.colourSets);
        this.paintStart.set(flatProps.paintStart);
        this.paintEnd.set(flatProps.paintEnd);
        this.numberOfNSegmentsBefore.set(flatProps.numberOfNSegmentsBefore);
        this.numberOfNSegmentsAfter.set(flatProps.numberOfNSegmentsAfter);
        this.numberVehicleSets.set(flatProps.numberVehicleSets);

    }

    getTrainSetInfo(index: number): TrainSetInfo {
        return {
            vehicleColours: this.colourSets.get()[index].vehicleColours,
            trackColours: this.colourSets.get()[index].trackColours,
            paintStart: this.paintStart.get()[index],
            paintEnd: this.paintEnd.get()[index],
            numberOfNSegmentsBefore: this.numberOfNSegmentsBefore.get()[index],
            numberOfNSegmentsAfter: this.numberOfNSegmentsAfter.get()[index],
        };
    }
}

type TrainSetInfo = {
    vehicleColours: ColourSet["vehicleColours"],
    trackColours: ColourSet["trackColours"],
    paintStart: PaintStartProps,
    paintEnd: PaintEndProps,
    numberOfNSegmentsBefore: number,
    numberOfNSegmentsAfter: number,
};
