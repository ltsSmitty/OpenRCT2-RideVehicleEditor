import { getSpecificTrackElement } from './trackElementFinder';
import { debug } from "../utilities/logger";
import { store, Store, arrayStore, ArrayStore } from "openrct2-flexui";
import { TrackElementType } from "../utilities/trackElementType";
import { ParkTile } from "../objects/parkTile";

import { getBuildableSegments } from "./segmentValidator";
import track from "../../tests/.trackable/trackable";
import { Segment } from '../objects/segment';


type relativeSegment = "previousSegment" | "thisSegment" | "nextSegment";

/**
 * A generic TileElement type that exposes element, index and coords at once.
 * Used extensively for finding specific tile elements (surface, footpath, track, etc.)
 */
export type TileElementItem<T extends TileElement> = {
    element: T,
    index: number,
    coords: CoordsXY
}

/**
 * A specific track-based TileELementItem to keep typing cleaner
 */
export interface TrackElementItem extends TileElementItem<TrackElement> {
    segment: Segment | null
}


export class SegmentController {

    readonly MPH = 29127; // constant for calculating MPH from velocity

    /**
     * The primary coords for the selected game tile
     * Divide by 32 to use for map.getTile
     */
    readonly coords = store<CoordsXY | null>(null);

    readonly tile: ParkTile = new ParkTile();
    /**
     * The currently specified track segment, e.g. Flat, Up25, BankedRightQuarterTurn5Tiles
     * Defined in TrackElementType
     */
    readonly segment = store<TrackElementItem | null>(null);

    /**
     * Coords that define where the next segment should be built when building forwards
     */
    readonly nextCoords = store<CoordsXYZD | null>(null);

    /**
     * The next segment progressing along the track forward if there is one, or null if not
     */
    readonly nextSegment = store<TrackElementItem | null>(null);

    /**
     * Coords that define where the next segment should be built when building backward
     */
    readonly prevCoords = store<CoordsXYZD | null>(null);

    /**
     * The next segment progressing along the track backward if there is one, or null if not
     */
    readonly prevSegment = store<TrackElementItem | null>(null);

    /**
     * A track iterator for progressing through a track. A new value is stored each time the picker is used
     * Otherwise next() or previous() is called to expose a new segment of track
     */

    readonly iterator = store<TrackIterator | null>(null);


    /**
     * A list of potentially buildable segments  based on the currently selected segment and the build direction
     */
    readonly buildableSegments = arrayStore<TrackElementType>();

    /**
     * The currently selected segment
     */
    readonly segmentToBuild = store<TrackElementType | null>(null);

    constructor() {
        this.coords.subscribe((coords) => this.onCoordChange(coords));
        // this.segment.subscribe((seg) => this.onSegmentChange());
    }

    /**
     * Callback for whenever the selected coords are changed
     */
    onCoordChange(newCoords: CoordsXY | null) {
        if (!newCoords) {
            debug(`Coords deselected`);
            this.onSegmentDeselect();
            return;
        }
        debug(`coords changed to (${newCoords.x}, ${newCoords.y})`);
        this.tile.set(newCoords);
    }

    onTINext() {
        // update the coords, update the tile, update next, update previous, update segment
        const newCoords = this.iterator
        // this.coords.set()
    }

    onTIPrevious() {

    }

    onSegmentDeselect() {
        // todo write something here
    }
}


/**
 *
 * Tile controller
 *
 */

// class TileController {
//     coords;
//     elements: { track, surface };

// }


/**
 * selectSegment(rideSegment)
 * getSelectedSegment()
 *  => expose segment, nextSegment, previousSegment, position
 * goToNextSegment(direction = "next" | "previous", callback: (onNext, onPrevious))
 *  => expose a wrapped version of next() and previous() with a callback added
 *
 */
