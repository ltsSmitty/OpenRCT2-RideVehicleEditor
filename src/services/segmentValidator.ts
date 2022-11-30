import { Segment } from "../objects/segment";
import { debug } from "../utilities/logger";
import { TrackElementType } from "../utilities/trackElementType";

/**
 * Use to compare a first and second TrackElementTypeto see if they are compatible.
 * To go in the previous direction, just swap which is first and which is second.
 */
const areSegmentsCompatible = (initialTrackElement: TrackElementType, finalTrackElement: TrackElementType): boolean => {
    const initial = context.getTrackSegment(Number(initialTrackElement));
    const final = context.getTrackSegment(Number(finalTrackElement));
    const slopesMatch = initial?.endSlope == final?.beginSlope;
    const banksMatch = initial?.endBank == final?.beginBank;
    const diagonalsMatch = trackEndsDiagonal(initialTrackElement) == trackStartsDiagonal(finalTrackElement);
    // debug(`diagonalsMatch: ${diagonalsMatch}`);
    // const turnsMatch = initial?.turnDirection == final?.turnDirection; // turns out this isn't relevant
    debug(`Checking compatability of ${TrackElementType[initialTrackElement]} into ${TrackElementType[finalTrackElement]}: ${slopesMatch && banksMatch && diagonalsMatch}`);
    return (slopesMatch && banksMatch && diagonalsMatch);
};

export const getBuildableSegments = (
    initialTrackELement: TrackElementType,
    trackElementOptions: TrackElementType[],
    direction: "next" | "previous"): TrackElementType[] => {

    debug(`getting buildable segments for ${TrackElementType[initialTrackELement]} in direction ${direction}`);

    // swap the order of elements depending on next vs previous
    if (direction == "next") {
        const buildableSegments = trackElementOptions.filter(el =>
            areSegmentsCompatible(initialTrackELement, el));
        return buildableSegments;
    }
    if (direction == "previous") {
        const buildableSegments = trackElementOptions.filter(el =>
            areSegmentsCompatible(el, initialTrackELement));
        return buildableSegments;
    }
    return [];
};

// check if the segment is alredy diagonal
// if it is, then filter the valid elements to only include diagonal elements
// otherwise filter the valid elements to only include non-diagonal elements

export const filterForDiagonalSegments: (validElements: TrackElementType[], segment: Segment) => TrackElementType[] = (validElements, segment) => {
    if (segment.get().location.direction > 3) {
        return validElements.filter(el => isTrackElementTypeDiagonal(el));
    } else {
        return validElements.filter(el => !isTrackElementTypeDiagonal(el));
    }
};

const isTrackElementTypeDiagonal = (trackElementType: TrackElementType): boolean => {
    const trackTypeName = TrackElementType[trackElementType];
    const stringStartsDiag = (trackTypeName.slice(0, 4) === "diag");
    const stringEnd9 = trackTypeName.slice(-10).toLowerCase();
    const stringEndsOrthogonal = (stringEnd9 === "orthogonal");
    // debug(`${trackTypeName} is diagonal: ${stringStartsDiag || stringEndsOrthogonal}`);
    return stringStartsDiag || stringEndsOrthogonal;
};


const trackStartsDiagonal = (trackElementType: TrackElementType): boolean => {
    const trackTypeName = TrackElementType[trackElementType];
    const stringStartsDiag = (trackTypeName.slice(0, 4) === "diag");
    // debug(`${trackTypeName} starts diagonal: ${stringStartsDiag}`);
    return stringStartsDiag;
}

const trackEndsDiagonal = (trackElementType: TrackElementType): boolean => {
    const trackTypeName = TrackElementType[trackElementType];
    const stringEndsDiag = (trackTypeName.slice(-4).toLowerCase() === "diag");
    // debug(`${trackTypeName} ends diagonal: ${stringEndsDiag}`);
    return stringEndsDiag;
}
