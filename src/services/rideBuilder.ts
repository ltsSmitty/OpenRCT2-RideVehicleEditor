import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";
import { debug } from "../utilities/logger";

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

export const buildOrRemoveTrackElement = (trackProps: TrackElementProps, action: "build" | "remove", normalizeZ: "next" | "previous" | false, callback?: (result: GameActionResult) => void): void => {
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
        debug(`normalizeZ is ${normalizeZ}`);
        const zModifier = normalizeBeginAndEndValues(trackType, normalizeZ);
        debug(`buildLocation.z is ${buildLocation.z}`);
        newBuildLocation.z = buildLocation.z + zModifier.beginZ;
        debug(`newBuildLocation.z:  \n[     ${newBuildLocation.z}      ]\n`)
    }

    const gameActionParams = {
        ...mainProps,
        ...newBuildLocation,
        trackType,
        brakeSpeed,
        colour,
        seatRotation,
        trackPlaceFlags,
        isFromTrackDesign,
        flags
    };
    // debug(`about to build using gameActionParans: \n${JSON.stringify(gameActionParams, null, 2)}`);
    context.executeAction(gameActionEvent, gameActionParams, (result) => {
        // debug(`Build result: ${JSON.stringify(result)}`);
        toggleRideBuildingCheats(false);
        if (callback) return callback(result);
    });

    toggleRideBuildingCheats(false);
};

// TODOO check what the values were before toggling  and set them back to what they were so we're not turning off cheats the user wants to be on
const toggleRideBuildingCheats = (cheatsOn: boolean) => {

    // TODO refactor to use gameactions for network compatability
    // context.executeAction("setcheataction", ) // figure out what the args are
    cheats.buildInPauseMode = cheatsOn;
    cheats.allowArbitraryRideTypeChanges = cheatsOn;

};


const getSegmentBeginAndEndZ = (segmentType: TrackElementType | number) => {
    const thisSegment = context.getTrackSegment(segmentType);
    if (!thisSegment) return { beginZ: 0, endZ: 0 };
    return {
        beginZ: thisSegment.beginZ,
        endZ: thisSegment.endZ
    }
}

const getSegmentBeginAndEndXAndY = (segmentType: TrackElementType | number) => {
    const thisSegment = context.getTrackSegment(segmentType);
    if (!thisSegment) return { beginX: 0, beginY: 0, endX: 0, endY: 0 };
    return {
        beginX: 0,
        beginY: 0,
        endX: thisSegment.endX,
        endY: thisSegment.endY,
    }
}



// if the ride is has a negative slope (e.g. Down25),
// then it actually is stored with startZ of 16 and endZ of 0.
// This function will change it to make it start at  0 and end at -16.
// Necessary for proper build placement.
const normalizeBeginAndEndValues = (segmentType: TrackElementType, direction: "next" | "previous"): { beginZ: number, endZ: number } => {
    const thisSegment = getSegmentBeginAndEndZ(segmentType);

    // debug(`thisSegment ${TrackElementType[segmentType]}begin and end Z: ${thisSegment.beginZ}, ${thisSegment.endZ}`);

    if (direction === "next" && thisSegment.beginZ > 0) {
        // debug(`Normalizing z values from the "next" direction.`)
        // debug(`This ride is probably pointing down; beginZ is ${thisSegment.beginZ}`);
        return {
            beginZ: 0 - thisSegment.beginZ,
            endZ: 0
        };
    }
    if (direction === "previous" && thisSegment.endZ > 0) {
        // debug(`Normalizing z values from the "previous" direction.`)
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
