import { TileElementItem, TrackElementItem } from './SegmentController';
import { debug } from "../utilities/logger";

export const getTileElements = <T extends TileElement>(elementType: TileElementType, coords: CoordsXY): TileElementItem<T>[] => {
    debug(`Qureying tile for ${elementType} elements at coords (${coords.x}, ${coords.y})`);

    // have to divide the mapCoords by 32 to get the tile coords
    const selectedTile = map.getTile(coords.x / 32, coords.y / 32);

    // filter and map to elements of the given type
    const reducedELements = selectedTile.elements.reduce<TileElementItem<T>[]>((filtered, el, index) => {
        if (el.type === elementType) {
            return filtered.concat({
                element: <T>el,
                index: index,
                coords
            });
        }
        return filtered;
    }, []);

    debug(`Query returned ${reducedELements.length} elements`);
    return reducedELements;
};


/**
 * For a given coords, returns each track element and its index. Useful for getting a TrackIterator at the given coords.
 */
export const getTrackElementsFromCoords = (coords: CoordsXY): TrackElementItem[] => {
    const potentialTrackElements = getTileElements<TrackElement>("track", coords);
    const trackElementsWithoutStalls = potentialTrackElements.filter(t => !isRideAStall(t.element.ride));
    return trackElementsWithoutStalls;
};

export const getSurfaceElementsFromCoords = (coords: CoordsXY | CoordsXYZ | CoordsXYZD) => {
    return getTileElements<SurfaceElement>("surface", { x: coords.x, y: coords.y })
}

/**
 * Get the TrackElementItem for a specific ride and given XYZD.
 * This may behave unexpectedly if collision checks are off and there are multiple segments at the same XYZD.
 * In that case, it will return the 0th element.
 */
export const getSpecificTrackElement = (ride: number, coords: CoordsXYZD): TrackElementItem => {
    const trackELementsOnTile = getTrackElementsFromCoords({ x: coords.x, y: coords.y });
    // make sure the ride matches this ride
    const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === ride);

    // if there are two segments for the same ride in this tile, make sure it's the proper one
    const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === coords.z);
    if (chosenTrack.length > 1) console.log(`Error: There are two overlapping elements at this tile with the same XYZ. Returning the first.`);
    return chosenTrack[0];
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
    return map.getRide(rideNumber)?.classification === "stall";
};
