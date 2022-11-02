import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";
import { debug } from "../utilities/logger";
import * as Selector from "../objects/segmentSelector";
import { Flags } from "../utilities/Flags";

let currentPreviewTrackType: TrackElementType | null = null;

export type TrackElementProps = {
    buildLocation: CoordsXYZD,
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

export const buildOrRemoveTrackElement = (trackProps: TrackElementProps, action: "build" | "remove", callback?: (result: GameActionResult) => void): void => {

    toggleRideBuildingCheats(true);
    // eslint-disable-next-line prefer-const
    let { buildLocation, trackType, brakeSpeed, colour, seatRotation, trackPlaceFlags, isFromTrackDesign, flags, ...mainProps } = trackProps;

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
    const zModifier = normalizeBeginAndEndZValues(trackType);
    // let newZ;
    // if (zModifier && zModifier.beginZ)
    // newZ = zModifier.beginZ;
    buildLocation.z = buildLocation.z + zModifier.beginZ

    const trackPlaceParams = {
        ...mainProps,
        ...buildLocation,
        trackType,
        brakeSpeed,
        colour,
        seatRotation,
        trackPlaceFlags,
        isFromTrackDesign,
        flags
    };

    context.executeAction("trackplace", trackPlaceParams, (result) => {
        debug(`Build result: ${JSON.stringify(result)}`);
        toggleRideBuildingCheats(false);
        if (callback) callback(result);
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

// if the ride is has a negative slope (e.g. Down25),
// then it actually is stored with startZ of 16 and endZ of 0.
// This function will change it to make it start at  0 and end at -16.
// Necessary for proper build placement.
const normalizeBeginAndEndZValues = (segmentType: TrackElementType): { beginZ: number, endZ: number } => {
    const thisSegment = getSegmentBeginAndEndZ(segmentType);

    if (thisSegment.beginZ > 0) {
        debug(`This ride is probably pointing down; beginZ is ${thisSegment.beginZ}`);
        return {
            beginZ: 0 - thisSegment.beginZ,
            endZ: 0
        };
    }
    else {
        return thisSegment;
    }
};

export const buildFollowingSegment = (
    referenceSegment: Selector.SegmentInfo,
    typeSegmentToBuild: TrackElementType | null,
    placement: "real" | "preview") => {

    const thisSegmentInfo = referenceSegment;
    if (!thisSegmentInfo) {
        debug(`Build error: SegmentInfo was null when passed to ride builder, so no instructions were given.`);
        return false;
    }

    const nextCoords = thisSegmentInfo?.nextPosition;
    if (!nextCoords) {
        debug(`Build error: Segment hasn't provided nextCoords to build at.`);
        return false;
    }

    const thisRide = thisSegmentInfo?.ride;
    if (thisRide == null) {
        debug(`Build error: No ride was given to build this piece onto.`);
        return false;
    }

    if (typeSegmentToBuild == null) {
        debug(`Build error: No segment type was selected to build.`);
        return false;
    }

    const rideTypeToBuild = map.getRide(thisRide).type;

    // check if there's already a ghost there

    // remove the preview if there is

    buildTrackElement({
        buildLocation: nextCoords,
        ride: thisRide,
        trackType: typeSegmentToBuild,
        rideType: rideTypeToBuild,
        flags: (placement === "real" ? Flags.BuildTrackReal : Flags.BuildTrackPreview)
    }, (result => {
        debug(`Build result: ${result}`);
    }));
}


const removeTrack = (
    referenceSegment: Selector.SegmentInfo,
    typeSegmentToBuild: TrackElementType | null,
    placement: "real" | "preview") => { // same general args as trackplace, but needs a "sequence:0"


}

// const clearPreviewTrack()
