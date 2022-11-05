import { SegmentDescriptor } from './segment';
import { Flags } from './../utilities/Flags';
import { TrackElementType } from '../utilities/trackElementType';
import { RideType } from '../utilities/rideType';



export type TrackPlaceProps = {
    location?: CoordsXYZD;
    ride?: number;
    trackType?: TrackElementType;
    rideType?: RideType;
    brakeSpeed?: number,
    colour?: number,
    seatRotation?: number | null,
    trackPlaceFlags?: number, // the ghost flag is 104
    isFromTrackDesign?: boolean, // default is false
    flags?: number
};

export type TrackRemoveProps = {
    location?: CoordsXYZD;
    ride?: number;
    trackType?: TrackElementType;
    rideType?: RideType;
    sequence: number, // for distinguisihing between multi-tile segments
    flags: number
};

const defaultTrackPlaceProps: TrackPlaceProps = {
    trackPlaceFlags: Flags.BuildTrackReal, // the ghost flag is 104
    isFromTrackDesign: false, // default is false
    flags: Flags.BuildTrackReal
};

const defaultTrackRemoveProps: TrackRemoveProps = {
    sequence: 0,
    flags: Flags.BuildTrackReal
};

export const makeBuildInstructions = (segment: SegmentDescriptor, type: "real" | "ghost"): { build: TrackPlaceProps; remove: TrackRemoveProps; } => {
    const trackPlaceProps = defaultTrackPlaceProps;
    const trackRemoveProps = defaultTrackRemoveProps;

    if (type === "real") {
        trackPlaceProps.trackPlaceFlags = Flags.BuildTrackReal;
        trackPlaceProps.flags = Flags.BuildTrackReal;
        trackRemoveProps.flags = Flags.BuildTrackReal;
    } else {
        // ghost
        trackPlaceProps.trackPlaceFlags = Flags.BuildTrackPreview;
        trackPlaceProps.flags = Flags.BuildTrackPreview;
        trackRemoveProps.flags = Flags.BuildTrackPreview;
    }
    return {
        build: { ...trackPlaceProps, ...segment },
        remove: { ...trackRemoveProps, ...segment }
    };
}
