import { TileElementItem } from "../services/SegmentController";
import { getTileElements } from "../services/trackElementFinder";
import { debug } from "../utilities/logger";

export class ParkTile {
    private _coords!: CoordsXY;
    private _elements: {
        track: TileElementItem<TrackElement>[],
        surface: TileElementItem<SurfaceElement>[]
    };

    constructor() {
        this._elements = {
            track: [],
            surface: []
        };
    }
    set(newCoords: CoordsXY) {
        this._coords = newCoords;
        this._elements = {
            track: getTileElements<TrackElement>("track", this._coords),
            surface: getTileElements<SurfaceElement>("surface", this._coords),
        };
        return this._elements;
    }

    getElements(e: "track" | "surface" = "track") {
        if (!this._coords) debug(`No coords set for ParkTile.`);
        return this._elements[e];
    }
}
