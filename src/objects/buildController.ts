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

export class SegmentBuildController {
    private _trackPlaceProps: TrackPlaceProps = defaultTrackPlaceProps;
    private _trackRemoveProps: TrackRemoveProps = defaultTrackRemoveProps;
    private _buildInstructions!: { build: TrackPlaceProps, remove: TrackRemoveProps };

    constructor(trackPlaceProps?: TrackPlaceProps, trackRemoveProps?: TrackRemoveProps) {

        this._trackPlaceProps = trackPlaceProps || defaultTrackPlaceProps;
        this._trackRemoveProps = trackRemoveProps || defaultTrackRemoveProps;
    }

    private real(): void {
        this._trackPlaceProps.trackPlaceFlags = Flags.BuildTrackReal;
        this._trackPlaceProps.flags = Flags.BuildTrackReal;
        this._trackRemoveProps.flags = Flags.BuildTrackReal;
    }

    private ghost(): void {
        this._trackPlaceProps.trackPlaceFlags = Flags.BuildTrackPreview;
        this._trackPlaceProps.flags = Flags.BuildTrackPreview;
        this._trackRemoveProps.flags = Flags.BuildTrackPreview;
    }

    makeBuildInstructions(segment: SegmentDescriptor, type: "real" | "ghost"): { build: TrackPlaceProps; remove: TrackRemoveProps; } {
        (type === "real") ? this.real() : this.ghost();
        const placeProps = this._trackPlaceProps;
        const removeProps = this._trackRemoveProps;

        this._buildInstructions = {
            build: {
                ...segment,
                ...placeProps
            },
            remove: {
                ...segment,
                ...removeProps
            }
        };
        return this._buildInstructions;
    }
}
