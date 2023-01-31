/** Whether pointed forward (next), in the standard direction cars get launched, or backward (previous) */
type BuildDirection = "next" | "previous";

/** Whether to include segments a ride can validly build, or all the pieces that it can *technically* draw */
type DrawableSegmentBuildRule = "enabled" | "extra"; // todo implement covered
