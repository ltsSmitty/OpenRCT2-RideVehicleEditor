import { highlightMapRange } from './highlightGround';
import { TileElementItem, TrackElementItem } from './SegmentController';
import { debug } from "../utilities/logger";
import { Segment } from '../objects/segment';


export const getTileElements = <T extends TileElement>(elementType: TileElementType, coords: CoordsXY): TileElementItem<T>[] => {
    // debug(`Querying tile for ${elementType} elements at coords (${coords.x}, ${coords.y})`);

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

    // debug(`Query returned ${reducedELements.length} elements`);
    return reducedELements;
};


/**
 * For a given coords, returns each track element and its index. Useful for getting a TrackIterator at the given coords.
 */
export const getTrackElementsFromCoords = (coords: CoordsXY): TrackElementItem[] => {
    // get all the track tile elements at coords
    const potentialTrackElements = getTileElements<TrackElement>("track", coords);
    // filter out the stalls since we don't care about those
    const trackElementsWithoutStalls = potentialTrackElements.filter(t => !isRideAStall(t.element.ride));
    // get the segment for each track element
    const theseTrackEementsWithSegments = trackElementsWithoutStalls.map(e => {
        const thisSegment = getSegmentFromTrackElement(e);
        return {
            ...e,
            segment: thisSegment
        };
    });
    return theseTrackEementsWithSegments;
};

const getSegmentFromTrackElement = (e: TileElementItem<TrackElement>): Segment | null => {
    const tempTI = map.getTrackIterator(e.coords, e.index);
    if (!tempTI) {
        debug(`Unable to get trackIterator for coords (${e.coords.x}, ${e.coords.y})`);
        return null;
    }
    if (!tempTI.segment) {
        debug(`Unable to get segment for coords (${e.coords.x}, ${e.coords.y})`);
        return null;
    }
    return new Segment({
        location: tempTI.position,
        trackType: tempTI.segment.type,
        rideType: e.element.rideType,
        ride: e.element.ride
    });
};

export const getSurfaceElementsFromCoords = (coords: CoordsXY | CoordsXYZ | CoordsXYZD) => {
    return getTileElements<SurfaceElement>("surface", { x: coords.x, y: coords.y });
};

/**
 * Get the TrackElementItem for a specific ride and given XYZD.
 * This may behave unexpectedly if collision checks are off and there are multiple segments at the same XYZD.
 * In that case, it will return the 0th element.
 */
export const getSpecificTrackElement = (ride: number, coords: CoordsXYZD): TrackElementItem => {
    const trackELementsOnTile = getTrackElementsFromCoords({ x: coords.x, y: coords.y });
    debug(`Getting the track elements at coords ${coords.x}, ${coords.y}..
    ${trackELementsOnTile.length} total track element exists on this tile.`);
    // make sure the ride matches this ride
    const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === ride);
    debug(`${trackForThisRide.length} of those track elements are for this ride.`);
    // if there are two segments for the same ride in this tile, make sure it's the proper one
    if (trackForThisRide.length > 1) {
        const chosenTrack = trackForThisRide.filter(t => (t.element.baseZ === coords.z && t.element.direction === coords.direction));
        if (chosenTrack.length > 1) console.log(`Error: There are two overlapping elements at this tile with the same XYZD. Returning the 0th.`);
        return chosenTrack[0];
    }
    return trackForThisRide[0];
};

export const doesSegmentExistHere = (selectedSegment: Segment | null): { exists: false | "ghost" | "real", element: TrackElementItem | null } => {

    if (selectedSegment == null || selectedSegment.nextLocation() == null) {
        debug(`${selectedSegment == null ? "selectedSegment is null" : "selectedSegment.nextLocation() is null"}`);
        return { exists: false, element: null };
    }

    const { x, y, z } = selectedSegment.nextLocation()!; // location of next track element
    const trackELementsOnNextTile = getTrackElementsFromCoords({ x, y });
    // make sure the ride matches this ride
    const trackForThisRide = trackELementsOnNextTile.filter(e => e.element.ride === selectedSegment.get().ride);
    debug(`There are ${trackForThisRide.length} track elements for this ride on the next tile.`);
    // if there are two segments for the same ride in this tile, make sure it's the proper one
    let thisTrack: TrackElementItem;
    if (trackForThisRide.length > 1) {
        console.log(`Error: There are two overlapping elements at this tile with the same XYZ. Returning the first.`);
        const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === z);
        thisTrack = chosenTrack[0];
    } else { thisTrack = trackForThisRide[0]; }
    debug(`thisTrack: ${JSON.stringify(thisTrack)}`);


    if (!thisSegmentELement) {
        debug(`searched for tracks on this ride, but apparently there were none?`);
        return { exists: false, element: null };
    }

    // TODO make sure this actually checks. Otherwise going to have to attempt to build and get the flags? Or can query the segmentMap
    debug(`A segment for ride ${selectedSegment.get().ride} exists at (${x}, ${y}). \t
    Note the segment in the next tile has a z value of ${thisSegmentELement.segment?.get().location.z} compared to the current segment's z value of ${selectedSegment.get().location.z}.
    Are the z values equal: ${thisSegmentELement.segment?.get().location.z === selectedSegment.get().location.z}`);

    if (thisSegmentELement.element.isGhost) return { exists: "ghost", element: thisSegmentELement };
    return { exists: "real", element: thisSegmentELement };
    // // if there are two segments for the same ride in this tile, make sure it's the proper one
    // if (trackForThisRide.length > 1) {
    //     console.log(`Error: There are two overlapping elements at this tile with the same XYZ. Returning the first.`);
    //     // this filter isn't working with down-facing tracks
    //     const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === z);
    //     thisTrack = chosenTrack[0];
    // } else thisTrack = trackForThisRide[0];
    // debug(`number of tracks for this ride: ${trackForThisRide.length}`);

    // // TODO make sure this actually checks. Otherwise going to have to attempt to build and get the flags? Or can query the segmentMap
    // if (thisTrack.element.isGhost) return { exists: "ghost", element: thisTrack };
    // return { exists: "real", element: thisTrack };

};


/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 *
 *
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
    return map.getRide(rideNumber)?.classification === "stall";
};


export const getTIAtSegment = (segment: Segment | null): TrackIterator | null => {
    if (segment == null) {
        debug(`segment was null`);
        return null;
    }
    debug(`Getting specific track element of ride ${segment.get().ride} at (${segment.get().location.x}, ${segment.get().location.y})`);
    const thisSegmentIndex = getSpecificTrackElement(segment.get().ride, segment.get().location).index; // needed for iterator
    const newTI = map.getTrackIterator(<CoordsXY>segment.get().location, thisSegmentIndex); // set up TI

    if (newTI == null) {
        debug(`There was an issue creating the track iterator to get next segment options.`);
        return null;
    }
    return newTI;
}
