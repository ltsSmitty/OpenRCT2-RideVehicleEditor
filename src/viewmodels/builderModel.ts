import { Segment } from './../objects/segment';
import { TrackElementProps, performTrackActions } from './../services/rideBuilder';
import { makeBuildInstructions, TrackPlaceProps, TrackRemoveProps } from '../objects/makeBuildInstructions';
import { debug } from '../utilities/logger';
import { getBuildableSegments } from '../services/segmentValidator';
import { TrackElementType } from '../utilities/trackElementType';


export class Build {
    private _segment!: Segment;
    private _isGhost!: boolean;
    private _buildDirection!: "next" | "previous";

    private _compensateForZ!: boolean; // this will be true in all cases unless it's a ghost build
    private _compensateForDirection!: boolean; // this is relevant for building previous and diagonals

    private _finalLocation!: CoordsXYZD;
    // todo figure out what to do with diagonals here

    private _buildInstructions!: { build: TrackPlaceProps, remove: TrackRemoveProps }
    private _callback: ((result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void) | undefined = undefined;
    private _action!: "build" | "remove";


    remove({ segment, isGhost, buildDirection, callback }: {
        segment: Segment,
        isGhost: boolean,
        buildDirection: "next" | "previous",
        callback?: ((result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void) | undefined
    }): void {
        this._segment = segment;
        this._isGhost = isGhost;
        this._buildDirection = buildDirection;
        this._action = "remove";
        this._callback = callback;
        this.construct();
    }

    build({ segment, isGhost, buildDirection, callback }: {
        segment: Segment,
        isGhost: boolean,
        buildDirection: "next" | "previous",
        callback?: ((result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void) | undefined
    }): void {
        this._segment = segment;
        this._isGhost = isGhost;
        this._buildDirection = buildDirection;
        this._action = "build";
        this._callback = callback;
        this.construct();
    }

    private construct(): void {
        this._finalLocation = { ...this._segment.location };
        // if the piece already exists, then don't compensate for the z value since it's actually built already.
        this._compensateForZ = (this._action == "build");
        this.calculateZCompensation();

        // possibly also needed for diagonal, but not there yet.
        this._compensateForDirection = (this._buildDirection == "previous");
        this.calculateXYDCompensation();

        this.mod4Direction();

        this._buildInstructions = makeBuildInstructions({ segment: this._segment, isGhost: this._isGhost, modifiedLocation: this._finalLocation });

        performTrackActions({
            trackProps: <TrackElementProps>((this._action === "build") ? this._buildInstructions.build : this._buildInstructions.remove),
            action: this._action,
            callback: this._callback
        });
    }

    /**
     * Adjust the z value based on the track type and the direction
     * @returns
     */
    private calculateZCompensation(): void {
        if (!this._compensateForZ) return;
        const zModifier = getAdjustedBeginZ({ segmentType: this._segment.trackType, buildDirection: this._buildDirection });
        // mutate the final location according to the zModifier
        this._finalLocation.z += zModifier.beginZ;
    }

    private mod4Direction(): void {
        if (this._finalLocation.direction < 3) {
            debug(`Direction is ${this._finalLocation.direction}. Modding by 4.`);
            this._finalLocation.direction = <Direction>(this._finalLocation.direction % 4);
        }
    }

    /**
     * Adjust the x, y, and direction based on the track type and the direction
     */
    private calculateXYDCompensation(): void {
        if (!this._compensateForDirection) return;
        // when building backwards, you have to also tweak the x/y/direction based on the segment
        // you also have to tweak some things based on diagonal? maybe not though
        if (this._buildDirection == "previous") {
            const { location, trackType } = this._segment;

            const xyModifier = getAdjustedXYCoords({ initialLocation: location, trackType });
            this._finalLocation.x = (xyModifier?.x || 0);
            this._finalLocation.y = (xyModifier?.y || 0);
            this._finalLocation.direction = (xyModifier?.direction || 0);
            // newBuildLocation.direction = 3
            // if (normalizeZ == "previous") newBuildLocation.direction = <Direction>((buildLocation.direction + 2) % 4);

        }
    }
}

/**
 * Get the TrackElementTypes that are valid to build before/after the given segment.
 * @param segment the segment to build before/after
 * @param allPossibleOptions all the possible TrackElementTypes to filter through
 * @returns an object with TrackElementTypes for the next and previous directions
 */
export const getBuildOptionsForSegment = ({ segment, tiAtSegment, allPossibleOptions }: { segment: Segment, tiAtSegment: TrackIterator, allPossibleOptions: TrackElementType[] }): { next: TrackElementType[], previous: TrackElementType[] } => {
    let next: TrackElementType[] = [];
    let previous: TrackElementType[] = [];

    const seg = segment.get();
    debug(`Getting build options for segment ${TrackElementType[seg.trackType]} at ${JSON.stringify(seg.location)}.`);
    debug(`Sorting through ${allPossibleOptions.length} possible options.`);

    // get forward potential builds
    const nextLocation = tiAtSegment.nextPosition;
    if (nextLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "next");
        next = buildableTrackTypes;
    }

    // get backward potential builds.
    const backLocation = tiAtSegment.previousPosition;
    if (backLocation !== null) {
        const buildableTrackTypes = getBuildableSegments(seg.trackType, allPossibleOptions, "previous");
        previous = buildableTrackTypes;
    }

    return { next, previous };
};

/**
 * Get the z-value modifiers based on the segment type and build direction.
 */
const getAdjustedBeginZ = ({ segmentType, buildDirection }: { segmentType: TrackElementType, buildDirection: "next" | "previous" }): { beginZ: number } => {
    // debug(`Normalizing begin and end z values.`);
    const thisSegment = getSegmentBeginAndEndZ(segmentType);

    if (buildDirection === "next" && thisSegment.beginZ > 0) { // pointing down, building forward
        debug(`Adjusting z values for down-pointing track type.`);
        return {
            beginZ: 0 - thisSegment.beginZ
        };
    }
    if (buildDirection === "previous" && thisSegment.endZ > 0) { // pointing up, building previous
        debug(`Normalizing z values from the "previous" direction.`);
        return {
            beginZ: 0 - thisSegment.endZ
        };
    }
    return { // building next & flat/up, or previous & flat/down
        beginZ: 0
    };
};

const getSegmentBeginAndEndZ = (segmentType: TrackElementType | number): { beginZ: number, endZ: number } => {
    const thisSegment = context.getTrackSegment(Number(segmentType));
    if (!thisSegment) return { beginZ: 0, endZ: 0 };
    return {
        beginZ: thisSegment.beginZ,
        endZ: thisSegment.endZ
    };
};

const getSegmentEndXAndY = (segmentType: TrackElementType | number): { endX: number, endY: number } => {
    const thisSegment = context.getTrackSegment(Number(segmentType));
    if (!thisSegment) return { endX: 0, endY: 0 };
    return {
        endX: thisSegment.endX,
        endY: thisSegment.endY,
    };
};



const getAdjustedXYCoords = ({ initialLocation, trackType }: { initialLocation: CoordsXYZD, trackType: TrackElementType }): CoordsXYZD | null => {

    const thisTrackType = context.getTrackSegment(Number(trackType));
    const relativeCoords = thisTrackType?.elements ?? [];

    if (relativeCoords.length === 0) {
        debug(`Error: Segment #${trackType} has no elements. Is it a real track type?`);
        return null;
    }

    // debug(`begin and end directions for this track type ${TrackElementType[trackType]}: ${thisTrackType?.beginDirection}, ${thisTrackType?.endDirection}`);

    const adjustedEndCoords = getSegmentEndXAndY(trackType);
    debug(`adjustedEndCoords: ${adjustedEndCoords.endX}, ${adjustedEndCoords.endY}`);
    const { endX, endY } = adjustedEndCoords;

    const coords = { ...initialLocation };
    const x1 = coords.x; // a copy of the original x
    const y1 = coords.y; // a copy of the original y
    // eslint-disable-next-line prefer-const
    let direction1 = coords.direction; // a copy of the original direction

    if (thisTrackType?.beginDirection != thisTrackType?.endDirection) { // an attempt to fix diagonal tracks
        // lets try disabling it.
        // direction1 = <Direction>((coords.direction - (thisTrackType?.endDirection || 0) + 4) % 4);
    }

    // get the proper position based on the direction of the segment and the element
    let translatedX, translatedY;

    // rotate the segment based on the direction
    switch (direction1) {
        case 0: {
            {
                translatedX = x1 - endX;
                translatedY = y1 - endY;
                break;
            }
        }
        case 1: {
            {
                translatedX = x1 - endY;
                translatedY = y1 + endX;
                break;
            }
        }
        case 2: {
            {
                translatedX = x1 + endX;
                translatedY = y1 + endY;
                break;
            }
        }
        case 3: {
            {
                translatedX = x1 + endY;
                translatedY = y1 - endX;
                break;
            }
        }
    }
    return {
        x: translatedX,
        y: translatedY,
        z: -1, // not used
        direction: <Direction>direction1
    };

};
