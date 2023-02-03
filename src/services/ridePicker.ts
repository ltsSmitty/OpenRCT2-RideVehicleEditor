import { ParkRide } from "../objects/parkRide";
import * as Log from "../utilities/logger";

const pickerToolId = "rve-pick-ride";

/**
 * Starts a tool that allows the user to click on a ride to select it.
 */
export function toggleRidePicker(
    isPressed: boolean,
    onPick: (pickerResult: { rideID: number | undefined, coords: CoordsXYZ | undefined }) => void,
    onCancel: () => void): void {
    if (isPressed) {
        ui.activateTool({
            id: pickerToolId,
            cursor: "cross_hair",
            onDown: args => {
                const rideIDs = getRideIDsFromCoords(args.mapCoords);
                if (rideIDs.length > 1) {
                    Log.debug(`Multiple rides found at ${args.mapCoords?.x}, ${args.mapCoords?.y}. Returning first one.`);
                }
                onPick({ rideID: rideIDs[0], coords: args.mapCoords });
                ui.tool?.cancel();
            },
            onFinish: onCancel
        });
    }
    else {
        const tool = ui.tool;
        if (tool && tool.id === pickerToolId) {
            tool.cancel();
        }
    }
}

/**
 * Get the rides at a given coords.
 */
export const getRideIDsFromCoords = (coords?: CoordsXY): number[] => {
    // get all the track tile elements at coords
    if (!coords) return [];

    // Log.debug(`Getting ride IDs from coords ${coords.x}, ${coords.y}.`);
    const trackElements = getTileElements<TrackElement>("track", coords);

    // filter out the stalls since we don't care about those
    const rideIDs = trackElements
        .filter(t => !isRideAStall(t.ride))
        .map(t => t.ride);

    // get the segment for each track element
    const uniqueRideIDs = rideIDs.filter((v, i, a) => a.indexOf(v) === i);
    return uniqueRideIDs;
};

export const getTrackElementFromCoords = ({ coords, ride }: { coords: CoordsXYZD, ride: ParkRide }): TrackElement | undefined => {
    const trackElements = getTileElements<TrackElement>("track", coords);
    if (trackElements.length == 1) return trackElements[0];

    // match direction, baseZ, and direction
    // trackElements.forEach(t => Log.debug(`Element of ride ${t.ride}, baseZ${t.baseZ}, direction ${t.direction}`));

    const matchingtrackElements = trackElements
        .filter(t => t.direction == coords.direction && t.ride == ride.id && t.baseZ == coords.z);

    if (matchingtrackElements.length == 1) return matchingtrackElements[0];
    else {
        // Log.debug(`multiple elements qualify, likely this is diagonal.
        // Returning the second one, since that's probably the one we want.`);
        return matchingtrackElements[1];
    }
};

/**
 * Utility function to get a specific type of TileElement at a given CoordsXY
 */
const getTileElements = <T extends TileElement>(elementType: TileElementType, coords: CoordsXY): T[] => {
    const selectedTile = map.getTile(coords.x / 32, coords.y / 32);
    return selectedTile.elements
        .filter(el => el.type === elementType)
        .map(el => <T>el);
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
    return map.getRide(rideNumber)?.classification === "stall";
};
