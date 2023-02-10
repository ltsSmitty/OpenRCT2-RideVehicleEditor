import * as Log from "../utilities/logger";

const UnitsPerTile = 32;
/**
 * Get a track iterator for the specified track location.
 */
export function getTrackIteratorAtLocation(trackLocation: CoordsXYZD): TrackIterator | null {
    const currentTrackIndex = getIndexForTrackElementAt(trackLocation);
    if (currentTrackIndex === null) {
        Log.debug(`Could not find track for car at position; ${trackLocation.x}, ${trackLocation.y}, ${trackLocation.z}, direction; ${trackLocation.direction}`);
        return null;
    }

    const iterator = map.getTrackIterator(trackLocation, currentTrackIndex);
    if (!iterator) {
        Log.debug(`Could not start track iterator for car at position; ${trackLocation.x}, ${trackLocation.y}, ${trackLocation.z}, direction; ${trackLocation.direction}, index; ${currentTrackIndex}`);
        return null;
    }
    return iterator;
}

/**
 * Finds the index of a matching track element on the specified tile.
 */
function getIndexForTrackElementAt(coords: CoordsXYZD): number | null {
    const tile = map.getTile(Math.trunc(coords.x / UnitsPerTile), Math.trunc(coords.y / UnitsPerTile));
    const allElements = tile.elements, len = allElements.length;

    for (let i = 0; i < len; i++) {
        const element = tile.elements[i];
        if (element.type === "track"
            && element.baseZ === coords.z
            && element.direction === coords.direction) {
            return i;
        }
    }
    return null;
}
