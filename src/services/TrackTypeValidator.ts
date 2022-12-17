// use this service to get the available track types for a given ride type

import { TrackElementType } from "../utilities/trackElementType";

// this is not real because there isn't API access available to the plugin
//
export const getAvailableTrackElementTypes = (rideType: number | null): TrackElementType[] => {

    // todo don't just return everything
    // when the RTD gets exposed, use that to determine the available track types
    // todo make sure that the TrackElementType enum is up to date with newest track types as rides get added
    const availableTrackElementTypes: TrackElementType[] = [];
    if (rideType === null) { return availableTrackElementTypes; } // return empty array

    for (const trackElementType in TrackElementType) {
        const trackElement = TrackElementType[trackElementType] as unknown as TrackElementType;
        availableTrackElementTypes.push(trackElement);
    }
    return availableTrackElementTypes;
};
