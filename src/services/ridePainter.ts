import * as Log from "../utilities/logger";

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
    private static setRideColourPart = (
        ride: Ride,
        part: number,
        colour: number,
        colourScheme: number = 0
    ): void => {
        if (colour === -1) return;
        if (colour >= 0 && colour < 32) {
            context.executeAction(
                "ridesetappearance",
                {
                    ride: ride.id,
                    type: part,
                    value: colour,
                    index: colourScheme,
                    flags: 0,
                },
                (results) => {
                    if (results.error) console.log(JSON.stringify(results, null, 2));
                }
            );
        } else {
            console.log(`Colour not changed for ride ${ride.name} for part ${part}.
        Given colour ${colour} is outside the acceptable range of 0-31.
        To keep a colour value unchanged without getting this warning, pass in '-1' for the colour value.`);
        }
    };

    static setRideColourAlt = ({
        ride,
        partNumber,
        colour,
        trainNumber }: {
            ride: Ride,
            colour: number,
            partNumber: 0 | 1 | 2 | 3 | 4 | 5 | 6,
            trainNumber: number,
        }): void => {
        ColourChange.setRideColourPart(ride, partNumber, colour, trainNumber);
    }


    /**
     * Set a ride's colour. To not change a colour for a param, input -1 for the param.
     */
    static setRideColour = (
        ride: Ride,
        mainColour: number = -1,
        additionalColour: number = -1,
        supportsColour: number = -1,
        vehicleBodyColour: number = -1,
        vehicleTrimColour: number = -1,
        vehicleTernaryColour: number = -1,
        colourScheme: 0 | 1 | 2 | 3 = 0
    ): void => {
        ColourChange.setRideColourPart(ride, 0, mainColour, colourScheme);
        ColourChange.setRideColourPart(ride, 1, additionalColour, colourScheme);
        ColourChange.setRideColourPart(ride, 2, supportsColour, colourScheme);
        ColourChange.setRideColourPart(ride, 3, vehicleBodyColour, colourScheme);
        ColourChange.setRideColourPart(ride, 4, vehicleTrimColour, colourScheme);
        ColourChange.setRideColourPart(ride, 5, vehicleTernaryColour, colourScheme);
    };

    static setColourScheme = ({ segmentLocation, segmentTrackType, colourScheme }: { segmentLocation: CoordsXYZD, segmentTrackType: number, colourScheme: 0 | 1 | 2 | 3 }): void => {
        context.executeAction("ridesetcolourscheme", {
            ...segmentLocation,
            trackType: segmentTrackType,
            colourScheme,
        },
            (results) => {
                if (results.error) {
                    console.log(JSON.stringify(results, null, 2));
                    console.log(`Initial args were: ${JSON.stringify({ ...segmentLocation, trackType: segmentTrackType, colourScheme }, null, 2)}`);
                }
            });
    };

    static setRideStationStyle = (ride: Ride, stationStyle: number): void => {
        ColourChange.setRideColourPart(ride, 7, stationStyle);
    };

    static setRideVehicleScheme({ rideID, scheme }: {
        rideID: number,
        scheme: "allSame" | "perTrain" | "perCar",
    }): void {
        context.executeAction("ridesetappearance", {
            ride: rideID,
            type: 6,
            value: scheme === "allSame" ? 0 : scheme === "perTrain" ? 1 : 2,
            index: 0,
        },
            (result) => {
                if (result.error) Log.debug(`${result?.errorMessage}`);
            });
    }
}


