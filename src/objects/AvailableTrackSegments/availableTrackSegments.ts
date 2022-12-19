import { RideType } from "../../utilities/rideType"
import { AvailableTrackSegmentTypes } from "../trackTypeSelector"
import LoopingCoasterAvailableSegmentTypes from "./LoopingCoaster"


//
const allBuildableSegments = context.getAllTrackSegments().map(x => x.type);

export const getAvailableTrackSegmentsForRideType = (rideType: RideType): AvailableTrackSegmentTypes => {
    switch (rideType) {
        case 15:
            {
                return LoopingCoasterAvailableSegmentTypes;
            }
        default:
            return {
                enabled: allBuildableSegments,
                extra: [],
                covered: []
            };
    }
}
