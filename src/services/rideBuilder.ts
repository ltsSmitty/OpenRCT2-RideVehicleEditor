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

/**
 * Perform the trackplace or trackremove gameAction.
 * @param trackElementProps defines the build details (location, ride, brake speed, etc.)
 * @param action "build" or "remove"
 * @param isGhost true if the track is being built as a ghost
 */
export const performTrackActions = ({ trackProps, action, callback }: {
    trackProps: TrackElementProps,
    action: "build" | "remove",
    callback?: (result: { result: GameActionResult, actualBuildLocation: CoordsXYZD }) => void
}): void => {

    const gameActionEvent = (action === "build" ? "trackplace" : "trackremove");
    toggleRideBuildingCheats(true);

    // eslint-disable-next-line prefer-const
    let { location, trackType, brakeSpeed, colour, seatRotation, trackPlaceFlags, isFromTrackDesign, flags, ...mainProps } = trackProps;

    (brakeSpeed ? brakeSpeed : brakeSpeed = 0);
    (colour ? colour : colour = 0);
    (seatRotation ? seatRotation : seatRotation = 4);
    (trackPlaceFlags ? trackPlaceFlags : trackPlaceFlags = 0);
    (isFromTrackDesign ? isFromTrackDesign : isFromTrackDesign = false);
    // ghost flag is 104
    (flags ? flags : flags = 0);

    const gameActionParams = {
        ...location,
        ...mainProps,
        trackType: Number(trackType),
        brakeSpeed,
        colour,
        seatRotation,
        trackPlaceFlags,
        isFromTrackDesign,
        flags
    };
    debug(`Execute ${gameActionEvent} with params: ${JSON.stringify(gameActionParams)}`);
    context.executeAction(gameActionEvent, gameActionParams, (result) => {
        toggleRideBuildingCheats(false);
        if (callback) return callback({ result, actualBuildLocation: location });
    });
};


// TODOO check what the values were before toggling  and set them back to what they were so we're not turning off cheats the user wants to be on
const toggleRideBuildingCheats = (cheatsOn: boolean): void => {

    // TODO refactor to use gameactions for network compatability
    // context.executeAction("setcheataction", ) // figure out what the args are
    cheats.buildInPauseMode = cheatsOn;
    cheats.allowArbitraryRideTypeChanges = cheatsOn;

};
