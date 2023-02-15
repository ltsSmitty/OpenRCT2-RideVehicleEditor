import { TailModeProperties, TailModePropertiesObj, } from './../objects/tailModeProps';
import { FlatTrainProperties, TrainModePropertiesObj } from './../objects/trainModeProps';
import * as Environment from "../environment";
import * as Log from "../utilities/logger";
import { ParkRide } from "../objects/parkRide";
import { PaintProps, PaintMode } from '../objects/PaintPropsObj';

const saveKey = `${Environment.pluginName}.rideProps`;

/**
 * Load all the props from storage on park load. If the save gets corrupted, use the `reset` flat to clear the saved props and start again.
 * @param props.reset
 * @returns
 */
export const loadAllPropsOnOpen = (props?: { reset: boolean }): PaintProps[] => {
    const rideProps: PaintProps[] = [];
    for (let i = 0; i < map.numRides; i++) {
        Log.debug(`Loading Props for ride ${i}`);

        // It is possible during development for the plugin to reach an unstable state where the rideProps don't align with the park values
        // If that happens, run this with the `reset` flag to clear the storage and start again
        if (props?.reset) {
            const rideIDAsKey = i.toString();
            context.getParkStorage(saveKey).set(
                rideIDAsKey,
                undefined
            );
        }
        const pref = getRideProps(i);
        if (pref) rideProps.push(pref);
    }
    return rideProps;

};

/**
 * Load the paint props from parkStorage for a specific ride.
 */
const getRideProps = (rideID?: number | string): PaintProps | undefined => {
    if (!rideID) return undefined;
    const rideIDAsKey = rideID.toString();
    const props = <FlatPaintProps | undefined>context.getParkStorage(saveKey).get(rideIDAsKey);

    // if the props were loaded from storage, need to rehydrate the ParkRide object
    if (props && "numberVehicleSets" in props.trainModeProps) {
        // todo old saves might end up corrupted after this change
        return unflattenPaintProps(props);
    }
    return;
};

/**
 * Save the paint props to parkStorage for a specific ride.
 */
const saveRideProps = (props: PaintProps): void => {
    const rideIDAsKey = props.ride[0].ride().id.toString();
    const flattenedProps = flattenPaintProps(props);

    context.getParkStorage(saveKey).set(
        rideIDAsKey,
        flattenedProps
    );
};

export const propStorage = {
    getRideProps,
    saveRideProps,
};

type FlatPaintProps = {
    ride: [number, number]
    colouringEnabled: boolean
    mode: PaintMode,
    trainModeProps: FlatTrainProperties
    tailModeProps: TailModeProperties
};


const flattenPaintProps = (props: PaintProps): FlatPaintProps => {
    return {
        ride: [props.ride[0].id, props.ride[1]],
        colouringEnabled: props.colouringEnabled,
        mode: props.mode,
        trainModeProps: props.trainModeProps.flatten(),
        tailModeProps: props.tailModeProps.flatten()
    };
};

const unflattenPaintProps = (props: FlatPaintProps): PaintProps => {
    const newTrainObj = new TrainModePropertiesObj();
    newTrainObj.unflatten(props.trainModeProps);

    const newTailObj = new TailModePropertiesObj();
    newTailObj.unflatten(props.tailModeProps);

    return {
        ride: [new ParkRide(props.ride[0]), props.ride[1]],
        colouringEnabled: props.colouringEnabled,
        mode: props.mode,
        trainModeProps: newTrainObj,
        tailModeProps: newTailObj
    };
}


