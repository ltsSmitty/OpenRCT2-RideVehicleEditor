import { debug } from "./logger";

export default class ColourChange {
    /**
     * @param part is defined from ColourChange table:
     * 0: TrackColourMain,
     * 1: TrackColourAdditional,
     * 2: TrackColourSupports,
     * 3: VehicleColourBody,
     * 4: VehicleColourTrim,
     * 5: VehicleColourTernary,
     * 6: VehicleColourScheme,
     * 7: EntranceStyle
     * @param colour is from 0-31
     */
    private static setRideColourPart = (ride: Ride, part: number, colour: number, index: 0 | 1 | 2 | 3 = 0): void => {
        if (colour === -1) return;
        if (colour >= 0 && colour < 32) {
            context.executeAction(
                "ridesetappearance",
                {
                    ride: ride.id,
                    type: part,
                    value: colour,
                    index: index,
                    flags: 0,
                },
                // Awkward callback but necessary
                () => {
                    // nothing
                }
            );
        } else {
            /* eslint-disable no-console */
            console.log(`Colour not changed for ride ${ride.name} for part ${part}.
        Given colour ${colour} is outside the acceptable range of 0-31.
        To keep a colour value unchanged without getting this warning, pass in '-1' for the colour value.`);
        }
    };

    /**
     * Set a ride's colour. To not change a colour for a param, input -1 for the param.
     */
    static setRideColour = (ride: Ride, mainColour: number = -1, additionalColour: number = -1, supportsColour: number = -1, vehicleBodyColour: number = -1, vehicleTrimColour: number = -1, vehicleTernaryColour: number = -1, index?: 0 | 1 | 2 | 3) => {
        ColourChange.setRideColourPart(ride, 0, mainColour, index);
        ColourChange.setRideColourPart(ride, 1, additionalColour, index);
        ColourChange.setRideColourPart(ride, 2, supportsColour, index);
        ColourChange.setRideColourPart(ride, 3, vehicleBodyColour, index);
        ColourChange.setRideColourPart(ride, 4, vehicleTrimColour, index);
        ColourChange.setRideColourPart(ride, 5, vehicleTernaryColour, index);
    };

    public static setRideStationStyle = (ride: Ride, stationStyle: number) => {
        ColourChange.setRideColourPart(ride, 7, stationStyle);
    };
}
