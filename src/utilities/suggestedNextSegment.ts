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
    // if selectedSegment is 134, then suggest 136
    // if selectedSegment is 133, then suggest 135
    if (!selectedSegment) return buildableSegmentOptions[0];
    const selectedSegmentType = selectedSegment.get().trackType;
    if (selectedSegmentType === 134) return 136; // if it's diagonal right, then go go orthogonal
    if (selectedSegmentType === 133) return 135; // if it's diagonal left, then go go orthogonal

    console.log(`buildableSegmentOptions: ${buildableSegmentOptions}`);

    return buildableSegmentOptions[0];
}
