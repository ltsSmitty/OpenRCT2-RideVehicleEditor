import { TrackElementItem } from './SegmentController';
import { Segment } from "../objects/segment";
import { getSpecificTrackElement } from "./trackElementFinder";
import { debug } from "../utilities/logger";
import * as finder from "../services/trackElementFinder";

export const highlightGround = (segment: Segment | null) => {
    if (segment == null) {
        ui.tileSelection.range = null;
        return;
    }
    const coords = segment.get().location
    const segmentElements = getGroundElementCoordsUnderSegment(segment);
    if (!segmentElements) {
        debug(`the segmentElement array is empty`);
        return;
    }
    const localMapRange = getMapRangeFromTrackSegmentElementArray(segmentElements);

    const x1 = coords.x;
    const x2 = x1 + localMapRange.endX;
    const y1 = coords.y;
    const y2 = y1 + localMapRange.endY;

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
    // debug(`ui.tileSelection.range before apply: ${JSON.stringify(ui.tileSelection.range)}`)
    // debug(`MapRange about to apply is ${JSON.stringify(mapRange)}`)
    ui.tileSelection.range = mapRange;
    ui.tileSelection.range = mapRange
    // debug(`ui.tileSelection.range after apply: ${JSON.stringify(ui.tileSelection.range)}`)
}

const getGroundElementCoordsUnderSegment = (segment: Segment): TrackSegmentElement[] | null => {
    // get the element index of this segment in order to
    const thisElement = getSpecificTrackElement(segment.get().ride, segment.get().location)
    // get a TI for the segment
    const thisTI = map.getTrackIterator(thisElement.coords, thisElement.index);
    // get the element arry
    const segmentElements = thisTI?.segment?.elements
    if (!segmentElements) return null;
    return segmentElements;
};

const getMapRangeFromTrackSegmentElementArray = (segmentArray: TrackSegmentElement[]): { endX: number, endY: number } => {
    // debug(`in getMapRangeFromTrackSegmentElementArray. segmentArray is ${JSON.stringify(segmentArray)}`);
    const startX = segmentArray[0].x;
    const endX = segmentArray[segmentArray.length - 1].x;

    const startY = segmentArray[0].y;
    const endY = segmentArray[segmentArray.length - 1].y;

    // debug(`startX: ${startX}, endX: ${endX}, startY: ${startY}, endY: ${endY}`);
    return {
        endX, endY
    };
};


export const highlightSelectedElements = (segment: Segment | null) => {
    if (segment == null) { return }
    const selectedElement = finder.getSpecificTrackElement(segment.get().ride, segment.get().location);
    // for each event in selectElenents, highlight the tile
    // selectedElement.element.isHighlighted = true;
    // todo figure out a better way to highligth a segment since highlight is the same as ghost
}
