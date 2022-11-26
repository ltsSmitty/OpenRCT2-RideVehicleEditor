
import { Segment } from '../objects/segment';


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

const MPH = 29127; // constant for calculating MPH from velocity


