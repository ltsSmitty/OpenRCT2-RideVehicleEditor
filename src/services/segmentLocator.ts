import * as Log from "../utilities/logger";
import _ from "lodash-es";

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

    if (currentTrackIndex.length > 1) {
        // Log.debug(`There is more than one matching track at this location! Probably on a diagonal or helix.`);
    }

    const iterator = map.getTrackIterator(trackLocation, _.last(currentTrackIndex) ?? 0); // use last to handle diagonal/helix
    if (!iterator) {
        Log.debug(`Could not start track iterator for car at position; ${trackLocation.x}, ${trackLocation.y}, ${trackLocation.z}, direction; ${trackLocation.direction}, index; ${currentTrackIndex}`);
        return null;
    }
    return iterator;
}

/**
 * Finds the index of a matching track element on the specified tile.
 */
export function getIndexForTrackElementAt(coords: CoordsXYZD): number[] {
    const tile = map.getTile(Math.trunc(coords.x / UnitsPerTile), Math.trunc(coords.y / UnitsPerTile));
    const allElements = tile.elements, len = allElements.length;

    const matchingElements: number[] = [];

    for (let i = 0; i < len; i++) {
        const element = tile.elements[i];
        if (element.type === "track"
            && element.baseZ === coords.z
            && element.direction === coords.direction) {
            matchingElements.push(i);
        }
    }
    return matchingElements;
}

export function getTrackElementsAt(coords: CoordsXYZD): TrackElement[] {
    const tile = map.getTile(Math.trunc(coords.x / UnitsPerTile), Math.trunc(coords.y / UnitsPerTile));
    const allElements = tile.elements, len = allElements.length;

    const matchingElements: TrackElement[] = [];

    for (let i = 0; i < len; i++) {
        const element = tile.elements[i];
        if (element.type === "track") {
            matchingElements.push(element);
        }
    }
    return matchingElements;
}
