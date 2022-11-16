import { ColourSchemeValue } from './../objects/segmentElementPainter';
import { Segment, SegmentDescriptor } from "../objects/segment";

const GlobalStorageKey = `AdvancedRideBuilder`;

type storageKeys =
    "previewSegment" |
    "selectedSegment" |
    "paintedSegment" |
    "paintedColourScheme" |
    "paintedColourSchemeValue";

const storePreviewSegment = (segment: Segment | null): void => {
    context.sharedStorage.set(`${GlobalStorageKey}.previewSegment`, segment);
}

const getPreviewSegment = (): Segment | null => {
    return context.sharedStorage.get(`${GlobalStorageKey}.previewSegment`) || null;
}

const storeSelectedSegment = (segment: Segment | null): void => {
    context.sharedStorage.set(`${GlobalStorageKey}.selectedSegment`, segment);
}

const getSelectedSegment = (): Segment | null => {
    return context.sharedStorage.get(`${GlobalStorageKey}.selectedSegment`) || null;
}

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

const setPaintedSegmentDetails = (segment: Segment | null, colourScheme: ColourSchemeValue | null, colourSchemeValue: TrackColour | null): void => {
    //store the segment.get().location and ride
    context.sharedStorage.set(`${GlobalStorageKey}.segmentDescriptor`, segment?.get());
    context.sharedStorage.set(`${GlobalStorageKey}.paintedColourScheme`, colourScheme);
    context.sharedStorage.set(`${GlobalStorageKey}.paintedColourSchemeValue`, colourSchemeValue);
}

export { storePreviewSegment, getPreviewSegment, storeSelectedSegment, getSelectedSegment, getPaintedSegmentDetails, setPaintedSegmentDetails };
