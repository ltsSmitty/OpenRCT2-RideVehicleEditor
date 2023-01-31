import { TrackElementItem } from './SegmentController';
import { Segment } from "../objects/segment";
import { debug } from "../utilities/logger";
import * as finder from "../services/trackElementFinder";

/**
 *  Use the built in ui.tileSelection to highlight the ground tiles under the segment.
 */
export const highlightMapRangeUnderSegment = ({ segment, thisTI, callback }: { segment: Segment | null, thisTI: TrackIterator | null, callback?: (highlightedMapRange: MapRange | null) => void }): void => {
    if (segment == null || thisTI == null) {
        ui.tileSelection.range = null;
        return;
    }

    const segmentElements = finder.getAllSegmentTrackElements({ segment, thisTI });

    if (!segmentElements) {
        debug(`the segmentElement array is empty`);
        return;
    }

    const coords = segment.get().location;
    if (coords == null) {
        debug(`Unexepctedbly unable to get corresponding coords for this segment. `);
    }
    const x1 = coords.x;
    const y1 = coords.y;

    const x2 = segmentElements[segmentElements.length - 1].coords.x;
    const y2 = segmentElements[segmentElements.length - 1].coords.y;

    // debug(`Attempting to place track highlight: segment coords: ${JSON.stringify(coords)}
    // localMapRange.endX: ${localMapRange.endX}, localMapRange.endY: ${localMapRange.endY}
    //     x1: ${x1}, x2: ${x2}, y1: ${y1}, y2: ${y2}`);
    const mapRange = {
        leftTop: {
            x: (x1 < x2) ? x1 : x2,
            y: (y1 < y2) ? y1 : y2
        },
        rightBottom: {
            x: (x1 > x2) ? x1 : x2,
            y: (y1 > y2) ? y1 : y2
        }
    };
    // debug(`mapRange: ${JSON.stringify(mapRange)}`);
    ui.tileSelection.range = mapRange;
    if (callback) callback(mapRange);
};

export const highlightSelectedElements = (segment: Segment | null) => {
    if (segment == null) { return }
    const selectedElement = finder.getSpecificTrackElement(segment.get().ride, segment.get().location)
    // for each event in selectElenents, highlight the tile
    // selectedElement.element.isHighlighted = true;
    // todo figure out a better way to highligth a segment since highlight is the same as ghost
}
