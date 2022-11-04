import { Segment } from "../objects/segment";

/**
 * Return the one that the user is most likely to want to use again
 * @param buildableSegmentOptions
 * @param selectedSegment
 * @returns
 */
export const getSuggestedNextSegment = (buildableSegmentOptions: Segment[], selectedSegment: Segment | null, currentlySelectedBuild: Segment | null): Segment => {
    // todo make this smarter and use the soon-to-be-exposed TED to suggest the proper ones
    return buildableSegmentOptions[0] || [];
}
