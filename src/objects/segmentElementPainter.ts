import { TrackElementItem } from "../services/SegmentController";
import { Segment } from "./segment";
import * as finder from "../services/trackElementFinder";
import ColourChange from "../utilities/colourChange";
import { debug } from "../utilities/logger";

type ColourSchemeValue = 0 | 1 | 2 | 3

export class SegmentElementPainter {
    private _initialSegment: Segment | null = null;
    private _initialTrackColourScheme: 0 | 1 | 2 | 3 | null = null;
    private _initialColourSchemeValue: TrackColour | null = null;

    private restoreInitialColour() {
        if (!this._initialSegment || this._initialTrackColourScheme == null || !this._initialColourSchemeValue) {
            debug(`Error: unable to restore colour scheme because either no initial segment, track colour scheme, or actual colours were saved.`);
            return;
        }
        // get the ride to repaint
        const thisRide = map.getRide(this._initialSegment.get().ride);

        // restore the colour scheme
        const { main, additional, supports } = this._initialColourSchemeValue;
        ColourChange.setRideColour(thisRide, main, additional, supports, -1, -1, -1, this._initialTrackColourScheme);
        ColourChange.setColourSchemeSegment(
            this._initialSegment.get().location,
            this._initialSegment.get().trackType,
            this._initialTrackColourScheme,
            (result) => { debug(`Restored the initial track segment colour: ${JSON.stringify(result)}`) });
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
        // need to save the colour scheme # and colours of the current segment
        debug(`In paintSelectedSegment. Trying to find the track element at ${newSeg.get().location.x}, ${newSeg.get().location.y} in order to save that colour and scheme.`);
        const trackElement = finder.getSpecificTrackElements(newSeg.get().ride, newSeg.get().location)[0];
        const thisColourScheme = <ColourSchemeValue>trackElement.element.colourScheme || 0;
        this._initialTrackColourScheme = thisColourScheme;
        this._initialColourSchemeValue = thisRide.colourSchemes[thisColourScheme];

        // paint the new selection
        ColourChange.setRideColour(thisRide, 17, 17, 17, -1, -1, -1, 3); // paint it yellow
        ColourChange.setColourSchemeSegment(newSeg.get().location, newSeg.get().trackType, 3, (result) => {
            debug(`setColourSchemeSegment returned ${result}`);
        });
        this.startToggling();
        debug(`In paintSelectedSegment:
             Painting complete`)
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
