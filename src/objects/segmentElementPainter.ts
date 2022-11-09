import { TrackElementItem } from "../services/SegmentController";
import { Segment } from "./segment";
import * as finder from "../services/trackElementFinder";
import ColourChange from "../utilities/colourChange";
import { debug } from "../utilities/logger";

type ElementValues = {
    element: TrackElementItem,
    scheme: {
        number: 0 | 1 | 2 | 3,
        trackColour: TrackColour
    }
};

export class SegmentElementPainter {
    private _lastSegment: Segment | null = null;
    private _lastElements: ElementValues[] = [];

    /**
     * @Summary paint all the elements of this segment and unpaint the last segment
     */
    public paintSelectedSegment(newSeg: Segment | null): boolean {
        if (newSeg == null) {
            return false;
        }
        // restore the old selection
        if (this._lastSegment != null && this._lastElements.length > 0) {
            //
            const oldRide = map.getRide(this._lastSegment.get().ride || 0);

            //reset the TrackColour for the colour scheme for each element. This is a bit overkill.
            this._lastElements.map((oldElement) => {
                const { main, additional, supports } = oldElement.scheme.trackColour;
                ColourChange.setRideColour(oldRide, main, additional, supports, -1, -1, -1, oldElement.scheme.number);
                oldElement.element.element.colourScheme = oldElement.scheme.number; // todo refactor using ridesetcolourscheme?
            });
        }

        // save the new selection
        this._lastSegment = newSeg;
        const theseElements = finder.getAllSegmentTrackElements(newSeg);
        // convert to ElementValues
        const thisRide = map.getRide(newSeg.get().ride);
        this._lastElements = theseElements.map((element) => {
            const scheme = {
                number: <0 | 1 | 2 | 3>element.element.colourScheme,
                trackColour: thisRide.colourSchemes[<0 | 1 | 2 | 3>element.element.colourScheme || 0]
            };
            return { element, scheme };
        });

        // paint the new selection
        ColourChange.setRideColour(thisRide, 17, 17, 17, -1, -1, -1, 3); // paint it yellow
        this._lastElements.forEach(element => {
            element.element.element.colourScheme = 3;
        });
        this.startToggling();
        return true;
    }

    private startToggling() {
        // setTimeout(this.toggleToOtherScheme.bind(this), 500);
        context.setInterval(this.toggleToOtherScheme.bind(this), 1000);
    }

    private toggleToOtherScheme() {
        debug(`toggling to other scheme. ${this._lastElements.length} elements.`);
        this._lastElements.forEach(element => {
            element.element.element.colourScheme = (element.element.element.colourScheme === 3 ? 0 : 3);
        });
    }
}
