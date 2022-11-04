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
        ride: e.element.ride,
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
    // make sure the ride matches this ride
    const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === ride);

    // if there are two segments for the same ride in this tile, make sure it's the proper one
    const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === coords.z);
    if (chosenTrack.length > 1) console.log(`Error: There are two overlapping elements at this tile with the same XYZ. Returning the first.`);
    return chosenTrack[0];
};

export const doesSegmentExistHere = (segmentAtLocationInquestion: Segment | null): { exists: false | "ghost" | "real", element: TrackElementItem | null } => {

    if (segmentAtLocationInquestion == null) return { exists: false, element: null };
    // debug(`What is the deal with segmentAtlocation? ${JSON.stringify(segmentAtLocationInquestion)}`)
    // destructure from the segment and rename the props to match
    const { location: coords, ride: rideNumber } = segmentAtLocationInquestion.get();
    const trackELementsOnTile = getTrackElementsFromCoords({ x: coords.x, y: coords.y });
    // make sure the ride matches this ride
    const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === rideNumber);

    // if there are two segments for the same ride in this tile, make sure it's the proper one
    const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === coords.z);
    const thisSegmentELement = chosenTrack[0];


    if (!thisSegmentELement) return { exists: false, element: null };
    // TODO make sure this actually checks. Otherwise going to have to attempt to build and get the flags? Or can query the segmentMap
    if (thisSegmentELement.element.isGhost) return { exists: "ghost", element: thisSegmentELement };
    return { exists: "real", element: thisSegmentELement };
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
    return map.getRide(rideNumber)?.classification === "stall";
};


export const getTIAtSegment = (segment: Segment): TrackIterator | null => {
    if (segment == null) {
        debug(`segment was null`);
        return null;
    }
    const thisSegmentIndex = getSpecificTrackElement(segment.get().ride, segment.get().location).index; // needed for iterator
    const newTI = map.getTrackIterator(<CoordsXY>segment.get().location, thisSegmentIndex); // set up TI

    if (newTI == null) {
        debug(`There was an issue creating the track iterator to get next segment options.`);
        return null;
    }
    return newTI;
}
