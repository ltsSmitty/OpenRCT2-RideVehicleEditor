import { TrackElementItem } from './SegmentController';
import { Segment } from "../objects/segment";
import { getASpecificTrackElement } from "./trackElementFinder";
import { debug } from "../utilities/logger";
import * as finder from "../services/trackElementFinder";

export const highlightMapRange = (segment: Segment | null, callback?: (highlightedMapRange: MapRange | null) => void): void => {
    if (segment == null) {
        ui.tileSelection.range = null;
        return;
    }

    const segmentElements = getGroundElementCoordsUnderSegment(segment);

    if (!segmentElements) {
        debug(`the segmentElement array is empty`);
        return;
    }
    const localMapRange = getMapRangeFromTrackSegmentElementArray(segmentElements);

    const coords = segment.get().location;

    const x1 = coords.x;
    const y1 = coords.y;
    let x2, y2;

    // the localMapRange doesn't account for direction, so this will set it appropriately
    switch (coords.direction) {
        case 0: {
            x2 = x1 + localMapRange.endX;
            y2 = y1 + localMapRange.endY;
            break;
        }
        case 1: {

            // swap x and y and the signs
            x2 = x1 + localMapRange.endY;
            y2 = y1 - localMapRange.endX;
            break;
        }
        case 2: {
            // negate the signs
            x2 = x1 - localMapRange.endX;
            y2 = y1 - localMapRange.endY;
            break;
        }
        case 3: {
            // swap x and y and the signs
            x2 = x1 - localMapRange.endY;
            y2 = y1 + localMapRange.endX;
            break;
        }

    }

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
}

/**
 * Returns an array of relative coords of the track elements for the segment.
 *
 * For a large left turn, it returns 7 relatively spaced coords (for the seven tiles it covers)) that go from (0,0) to (+/-64,+/-64) depending on how the segment is rotated.
 */
const getGroundElementCoordsUnderSegment = (segment: Segment): TrackSegmentElement[] | null => {
    // get the element index of this segment in order to
    const thisTI = finder.getTIAtSegment(segment)
    const segmentElements = thisTI?.segment?.elements
    if (!segmentElements) return null;
    return segmentElements;
};

const getMapRangeFromTrackSegmentElementArray = (segmentArray: TrackSegmentElement[]): { endX: number, endY: number } => {
    const startX = segmentArray[0].x;
    const endX = segmentArray[segmentArray.length - 1].x;

    const startY = segmentArray[0].y;
    const endY = segmentArray[segmentArray.length - 1].y;

    debug(`startX: ${startX}, endX: ${endX}, startY: ${startY}, endY: ${endY}`);
    return {
        endX, endY
    };
};


export const highlightSelectedElements = (segment: Segment | null) => {
    if (segment == null) { return }
    const selectedElement = finder.getASpecificTrackElement(segment.get().ride, segment.get().location);
    // for each event in selectElenents, highlight the tile
    // selectedElement.element.isHighlighted = true;
    // todo figure out a better way to highligth a segment since highlight is the same as ghost
}
