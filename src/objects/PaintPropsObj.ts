import { store, Store } from "openrct2-flexui";
import * as Log from "../utilities/logger"
import { ParkRide } from "./parkRide";
import { PaintEndProps, PaintStartProps, TrainModePropertiesObj, ColourSet } from "./trainModeProps";
import { propStorage as storage } from '../services/preferenceSerializer';

export type PaintMode = "train" | "tail";

export const paintModes: PaintMode[] = ["train", "tail"];

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
    trainModeProps: TrainModePropertiesObj;
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

export class PaintPropsObj {
    readonly rideStore = store<[ParkRide, number] | null>(null);
    readonly colouringEnabledStore = store<boolean>(false);
    readonly modeStore: Store<PaintMode> = store<PaintMode>("train");
    readonly tailModeProps: Store<TailModeProps> = store<TailModeProps>(defaultTailModeProps);
    readonly trainModeProps = new TrainModePropertiesObj();

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
            Log.debug(`No saved values for ride ${ride ? ride[0].id : undefined} - setting default values.`);
            this.resetValues();
            return;
        }

        // set the loaded values
        this.colouringEnabled = savedValues.colouringEnabled;
        this.mode = savedValues.mode;
        this.trainModeProps.numberOfVehicleSets = savedValues.trainModeProps.numberOfVehicleSets;

        // set the vehicle props to that of the loaded values
        this.trainModeProps.vehicleProps.forEach((vehicleProps, index) => {
            Log.debug(`Setting vehicle props for vehicle ${index} to ${savedValues.trainModeProps.vehicleProps[index].get()} (was ${vehicleProps.get()})`);
            vehicleProps.set(savedValues.trainModeProps.vehicleProps[index].get());
        });

        // this.tailModeProps.set(savedValues.tailModeProps);

        this.saveProps();
    }

    set numberVehicleSets(numberOfSets: NumberOfSetsOrColours) {
        this.trainModeProps.numberOfVehicleSets = numberOfSets;
        this.saveProps();
    }

    get numberVehicleSets(): NumberOfSetsOrColours {
        return this.trainModeProps.numberOfVehicleSets;
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

    // set trainColours(params: { colours: ColourSet, index: 0 | 1 | 2 }) {
    //     this.trainModeProps.vehicleProps[params.index].colourSet.set(params.colours);
    //     this.saveProps();
    // }

    set trainPaintStart(params: { paintStart: PaintStartProps, index: 0 | 1 | 2 }) {
        this.trainModeProps.vehicleProps[params.index].paintStart.set(params.paintStart);
        this.saveProps();
    }

    set trainPaintEnd(params: { paintEnd: PaintEndProps, index: 0 | 1 | 2 }) {
        this.trainModeProps.vehicleProps[params.index].paintEnd.set(params.paintEnd);
        this.saveProps();
    }

    set trainNumberOfNSegments(params: { numberOfNSegments: number, index: 0 | 1 | 2 }) {
        this.trainModeProps.vehicleProps[params.index].numberOfNSegments.set(params.numberOfNSegments);
        this.saveProps();
    }

    updateTailModeProps(props: TailModeProps): void {
        this.tailModeProps.set(props);
        this.saveProps();
    }

    resetValues(): void {
        this.colouringEnabled = false;
        this.mode = "train";
        this.trainModeProps.vehicleProps.forEach((props) => props.reset());
        // this.tailModeProps.set(defaultTailModeProps);
        this.saveProps();
    }

    saveProps(): void {
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
