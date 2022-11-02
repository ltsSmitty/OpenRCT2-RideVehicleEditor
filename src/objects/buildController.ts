/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { TrackElementProps } from './../services/rideBuilder';
import { Flags } from './../utilities/Flags';
import { Segment } from './segment';



type TrackPlaceProps = {
    brakeSpeed?: number,
    colour?: number,
    seatRotation?: number | null,
    trackPlaceFlags?: number, // the ghost flag is 104
    isFromTrackDesign?: boolean, // default is false
    flags?: number
};

type TrackRemoveProps = {
    sequence: number, // for distinguisihing between multi-tile segments
    flags: number
};

export class SegmentBuildController {
    private _segment: Segment;
    private _trackPlaceProps: TrackPlaceProps;
    private _trackRemoveProps: TrackRemoveProps;
    private _buildInstructions!: { build: TrackElementProps, remove: TrackElementProps };

    constructor(segment: Segment, trackPlaceProps: TrackPlaceProps, trackRemoveProps: TrackRemoveProps) {
        this._segment = segment;
        this._trackPlaceProps = trackPlaceProps;
        this._trackRemoveProps = trackRemoveProps;
        this.makeBuildInstructions();
    }

    updateSegment(seg: Segment) {
        this._segment = seg;
    }

    updaterackPlaceProps(props: TrackPlaceProps) {
        this._trackPlaceProps = props;
    }

    updateTrackRemoveProps(props: TrackRemoveProps) {
        this._trackRemoveProps = props;
    }

    real() {
        this._trackPlaceProps.trackPlaceFlags = Flags.BuildTrackReal;
        this._trackPlaceProps.flags = Flags.BuildTrackReal;
        this._trackRemoveProps.flags = Flags.BuildTrackReal;
        return this.makeBuildInstructions();
    }

    preview() {
        this._trackPlaceProps.trackPlaceFlags = Flags.BuildTrackPreview;
        this._trackPlaceProps.flags = Flags.BuildTrackPreview;
        this._trackRemoveProps.flags = Flags.BuildTrackPreview;
        return this.makeBuildInstructions();
    }

    makeBuildInstructions() {
        const seg = this._segment.get();
        const placeProps = this._trackPlaceProps;
        const removeProps = this._trackRemoveProps;

        this._buildInstructions = {
            build: {
                ...seg,
                ...placeProps
            },
            remove: {
                ...seg,
                ...removeProps
            }
        };
        return this._buildInstructions;
    }
}
