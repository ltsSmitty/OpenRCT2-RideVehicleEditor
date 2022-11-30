import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";
import { debug } from "../utilities/logger";
import * as finder from './trackElementFinder';


export type TrackElementProps = {

    location: CoordsXYZD,
    ride: number, // will log an error if you specify a ride # that doesn't exist
    trackType: TrackElementType, // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType,
    brakeSpeed?: number,
    colour?: number,
    seatRotation?: number | null,
    trackPlaceFlags?: number, // the ghost flag is 104
    isFromTrackDesign?: boolean, // default is false
    flags?: number
};

export const buildOrRemoveTrackElement = (trackProps: TrackElementProps, action: "build" | "remove", normalizeZ: "next" | "previous" | false, callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void): void => {
    const gameActionEvent = (action === "build" ? "trackplace" : "trackremove");
    toggleRideBuildingCheats(true);

    // eslint-disable-next-line prefer-const
    let { location: buildLocation, trackType, brakeSpeed, colour, seatRotation, trackPlaceFlags, isFromTrackDesign, flags, ...mainProps } = trackProps;

    (brakeSpeed ? brakeSpeed : brakeSpeed = 0);
    (colour ? colour : colour = 0);
    (seatRotation ? seatRotation : seatRotation = 4);
    (trackPlaceFlags ? trackPlaceFlags : trackPlaceFlags = 0);
    (isFromTrackDesign ? isFromTrackDesign : isFromTrackDesign = false);
    // ghost flag is 104
    (flags ? flags : flags = 0);


    // if the ride is has a negative slope (e.g. Down25),
    // then it actually is stored with startZ of 16 and endZ of 0.
    // This function will change it to make it  0 and -16
    const newBuildLocation: CoordsXYZD = { ...buildLocation };
    if (normalizeZ) {
        const zModifier = normalizeBeginAndEndValues(trackType, normalizeZ);
        newBuildLocation.z = buildLocation.z + zModifier.beginZ;

        // when building backwards, you have to also tweak the x/y/direction based on the segment
        if (normalizeZ == "previous") {
            const xyModifier = modifyXYCoords(buildLocation, trackType, normalizeZ);
            newBuildLocation.x = (xyModifier?.x || 0);
            newBuildLocation.y = (xyModifier?.y || 0);
            newBuildLocation.direction = (xyModifier?.direction || 0);
            // newBuildLocation.direction = 3
            // if (normalizeZ == "previous") newBuildLocation.direction = <Direction>((buildLocation.direction + 2) % 4);
        }
    }

    if (newBuildLocation.direction > 3) {
        debug(`setting the direction mod 4 to ${newBuildLocation.direction % 4}`);
        newBuildLocation.direction = <Direction>(newBuildLocation.direction % 4);
    }

    debug(`compare the original buildLocation to the newBuildLocation: ${JSON.stringify(buildLocation)} vs ${JSON.stringify(newBuildLocation)}`);
    debug(`about to try building ${TrackElementType[trackType]} at ${newBuildLocation.x}, ${newBuildLocation.y}, ${newBuildLocation.z}, ${newBuildLocation.direction}`);



    const gameActionParams = {
        ...mainProps,
        ...newBuildLocation,
        trackType: Number(trackType),
        brakeSpeed,
        colour,
        seatRotation,
        trackPlaceFlags,
        isFromTrackDesign,
        flags
    };
    context.executeAction(gameActionEvent, gameActionParams, (result) => {
        toggleRideBuildingCheats(false);
        if (callback) return callback({ result, actualBuildLocation: newBuildLocation });
    });
};

// TODOO check what the values were before toggling  and set them back to what they were so we're not turning off cheats the user wants to be on
const toggleRideBuildingCheats = (cheatsOn: boolean) => {

    // TODO refactor to use gameactions for network compatability
    // context.executeAction("setcheataction", ) // figure out what the args are
    cheats.buildInPauseMode = cheatsOn;
    cheats.allowArbitraryRideTypeChanges = cheatsOn;

};


const getSegmentBeginAndEndZ = (segmentType: TrackElementType | number) => {
    debug(`getSegmentBeginAndEndZ: ${segmentType}`);
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



// if the ride is has a negative slope (e.g. Down25),
// then it actually is stored with startZ of 16 and endZ of 0.
// This function will change it to make it start at  0 and end at -16.
// Necessary for proper build placement.
const normalizeBeginAndEndValues = (segmentType: TrackElementType, direction: "next" | "previous"): { beginZ: number, endZ: number } => {
    const thisSegment = getSegmentBeginAndEndZ(segmentType);

    debug(`thisSegment ${TrackElementType[segmentType]}begin and end Z: ${thisSegment.beginZ}, ${thisSegment.endZ}`);

    if (direction === "next" && thisSegment.beginZ > 0) {
        debug(`Normalizing z values from the "next" direction.`)
        // debug(`This ride is probably pointing down; beginZ is ${thisSegment.beginZ}`);
        return {
            beginZ: 0 - thisSegment.beginZ,
            endZ: 0
        };
    }
    if (direction === "previous" && thisSegment.endZ > 0) {
        debug(`Normalizing z values from the "previous" direction.`)
        // debug(`thisSegment begin and end z: ${thisSegment.beginZ}, ${thisSegment.endZ}`);
        return {
            beginZ: 0 - thisSegment.endZ,
            endZ: 0
        };
    }
    return {
        beginZ: 0,
        endZ: 0
    };

};

const modifyXYCoords = (initialLocation: CoordsXYZD, trackType: TrackElementType, normalizeZ: "next" | "previous" | false): CoordsXYZD | null => {

    const relativeCoords = finder.getRelativeElementCoordsForTrackSegment(trackType);

    if (!relativeCoords) {
        debug(`Error: Segment #${trackType} has no elements. Is it a real track type?`);
        return null;
    }

    const thisTrackType = context.getTrackSegment(Number(trackType));
    debug(`begin and end directions for this track type ${TrackElementType[trackType]}: ${thisTrackType?.beginDirection}, ${thisTrackType?.endDirection}`);

    const xyModifier = getSegmentEndXAndY(trackType);
    debug(`xyModifier: ${xyModifier.endX}, ${xyModifier.endY}`);
    const { endX, endY } = xyModifier;

    const coords = { ...initialLocation };
    const x1 = coords.x;
    const y1 = coords.y;

    let direction1 = coords.direction;
    if (thisTrackType?.beginDirection != thisTrackType?.endDirection) {
        direction1 = <Direction>((coords.direction - (thisTrackType?.endDirection || 0) + 4) % 4);
    }

    // get the proper position based on the direction of the segment and the element
    // const translatedCoords =
    let translatedX, translatedY

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
        z: -1,
        direction: <Direction>direction1
    }

}
