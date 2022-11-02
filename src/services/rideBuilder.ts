import { Segment } from './../objects/segment';
import { Action } from './actions';
import { Flags } from './../utilities/Flags';
import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";
import { debug } from "../utilities/logger";
import * as Selector from "../objects/segmentSelector";


let currentPreviewTrackType: TrackElementType | null = null;

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

type ConstructionProps = {
    referenceSegment: Selector.SegmentInfo,
    typeSegmentToBuild: TrackElementType | null,
    placement: "real" | "preview"
}

export const buildOrRemoveTrackElement = (trackProps: TrackElementProps, action: "build" | "remove", callback?: (result: GameActionResult) => void): void => {

    const gameActionEvent = (action === "build" ? "trackplace" : "trackremove");
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

    const gameActionParams = {
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

    context.executeAction(gameActionEvent, gameActionParams, (result) => {
        debug(`Build result: ${JSON.stringify(result)}`);
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

export const buildFollowingSegment = (constructionProps: ConstructionProps) => {

    const thisSegmentInfo = constructionProps.referenceSegment;
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

    if (constructionProps.typeSegmentToBuild == null) {
        debug(`Build error: No segment type was selected to build.`);
        return false;
    }

    const rideTypeToBuild = map.getRide(thisRide).type;

    // check if there's already a ghost there
    if (currentPreviewTrackType !== null) { // there is a ghost
        removeTrack(constructionProps);
    }
    // remove the preview if there is

    buildOrRemoveTrackElement(
        {
            buildLocation: nextCoords,
            ride: thisRide,
            trackType: constructionProps.typeSegmentToBuild,
            rideType: rideTypeToBuild,
            flags: constructionProps.placement === "real" ? Flags.BuildTrackReal : Flags.BuildTrackPreview
        },
        "build",
        (result => {
            debug(`Build result: ${result}`);
        }));
};


// const removeTrack = (constructionProps: ConstructionProps) => { // same general args as trackplace, but needs a "sequence:0"


}

// const clearPreviewTrack()

type TrackPlaceBuildProps = {
    buildLocation: CoordsXYZD,
    ride: number, // will log an error if you specify a ride # that doesn't exist
    trackType: TrackElementType, // e.g. TrackElementType.LeftBankedDown25ToDown25
    rideType: RideType,
    brakeSpeed?: number,
    colour?: number,
    seatRotation?: number | null,
    trackPlaceFlags?: number, // the ghost flag is 104
    isFromTrackDesign?: boolean, // default is false
    flags?: typeof Flags
}

type TrackRemoveBuildProps = {
    buildLocation: CoordsXYZD,
    trackType: TrackElementType,
    sequence: number, // not really sure what this is
    flags: typeof Flags
}

export class SegmentBuilder {

    private _buildProps: TrackPlaceBuildProps | TrackRemoveBuildProps | null = null;
    private _previewSegment: null //
    setBuildProps(props: TrackPlaceBuildProps | TrackRemoveBuildProps | null) {
        this._buildProps = props
    }

    public placeTrackSegment() {
        if (hasBuildProps(this._buildProps)) {
            buildTrack(this._buildProps)
            return true;
        }
        return false
    }

    public removeTrackSegment() {
        if (hasRemoveProps(this._buildProps)) {
            removeTrack(this._buildProps);
            return true;
        }
        return false;
    }

    public buildFollowingSegment() {
        // see if there is a preview segment and delete it if there is one there

        // build the
    }

    //helper that they both use which executes the gameAction
    executeBuildAction() { }

    private buildTrack = (args: TrackPlaceBuildProps) => {
        executeBuild(args, "trackplace");
    }

    private removeTrack = (args: TrackRemoveBuildProps) => {
        executeBuild(args, "trackremove");
    }
}

type SegmentConstructionAction = "trackplace" | "trackremove";



const buildTrack = (args: TrackPlaceBuildProps) => {
    executeBuild(args, "trackplace", (res) => debug(`trackremove status: ${res}`));
}

const removeTrack = (args: TrackRemoveBuildProps) => {
    executeBuild(args, "trackremove", (res) => debug(`trackremove status: ${res}`));
}

const executeBuild = (args: TrackPlaceBuildProps | TrackRemoveBuildProps, action: SegmentConstructionAction, callback?: (result: GameActionResult) => void): void => {
    const { buildLocation, ...otherProps } = args;
    const finalArgs = {
        ...buildLocation, // extrapolate out the coordsXYZD into component parts
        ...otherProps
    }
    context.executeAction(action, finalArgs, (result) => {
        logActionError(result, action);
        if (callback) callback(result);
    });
}

const logActionError = (result: GameActionResult, action: SegmentConstructionAction) => {
    if (result.error) {
        debug(`Error with action ${action} at ${result.position}:
        Title: ${result.errorTitle}
        Message: ${result.errorMessage}`)
    }
}

const hasBuildProps = (tbd: TrackPlaceBuildProps | TrackRemoveBuildProps | null): tbd is TrackPlaceBuildProps => {
    if ((tbd as TrackPlaceBuildProps).ride) {
        return true
    }
    return false
}

const hasRemoveProps = (tbd: TrackPlaceBuildProps | TrackRemoveBuildProps | null): tbd is TrackRemoveBuildProps => {
    if ((tbd as TrackRemoveBuildProps).sequence) {
        return true
    }
    return false
}
