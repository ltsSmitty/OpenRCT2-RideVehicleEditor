import { Segment } from "../objects/segment";
import { TrackElementType } from '../utilities/trackElementType';

/**
 * Return the one that the user is most likely to want to use again
 * @param buildableSegmentOptions
 * @param selectedSegment
 * @returns
 */
export const getSuggestedNextSegment = (buildableSegmentOptions: TrackElementType[], selectedSegment: Segment | null, currentlySelectedBuild: TrackElementType | null): TrackElementType => {
    // todo make this smarter and use the soon-to-be-exposed TED to suggest the proper ones
    return buildableSegmentOptions[0];
}
