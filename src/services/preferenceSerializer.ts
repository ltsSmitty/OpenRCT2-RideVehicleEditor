import * as Environment from "../environment";
import { PaintProps } from "../viewmodels/viewModel";
import * as Log from "../utilities/logger";
import { ParkRide } from "../objects/parkRide";

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
    const props = <PaintProps | undefined>context.getParkStorage(saveKey).get(rideIDAsKey);

    // if the props were loaded from storage, need to rehydrate the ParkRide object
    if (props && "ride" in props) {
        props.ride = [new ParkRide(props.ride[0].id), props.ride[1]];
    }
    return props;
};

/**
 * Save the paint props to parkStorage for a specific ride.
 */
const saveRideProps = (props: PaintProps): void => {
    const rideIDAsKey = props.ride[0].ride().id.toString();

    context.getParkStorage(saveKey).set(
        rideIDAsKey,
        props
    );
};

export const propStorage = {
    getRideProps,
    saveRideProps,
};
