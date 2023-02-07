import * as Environment from "../environment";
import { PaintProps } from "../viewmodels/viewModel";
import * as Log from "../utilities/logger";

const saveKey = `${Environment.pluginName}.rideProps`;

export const loadAllPropsOnOpen = (props?: { reset: boolean }): PaintProps[] => {
    const rideProps: PaintProps[] = [];
    let i = 0;
    const numRides = map.numRides;
    while (i < numRides) {
        Log.debug(`Loading Props for ride ${i}`);
        if (props?.reset) {
            const rideIDAsKey = i.toString();
            context.getParkStorage(saveKey).set(
                rideIDAsKey,
                undefined
            );
        }
        const pref = getRideProps(i);
        if (pref) rideProps.push(pref);
        i++;
    }
    return rideProps;

};

const getRideProps = (rideID?: number | string): PaintProps | undefined => {
    if (!rideID) return undefined;
    const rideIDAsKey = rideID.toString();
    const props = <PaintProps | undefined>context.getParkStorage(saveKey).get(rideIDAsKey);
    return props;
};

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
