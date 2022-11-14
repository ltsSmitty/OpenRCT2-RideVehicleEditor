
import { TileElementItem, TrackElementItem } from './SegmentController';
import { debug } from "../utilities/logger";
import { Segment } from '../objects/segment';
import { TrackElementType } from '../utilities/trackElementType';


/**
 * Utility function to get a specific type of TileElement at a given CoordsXY
 * @returns
 */
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
 * Utility function to get all "surface" elements at a given coords.
 */
export const getSurfaceElementsFromCoords = (coords: CoordsXY | CoordsXYZ | CoordsXYZD) => {
    return getTileElements<SurfaceElement>("surface", { x: coords.x, y: coords.y });
};

/**
 * Get the robust TrackElementItems for a given coords.
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


/**
 * Utility to get the segment data at a TileElementItem.
 */
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


/**
 * @summary Returns an array of relative coords of the track elements for the segment.
 * @description E.g. for a large left turn, it returns 7 relatively spaced coords (for the seven tiles it covers)) that go from (0,0) to (+/-64,+/-64) depending on how the segment is rotated.
 */
const getRelativeElementCoordsUnderSegment = (segment: Segment): TrackSegmentElement[] | null => {
    // get the element index of this segment in order to
    const thisTI = getTIAtSegment(segment)
    const segmentElements = thisTI?.segment?.elements;
    if (!segmentElements) return null;
    return segmentElements;
};

/**
 * @summary Get all TrackElementItems for a given segment. Use to get all elements of a multi-element segment (e.g. LeftQuarterTurn3Tiles, LeftQuarterTurn5Tiles, etc.). Useful for painting each element of the segment.
 * @description E.g. for a large left turn, there are 7 elements  with relatively spaced coords (for the seven tiles it covers) that go from (0,0) to (+/-64,+/-64) depending on how the segment is rotated. Convert those coords to absolute positioning.
 *
 * @returns the TrackElementItems with their absolute position the element, e.g. (1248, 1984)
 */
export const getAllSegmentTrackElements = (segment: Segment | null): TrackElementItem[] => {
    if (segment == null) {
        return [];
    }

    const segmentElements = getRelativeElementCoordsUnderSegment(segment);

    if (!segmentElements) {
        debug(`Error: somehow this segment has no elements`);
        return [];
    }

    const coords = segment.get().location;
    const x1 = coords.x;
    const y1 = coords.y;
    const z1 = coords.z;
    const direction = coords.direction;

    // get the proper position based on the direction of the segment and the element
    const exactCoordsUnderSegment = segmentElements.map((segmentElement) => {
        switch (coords.direction) {
            case 0: {
                return {
                    x: x1 + segmentElement.x,
                    y: y1 + segmentElement.y,
                    z: z1,
                    direction
                };
            }
            case 1: {
                return {
                    x: x1 + segmentElement.y,
                    y: y1 - segmentElement.x,
                    z: z1,
                    direction
                };
            }
            case 2: {
                return {
                    x: x1 - segmentElement.x,
                    y: y1 - segmentElement.y,
                    z: z1,
                    direction
                };
            }
            case 3: {
                return {
                    x: x1 - segmentElement.y,
                    y: y1 + segmentElement.x,
                    z: z1,
                    direction
                };
            }
        }
    });

    const allTheseElements: TrackElementItem[] = [];
    exactCoordsUnderSegment.forEach((coords) => {
        allTheseElements.push(...getSpecificTrackElements(segment.get().ride, { ...coords }));
    });

    return allTheseElements;
}

/**
 * Get the TrackElementItem for a specific ride and given XYZD.
 * If there are multiple elements at the given coords, it will return all of them.
 */
export const getSpecificTrackElements = (ride: number, coords: CoordsXYZD): TrackElementItem[] => {
    const trackELementsOnTile = getTrackElementsFromCoords({ x: coords.x, y: coords.y });
    const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === ride);

    // if there are two segments for the same ride in this tile, make sure it's the proper one
    if (trackForThisRide.length > 1) {

        // comparing z is not as straightforward becauase it has to account for the height of down segments.
        const zModifiers = trackForThisRide.map(e => {
            const trackType = context.getTrackSegment(e.element.trackType);
            return <number>trackType?.beginZ;
        });

        // check each of the potential segments to see if it's the right one
        // this is complicated because the z value can be off by an amount depending on what track type was built.
        // debug(`Looking for elements at (${coords.x}, ${coords.y}, ${coords.z}) direction ${coords.direction} for ride ${ride}.`);
        // trackForThisRide.map((t, index) => {
        //     debug(`      Element ${index}: ${TrackElementType[t.element.trackType]} at (${t.segment?.get().location.x}, ${t.segment?.get().location.y}, ${t.segment?.get().location.z}), direction ${t.segment?.get().location.direction}, z modifier ${zModifiers[index]}`);
        // });

        // debug(`beginning by filtering on z and direction.`);
        let chosenTrack = trackForThisRide.filter((t, index) => {

            const actualZ = t.segment?.get().location.z;
            const actualDirection = t.segment?.get().location.direction;
            const doesDirectionMatch = actualDirection === coords.direction;
            const doesZMatch: boolean = actualZ === coords.z;

            const doZAndDirectionMatch = doesZMatch && doesDirectionMatch;
            // const doTheyAllMatch = doesXMatch && doesYMatch && doesZMatch && doesDirectionMatch;

            // debug(`Element ${index} (z,d) ?= expected (z,d):
            // (${actualZ}, ${actualDirection})
            // (${coords.z}, ${coords.direction})
            // Do both match? ${doZAndDirectionMatch}`);

            // maybe check here if the direction is <3?
            if (doZAndDirectionMatch) {
                // debug(`z and direction match.`);
                // debug(`Found the right track element!: Element ${TrackElementType[t.element.trackType]}`);
                return (doZAndDirectionMatch);
            }

            // debug(`finished filtering on z and direction. z and direction did not match, but they might be diagonals. next trying to with x, y, and z but not direction`);

            const actualX = t.segment?.get().location.x;
            const actualY = t.segment?.get().location.y;

            const doesXMatch = actualX === coords.x;
            const doesYMatch = actualY === coords.y;
            // if x y and z match but not direction, maybe we check the element sequence.
            if (doesXMatch && doesYMatch && doesZMatch) {
                // debug(`(actualX, actualyY, actualyZ), doesXMatch, doesYMatch, doesZMatch: (${actualX}, ${actualY}, ${actualZ}), ${doesXMatch}, ${doesYMatch}, ${doesZMatch}`);
                // return true
            }
            debug(`Element ${index} is not the right one.`);
            return false;
        });
        if (chosenTrack.length === 0) {
            debug(`Error: No matching segments were found (but at least one should have been), so this is going to error out undefined downstream.
            `);
        }
        if (chosenTrack.length > 1) {
            // debug(`There are two overlapping elements at this tile with the same z and direction. Now comparing the x and y. FYI, Was looking for an element matched the coords:
            // ${JSON.stringify(coords)}`);

            const matchingAllCoords = chosenTrack.filter((t, index) => {
                const actualX = t.segment?.get().location.x;
                const actualY = t.segment?.get().location.y;
                const doesXMatch = actualX === coords.x;
                const doesYMatch = actualY === coords.y;
                if (doesXMatch && doesYMatch) {
                    // debug(`X and y match for element ${index}.`);
                    return true;
                }
                // debug(`x and y do not match for element ${index}.`);
                return false;
            });
            chosenTrack = matchingAllCoords;
        }
        return chosenTrack;
    }
    return [trackForThisRide[0]];
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
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
    debug(`Getting TI at the track element of ride ${segment.get().ride} at (${segment.get().location.x}, ${segment.get().location.y}, ${segment.get().location.z}) dir ${segment.get().location.direction}`);
    debug(`Looking for the indexOf the track element.`)
    const thisSegmentIndex = getSpecificTrackElements(segment.get().ride, segment.get().location)[0].index; // needed for iterator
    const newTI = map.getTrackIterator(<CoordsXY>segment.get().location, thisSegmentIndex); // set up TI

    if (newTI == null) {
        debug(`There was an issue creating the track iterator to get next segment options.`);
        return null;
    }
    return newTI;
}

export const getTrackColours = (newSeg: Segment | null): TrackColour => {
    // ride.colourSchemes is one option, but i wonder if you can do better
    // TrackElement. colour scheme => look up
    if (newSeg == null) return { main: -1, additional: -1, supports: -1 };

    const thisSeg = getSpecificTrackElements(newSeg?.get().ride || 0, newSeg?.get().location)[0];
    const thisColourScheme = thisSeg.element.colourScheme
    const theseTrackColours = map.getRide(newSeg.get().ride)?.colourSchemes[thisColourScheme || 0];
    return theseTrackColours;
};
