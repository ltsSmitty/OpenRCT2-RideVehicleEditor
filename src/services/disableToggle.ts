
import { SelectionButton } from "../objects/rideToggle";
import { compute, store } from "openrct2-flexui";
import { debug } from "../utilities/logger";
import { Segment } from "../objects/segment";
import { TrackElementType } from "../utilities/trackElementType";

export const shouldThisBeDisabled = (): boolean => {
    return false
}
// export const shouldThisBeDisabled = (buttonType: SelectionButton, selectedSegment: Segment | null, buildableTrackSegents: TrackElementType[], rideType: number): boolean => {
//     debug(`determining visibility for ${buttonType}`);
//     const isThereARealNextSegment = selectedSegment?.isThereARealNextSegment("next") || false;
//     const isThereARealPreviousSegment = selectedSegment?.isThereARealNextSegment("previous") || false;


//     switch (buttonType) {
//         // never disable the select button
//         case "select": {
//             return false;
//             break;
//         }

//         // show as long as a ride is selected, regardless of what it is.
//         case "simulate":
//         case "demolish": {
//             return (selectedSegment !== null);
//         }

//         // for now disable all the bank buttons
//         case "bankLeft":
//         case "bankRight":
//         case "noBank": {
//             return true;
//             break;
//         }

//         // next & previous
//         // disable if there is no next or previous
//         case "iterateNext": {
//             return isThereARealNextSegment;
//         }
//         case "iteratePrevious": {
//             return isThereARealPreviousSegment;
//         }

//         // check if selectedSegment next
//         case "straightTrack": {
//             // 1. check if we're in the middle of the track. if so, return true
//             // 2. see how this segment ends. if its inverted, return true
//             // 3. check what kind of ride it is to get the list of possible next segments
//             // 4.

//             // selectedSegment?.
//             // buildableTrackSegents.indexOf(TrackElementType.);
//             // if (buildDirection === "next") {
//             return false;
//         }


//         default: {
//             return true;
//         }
//     }
// };

type SegmentBeginOptions =
    "flat" |
    "up25" |
    "up60" |
    "up90" |
    "down25" |
    "down60" |
    "down90" |
    "inverted" |
    "bankLeftFlat" |
    "bankRightFlat" |
    "bankLeftUp25" |
    "bankRightUp25" |
    "bankLeftDown25" |
    "bankRightDown25"

type NextBuildTypes =
    "endsFlat" |
    "endsUp25" |
    "endsUp60" |
    "endsUp90" |
    "endsDown25" |
    "endsDown60" |
    "endsDown90" |
    "endsBankLeft" |
    "endsBankRight" |
    "endsNoBank" |
    "endsInverted" |
    "beginsFlat" |
    "beginsUp25" |
    "beginsUp60" |
    "beginsUp90" |
    "beginsDown25" |
    "beginsDown60" |
    "beginsDown90" |
    "beginsBankLeft" |
    "beginsBankRight" |
    "beginsNoBank" |
    "beginsInverted" |
    "endBankLeftFlat" |
    "endBankLeftUp25" |
    "endBankLeftDown25" |
    "endBankRightFlat" |
    "endBankRightDown25" |
    "endBankRightUp25" |
    "beginBankLeftFlat" |
    "beginBankLeftUp25" |
    "beginBankLeftDown25" |
    "beginBankRightFlat" |
    "beginBankRightDown25" |
    "beginBankRightUp25"

