import * as Environment from "../environment";
import { ParkRide } from "../objects/parkRide";
import { RidePaintPreference } from "../viewmodels/rideViewModel";

const saveKey = `${Environment.pluginName}.ridePreferences`;

type SavePreference = {
    rideIDAsKey: string;
    values: {
        enableColourMatching: boolean;
        enableColourReset: boolean;
    } | undefined
};

type SaveValues = SavePreference["values"];

export const loadAllPreferencesOnOpen = (): RidePaintPreference[] => {
    let i = 0;
    const ridePreferences: RidePaintPreference[] = [];

    while (map.getRide(i)) {
        const pref = getRidePreferences(i);
        ridePreferences.push({
            ride: new ParkRide(i),
            values: pref.values || {
                enableColourMatching: false,
                enableColourReset: false,
            }
        });
        i++;
    }
    return ridePreferences;
};

const getRidePreferences = (rideID: number | string): SavePreference => {
    const rideIDAsKey = rideID.toString();
    const values = <SaveValues | undefined>context.getParkStorage(saveKey).get(rideIDAsKey);

    return {
        rideIDAsKey,
        values,
    };
};

const saveRidePreferences = (preferences: SavePreference): void => {
    const { rideIDAsKey, values } = preferences;

    context.getParkStorage(saveKey).set(
        rideIDAsKey,
        values
    );
};

export const PreferenceStorage = {
    getRidePreferences,
    saveRidePreferences,
};
