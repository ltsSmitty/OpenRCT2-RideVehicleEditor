import { TrackElementType } from './../utilities/trackElementType';
import { TrackElementItem } from "../services/SegmentController";
import { Segment } from "./segment";
import * as finder from "../services/trackElementFinder";
import * as storage from "../utilities/coldStorage";
import ColourChange from "../utilities/colourChange";
import { debug } from "../utilities/logger";

export type ColourSchemeValue = 0 | 1 | 2 | 3

export class SegmentElementPainter {
    private _initialSegment: Segment | null = null;
    private _initialTrackColourScheme: 0 | 1 | 2 | 3 | null = null;
    private _initialColourSchemeValue: TrackColour | null = null;

    restoreInitialColour(fromColdStorage = false) {
        if (!this._initialSegment || this._initialTrackColourScheme == null || !this._initialColourSchemeValue) {
            debug(`Restoring initial colour. No segment/colourSchemes are available from this window session. Attempting to restore from cold storage.`);
            if (!fromColdStorage) {
                this.restoreColoursFromColdStorage();
            }
            return;
        }
        // get the ride to repaint
        const thisRide = map.getRide(this._initialSegment.get().ride);

        const thisElement = finder.getSpecificTrackElement(this._initialSegment.get().ride, this._initialSegment.get().location)
        const elBaseZ = thisElement.element.baseZ;

        const { x, y, direction } = this._initialSegment.get().location;
        const newCoordAttempt = { x, y, z: elBaseZ, direction };

        // restore the colour scheme
        const { main, additional, supports } = this._initialColourSchemeValue!;
        ColourChange.setRideColour(thisRide, main, additional, supports, -1, -1, -1, this._initialTrackColourScheme);
        ColourChange.setColourSchemeSegment(
            newCoordAttempt,
            this._initialSegment.get().trackType,
            this._initialTrackColourScheme)
        // (result) => { debug(`Restored the initial track segment colour: ${JSON.stringify(result)}`) });
    }

    restoreColoursFromColdStorage(): void {
        const paintedSegmentDetails = storage.getPaintedSegmentDetails();
        if (!paintedSegmentDetails) {
            debug(`No painted segment details found in cold storage.`);
            return;
        }
        const { segment, colourScheme, colourSchemeValue } = paintedSegmentDetails;
        this._initialSegment = segment;
        this._initialTrackColourScheme = colourScheme;
        this._initialColourSchemeValue = colourSchemeValue;
        this.restoreInitialColour(true);
    }

    /**
     * @Summary paint this segment and unpaint the last segment
     */
    public paintSelectedSegment(newSeg: Segment | null): boolean {
        if (newSeg == null) {
            return false;
        }
        // restore the old selection
        this.restoreInitialColour();

        // save the new selection
        this._initialSegment = newSeg;
        const thisRide = map.getRide(newSeg.get().ride);

        // need to find the element to get the proper colour scheme and element.baseZ
        // unfortunately using the segment.location.z doesn't work for some complex pieces like helixes
        // but this does work
        const thisElement = finder.getSpecificTrackElement(newSeg.get().ride, newSeg.get().location)
        const elBaseZ = thisElement.element.baseZ;

        const { x, y, direction } = newSeg.get().location;
        const newCoordAttempt = { x, y, z: elBaseZ, direction };

        const thisColourScheme = <ColourSchemeValue>thisElement.element.colourScheme || 0;
        this._initialTrackColourScheme = thisColourScheme;
        this._initialColourSchemeValue = thisRide.colourSchemes[thisColourScheme];

        ColourChange.setRideColour(thisRide, 17, 17, 17, -1, -1, -1, 3); // paint it yellow
        ColourChange.setColourSchemeSegment(newCoordAttempt, newSeg.get().trackType, 3,
            // (result) => { debug(`setColourSchemeSegment returned ${JSON.stringify(result, null, 2)}`); }
        );
        // this.startToggling();
        // debug(`In paintSelectedSegment:
        //      Painting complete`);
        debug(`setting painted segment details: ${JSON.stringify(this._initialSegment)}`);
        storage.setPaintedSegmentDetails(newSeg, thisColourScheme, thisRide.colourSchemes[thisColourScheme]);
        return true;
    }

    private startToggling() {
        // setTimeout(this.toggleToOtherScheme.bind(this), 500);
        // context.setInterval(this.toggleToOtherScheme.bind(this), 1000);
    }

    private toggleToOtherScheme() {
        // debug(`toggling to other scheme. ${this._lastElements.length} elements.`);
        // this._lastElements.forEach(element => {
        //     element.element.element.colourScheme = (element.element.element.colourScheme === 3 ? 0 : 3);
        // });
    }
}
