import { BuildWindowButton } from '../buttonActions/buttonTypes';
import { SegmentModel } from '../../viewmodels/segmentModel';
import { compute, store } from "openrct2-flexui";
import { debug } from "../../utilities/logger";
import { TrackElementType } from "../../utilities/trackElementType";
import { ButtonSelectorModel } from "../../viewmodels/buttonSelectorModel";

import * as button from '../buttonActions/buttonTypeChecks';

export const shouldThisBeDisabled = (options:
    {
        buttonType: BuildWindowButton,
        segmentModel: SegmentModel,
        buttonSelectorModel: ButtonSelectorModel
    }) => {
    const { buttonType, segmentModel: model, buttonSelectorModel: buttonModel } = options;

    // if (button.isBankButton(buttonType) || button.isCurveButton(buttonType) || button.isPitchButton(buttonType)) {

    // }

    // const thisCalculation = compute(model.buildableTrackTypesByRideType, elements => {
    //     // I don't yet know how this store is going to work
    //     // I think that it will store the entire list of track types
    //     // and then i should go through the button map and see which ones are possible given the current selection

    //     /**
    //      * There are a couple factors that would disable a button.
    //      * * if it's not a valid option based on the current selection
    //      * * when any of curve/bank/pitch change, it impacts the rest
    //      * *
    //      * */
    //     if (elements)

    // })
    // const validElementsForThisRide = model.buildableTrackTypes

    return false;
};
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
    "bankRightDown25";

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
    "beginBankRightUp25";

