import { ColourSchemeValue } from './../objects/segmentElementPainter';
import { Segment, SegmentDescriptor } from "../objects/segment";
import { debug } from './logger';

const GlobalStorageKey = `AdvancedRideBuilder`;

type storageKeys =
    "previewSegment" |
    "selectedSegment" |
    "paintedSegment" |
    "paintedColourScheme" |
    "paintedColourSchemeValue";

/**
* @summary Sets the preview segment in sharedStorage.
* @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
*/
const setPreviewSegment = (segment: Segment | null): void => {
    // debug(`segment.get: ${segment?.get()}`);
    // debug(`JSON.stringify(segment): ${JSON.stringify(segment?.get())}`);
    context.sharedStorage.set(`${GlobalStorageKey}.previewSegment`, segment);
}

/**
 * @summary Gets the preview segment from sharedStorage
 * @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
 */
const getPreviewSegment = (): Segment | null => {
    return context.sharedStorage.get(`${GlobalStorageKey}.previewSegment`) || null;
}

/**
 * @summary Sets the selected segment in sharedStorage
 * @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
 */
const setSelectedSegment = (segment: Segment | null): void => {
    context.sharedStorage.set(`${GlobalStorageKey}.selectedSegment`, segment);
}

/**
 * @summary Gets the selected segment from sharedStorage
 * @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
 */
const getSelectedSegment = (): Segment | null => {
    return context.sharedStorage.get(`${GlobalStorageKey}.selectedSegment`) || null;
}

/**
 * @summary Returns the segment and paint details for the segment that was most recently highlighted (painted).
 * @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
 */
const getPaintedSegmentDetails = (): { segment: Segment | null, colourScheme: ColourSchemeValue | null, colourSchemeValue: TrackColour | null } => {
    const segmentDescriptor = <SegmentDescriptor>context.sharedStorage.get(`${GlobalStorageKey}.segmentDescriptor`) || null;
    const paintedColourScheme = <ColourSchemeValue | null>context.sharedStorage.get(`${GlobalStorageKey}.paintedColourScheme`) || 0;
    const paintedColourSchemeValue = <TrackColour | null>context.sharedStorage.get(`${GlobalStorageKey}.paintedColourSchemeValue`) || null;
    if (segmentDescriptor == null || paintedColourScheme == null || paintedColourSchemeValue == null) {
        return { segment: null, colourScheme: null, colourSchemeValue: null };
    }
    return {
        segment: new Segment(segmentDescriptor),
        colourScheme: paintedColourScheme,
        colourSchemeValue: paintedColourSchemeValue
    };
};

/**
 * @summary Sets the segment and paint details for the segment that was most recently highlighted (painted).
 * @usage for restoring the colour of the segment if the user unsafely closes the window (e.g. game save while the window was open).
 */
const setPaintedSegmentDetails = (segment: Segment | null, colourScheme: ColourSchemeValue | null, colourSchemeValue: TrackColour | null): void => {
    //store the segment.get().location and ride
    context.sharedStorage.set(`${GlobalStorageKey}.segmentDescriptor`, segment?.get());
    context.sharedStorage.set(`${GlobalStorageKey}.paintedColourScheme`, colourScheme);
    context.sharedStorage.set(`${GlobalStorageKey}.paintedColourSchemeValue`, colourSchemeValue);
}

export { setPreviewSegment, getPreviewSegment, setSelectedSegment, getSelectedSegment, getPaintedSegmentDetails, setPaintedSegmentDetails };
