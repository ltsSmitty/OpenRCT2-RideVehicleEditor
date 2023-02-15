import { store, Store } from "openrct2-flexui";
import * as Log from "../utilities/logger"
import { ParkRide } from "./parkRide";
import { PaintEndProps, PaintStartProps, TrainModePropertiesObj, ColourSet } from "./trainModeProps";
import { propStorage as storage } from '../services/preferenceSerializer';
import { PatternChoice, TailModePropertiesObj } from "./tailModeProps";

export type PaintMode = "train" | "tail";

export const paintModes: PaintMode[] = ["train", "tail"];

export type NumberOfSetsOrColours = 1 | 2 | 3;

export const propKeyStrings: Record<PaintEndProps | PaintStartProps | PaintMode | NumberOfSetsOrColours | PatternChoice, string> = {
    "afterFirstCar": "After first car",
    "afterLastCar": "After last car",
    "beforeNSegments": "N segments before",
    "perpetual": "Perpetual",
    "afterNSegments": "N segments after",
    "withFirstCar": "With first car",
    "train": "Train Mode",
    "tail": "Tail Mode",
    1: "1",
    2: "2",
    3: "3",
    "before": "Before train",
    "after": "After train",
} as const;


export type PaintProps = {
    ride: [ParkRide, number],
    colouringEnabled: boolean,
    mode: PaintMode,
    trainModeProps: TrainModePropertiesObj;
    tailModeProps: TailModePropertiesObj;
};

export class PaintPropsObj {
    readonly rideStore = store<[ParkRide, number] | null>(null);
    readonly colouringEnabledStore = store<boolean>(false);
    readonly modeStore: Store<PaintMode> = store<PaintMode>("train");
    readonly tailModeProps = new TailModePropertiesObj();
    readonly trainModeProps = new TrainModePropertiesObj();

    private propChangeCallback: (props: PaintProps) => void;

    constructor(propChangeCallback: (props: PaintProps) => void) {
        this.propChangeCallback = propChangeCallback;

        this.trainModeProps.colourSets.subscribe((_colourSets: ColourSet[]): void => { // handle train mode colour sets
            Log.debug(`Saving colourSets on change.`);
            this.saveProps();
        });

        this.trainModeProps.numberVehicleSets.subscribe((_numberVehicleSets): void => { // handle train mode number of sets
            this.saveProps();
        });

        this.tailModeProps.trackColourSets.subscribe((_trackColourSets): void => { // handle tail mode colour sets
            Log.debug(`Saving tail track colourSets on change.`);
            this.saveProps();
        });

        this.tailModeProps.numberOfTailSets.subscribe((_vehicleColourSets): void => { // handle tail mode colour sets
            Log.debug(`Saving tail vehicle colourSets on change.`);
            this.saveProps();
        });
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

        Log.debug(`In set Ride, Loaded colourSet`);

        // set the loaded values
        this.colouringEnabled = savedValues.colouringEnabled;
        this.mode = savedValues.mode;
        this.trainModeProps.setFromExistingProps(savedValues.trainModeProps);
        this.tailModeProps.setFromExistingProps(savedValues.tailModeProps);

        // this.tailModeProps.set(savedValues.tailModeProps);
        this.saveProps();
    }

    setFromExistingProps(props: PaintProps): void {
        this.rideStore.set(props.ride);
        this.colouringEnabledStore.set(props.colouringEnabled);
        this.modeStore.set(props.mode);
        this.trainModeProps.setFromExistingProps(props.trainModeProps);
        this.tailModeProps.setFromExistingProps(props.tailModeProps);

        this.saveProps();
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

    resetValues(): void {
        // don't reset the ride
        this.colouringEnabled = false;
        this.mode = "train";
        this.trainModeProps.reset();
        this.tailModeProps.reset();
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
            tailModeProps: this.tailModeProps
        };

        storage.saveRideProps(props);
        this.propChangeCallback(props);
    }
}
