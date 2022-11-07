import { TileElementItem } from './../services/SegmentController';
/**
 * selectSegment(rideSegment)
 * getSelectedSegment()
 *  => expose segment, nextSegment, previousSegment, position
 * goToNextSegment(direction = "next" | "previous", callback: (onNext, onPrevious))
 *  => expose a wrapped version of next() and previous() with a callback added
 *
 */

import { TrackElementItem } from "../services/SegmentController";
import { getASpecificTrackElement, getSurfaceElementsFromCoords } from "../services/trackElementFinder";
import { debug } from "../utilities/logger";
import { store } from "openrct2-flexui";

export type SegmentInfo = {
    segment: TrackSegment;
    ride: number | null | undefined;
    position: CoordsXYZD;
    nextPosition: CoordsXYZD;
    previousPosition: CoordsXYZD;
} | null;



export class SegmentSelector {
    private _segment: TrackSegment | null = null; // segment information used esp for construction
    // private _element:
    private _imageIndex: number | null = null; // store the image index for look up in the future
    private _ride?: number | null = null; // store which ride it is for look up in the future
    private _position: CoordsXYZD | null = null;
    private _nextSegmentPosition: CoordsXYZD | null = null;
    private _previousSegmentPosition: CoordsXYZD | null = null;
    private _TIAtCoords: TrackIterator | null = null;
    private _onNext: (TIResult: boolean) => any = () => (debug(`onNext not specified.`));
    private _onPrevious: (TIResult: boolean) => any = () => (debug(`onPrevious not specified.`));
    private initialTIState: TrackIterator | null = null;
    private _surfaceAtPositon: TileElementItem<SurfaceElement> | null = null;

    public readonly positionStore = store<CoordsXYZD | null>(null);

    constructor(onNext?: (nextResult: boolean) => any, onPrevious?: (previousResult: boolean) => any) {
        if (onNext) this._onNext = onNext;
        if (onPrevious) this._onPrevious = onPrevious;
    }

    setSegment(trackElement: TrackElementItem | null) {
        this.resetProps();

        if (!trackElement || trackElement.coords == null) {
            debug(`no track elements. please stop`);
            return
        }

        this._TIAtCoords = map.getTrackIterator(trackElement.coords, trackElement.index);
        if (this._TIAtCoords) {
            this._segment = this._TIAtCoords.segment;
            this._imageIndex = trackElement.index;
            this._ride = trackElement.element.ride;
            this._position = this._TIAtCoords.position;
            this._nextSegmentPosition = this._TIAtCoords.nextPosition;
            this._previousSegmentPosition = this._TIAtCoords.previousPosition;
            this.positionStore.set(this._position);
            // ui.tileSelection.tiles = [this._position];
        }

        debug(`supposedly coords are set.`);
        debug(JSON.stringify(this.getSegmentInfo()))
    }

    /**
     * Call after next() when TrackIterator props have changed and this object props need to be updated to match.
     */
    private refreshSegmentAfterIterating(): void {
        if (this._TIAtCoords) {
            this._segment = this._TIAtCoords.segment;
            this._position = this._TIAtCoords.position;
            this._nextSegmentPosition = this._TIAtCoords.nextPosition;
            this._previousSegmentPosition = this._TIAtCoords.previousPosition;
            this._imageIndex = this.getImageIndex();

            this.positionStore.set(this._position)

            this._surfaceAtPositon = getSurfaceElementsFromCoords(this._position)[0];
            // ui.tileSelection.tiles = [this._position];
        }
    }

    private getImageIndex() {
        if (!this._ride) {
            debug(`Cannot get imageIndex: no ride specified.`);
            return null;
        }
        if (!this._position) {
            debug(`Cannot get imageIndex: position not set.`)
            return null;
        }
        const thisTrackElement = getASpecificTrackElement(this._ride, this._position);
        return thisTrackElement.index;
    }


    /**
     * Return the TrackSegment and the current/next/previous positions. Returns null if no segment is selected.
     * @returns
     */
    public getSegmentInfo(): SegmentInfo {
        if (!this._segment || !this._position || !this._nextSegmentPosition || !this._previousSegmentPosition) {
            debug(`Some information was missing about this segment, so returning null. Check your getSegmentInfo() calls.`);
            return null;
        }
        return {
            segment: this._segment,
            ride: this._ride,
            // element: this._element,
            position: this._position,
            nextPosition: this._nextSegmentPosition,
            previousPosition: this._previousSegmentPosition,
        };
    }

    private getElement() {
        if (!this._ride || !this._position) {
            debug(`Error getting element: ride or position undefined.`);
            return null;
        }
        return getASpecificTrackElement(this._ride, this._position);

    }

    public nextSegment = (): ((TIResult: boolean) => boolean) | boolean | null => {
        if (!this._TIAtCoords) { // make sure a segment is actually selected
            debug(`No segment selected to iterate on. Select a segment first.`);
            return null;
        }

        this.initialTIState = { ...this._TIAtCoords }; // duplicate the TI before iterating
        const TIResponse = this._TIAtCoords.next(); // iterate the TI

        if (TIResponse) { // trackIterator has iterated to the next section
            this.refreshSegmentAfterIterating();
        }

        if (this._onNext) return this._onNext(TIResponse); // callback if one given
        return TIResponse; // otherwise just return the response.
    };


    public previousSegment = (): ((TIResult: boolean) => boolean) | boolean | null => {
        if (!this._TIAtCoords) { // make sure a segment is actually selected
            debug(`No segment selected to iterate on. Select a segment first.`);
            return null;
        }

        this.initialTIState = { ...this._TIAtCoords }; // duplicate the TI before iterating
        const TIResponse = this._TIAtCoords.previous(); // iterate the TI

        if (TIResponse) { // trackIterator has iterated to the next section
            this.refreshSegmentAfterIterating();
        }

        if (this._onPrevious) return this._onPrevious(TIResponse); // callback if one given
        return TIResponse; // otherwise just return the response.
    };

    private resetProps() {
        this.initialTIState = null;

        this._TIAtCoords = null;
        this._segment = null;
        this._imageIndex = null;
        this._ride = null;
        this._position = null;
        this._nextSegmentPosition = null;
        this._previousSegmentPosition = null;
        this.positionStore.set(null);
    }

}


