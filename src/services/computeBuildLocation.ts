import { TrackElementType } from "../utilities/trackElementType";
import { debug } from "../utilities/logger";

export const computeBuildLocation = ({ initialLocation, buildDirection, trackElementType }: {
    initialLocation: CoordsXYZD,
    buildDirection: BuildDirection,
    trackElementType: TrackElementType
}): CoordsXYZD => {
    const { x, y, z, direction } = initialLocation;
    const zAdjustment = getAdjustedBeginZ({ segmentType: trackElementType, buildDirection }).beginZ;
    const newZ = z + zAdjustment;

    const xyAdjustment = getAdjustedXYCoords({ trackType: trackElementType, direction });
    const newX = x + xyAdjustment.x;
    const newY = y + xyAdjustment.y;

    const directionAdjustment = getAdjustedDirection({ trackType: trackElementType, direction, buildDirection });
    const newDirection = directionAdjustment.direction;

    const newBuildLocation = { x: newX, y: newY, z: newZ, direction: newDirection };
    return newBuildLocation;
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
        debug(`Adjusting z values due to building in the "previous" direction.`);
        return {
            beginZ: 0 - thisSegment.endZ
        };
    }
    return { // building next & flat/up, or previous & flat/down
        beginZ: 0
    };
};

/**
 * Gets the beginZ and endZ of the given TrackElementType.
 * @param type  The track segment type.
 */
const getSegmentBeginAndEndZ = (segmentType: TrackElementType): { beginZ: number, endZ: number } => {
    const thisSegment = context.getTrackSegment(Number(segmentType));
    return thisSegment ? { beginZ: thisSegment.beginZ, endZ: thisSegment.endZ } : { beginZ: 0, endZ: 0 };
};

/**
 * Gets the endX and endY of the given TrackElementType.
 * @param type  The track segment type.
 */
const getSegmentEndXAndY = (segmentType: TrackElementType): { endX: number, endY: number } => {
    const thisSegment = context.getTrackSegment(Number(segmentType));
    return thisSegment ? { endX: thisSegment.endX, endY: thisSegment.endY } : { endX: 0, endY: 0 };
};

/**

 * @param trackType the type of track element
 * @param direction direction the track is pointing at build-time
 */
const getAdjustedXYCoords = ({ trackType, direction }: {
    direction: Direction8,
    trackType: TrackElementType
}): CoordsXY => {

    const emptyLocation = <CoordsXYZD>{ x: 0, y: 0, z: 0, direction: 0 };
    const thisTrackType = context.getTrackSegment(Number(trackType));

    if (!thisTrackType) {
        debug(`Error: Segment #${trackType} does not exist.`);
        return emptyLocation;
    }

    const { x: emptyX, y: emptyY } = emptyLocation;
    const { endX, endY } = getSegmentEndXAndY(trackType);

    if (thisTrackType.beginDirection != thisTrackType.endDirection) { // an attempt to fix diagonal tracks
        // lets try disabling it.
        // direction1 = <Direction>((coords.direction - (thisTrackType?.endDirection || 0) + 4) % 4);
    }

    // get the proper position based on the direction of the segment and the element
    let translatedX = 0, translatedY = 0;

    // rotate the segment based on the direction
    switch (direction) {
        case 0: {
            {
                translatedX = emptyX - endX;
                translatedY = emptyY - endY;
                break;
            }
        }
        case 1: {
            {
                translatedX = emptyX - endY;
                translatedY = emptyY + endX;
                break;
            }
        }
        case 2: {
            {
                translatedX = emptyX + endX;
                translatedY = emptyY + endY;
                break;
            }
        }
        case 3: {
            {
                translatedX = emptyX + endY;
                translatedY = emptyY - endX;
                break;
            }
        }
    }
    return {
        x: translatedX,
        y: translatedY,
    };
};

/**
 * Get the direction adjustment. Transforms Direction8 into Direction.
 * @returns a Direction (not Direction8)
 */

const getAdjustedDirection = ({ trackType, direction, buildDirection }: { trackType: TrackElementType; direction: Direction8; buildDirection: BuildDirection }): { direction: Direction } => {
    // todo do  more than just mod4 the direction.
    const newDirection = <Direction>(direction % 4);
    return { direction: newDirection };
};

