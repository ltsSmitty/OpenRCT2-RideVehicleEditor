import { RideTrain } from '../objects/rideTrain';
import * as Log from "../utilities/logger";
import { getTrackIteratorAtLocation } from './segmentLocator';
import { ParkRide } from '../objects/parkRide';
import { PaintProps, PaintMode } from '../objects/PaintPropsObj';
import { PatternValue } from '../objects/tailModeProps';

const lazyTrackProgressAmount = 15;
const tailModeStartBeforeSegment = 0;
const tailModeEndAfterSegment = 0;

export class PaintValidityChecker {
    private paintProps: PaintProps;
    private train: RideTrain;
    private trainIndex: number;
    private firstCarProgress: number = -1;
    private secondCarProgress: number = -1;
    private lastCarProgress: number = -1;
    private paintMode: PaintMode;
    private firstCarLocation!: CoordsXYZD;
    private secondCarLocation!: CoordsXYZD;
    private lastCarLocation!: CoordsXYZD;
    /**
     * An array of segments which qualify for painting this tick, based on the param's paintStart, paintEnd, and train's location.
     * This will have up to two SegmentPaintProps, one corresponding to the startPaint value and one for the endPaint value.
     * This gets set upon construction and should be called directly in chain.
     */
    segmentsToPaint: SegmentPaintProps[] = [];

    constructor(params: { paintProps: PaintProps, train: RideTrain, trainIndex: number }) {
        this.paintProps = params.paintProps;
        this.train = params.train;
        this.trainIndex = params.trainIndex % params.paintProps.trainModeProps.numberVehicleSets.get();
        this.paintMode = this.paintProps.mode;

        // check where the first and last cars are to determine if we should paint anything
        this.calculateCarLocationAndProgress();
        // if no cars are in the threshold, return
        if (!this.shouldComputeRepaint()) return;

        // if we're in train mode, compute the segments to paint
        if (this.paintMode === "train") {
            this.computeTrainPaintSegments();
        }

        // if we're in tail mode, compute the segments to paint
        if (this.paintMode === "tail") {
            this.computeTailPaintSegments();
        }
    }

    private shouldComputeRepaint(): boolean {
        if (this.paintMode === "train") {
            const { paintEnd, paintStart } = this.paintProps.trainModeProps.getTrainSetInfo(this.trainIndex);
            // consider the paintStart prop
            if (paintStart == "withFirstCar" || paintEnd == "afterFirstCar") {
                if (this.firstCarProgress < lazyTrackProgressAmount)
                    return true;
            }

            if (paintStart == "afterLastCar" || paintEnd == "afterLastCar") {
                if (this.lastCarProgress < lazyTrackProgressAmount)
                    return true;
            }
            if (paintStart == "beforeNSegments" || paintEnd == "afterNSegments") {
                if (this.lastCarProgress < lazyTrackProgressAmount || this.firstCarProgress < lazyTrackProgressAmount)
                    return true;
            }
            // Log.debug(`Neither first nor last car is in threshold`);
            return false;
        }

        if (this.paintMode === "tail") {
            if (this.lastCarProgress < lazyTrackProgressAmount || this.firstCarProgress < lazyTrackProgressAmount)
                return true;
        }
        // Log.debug(`Not painting because paint mode is not train.`);
        return false;
    }

    private calculateCarLocationAndProgress(): void {
        // get the progress of the first car
        const firstCar = this.train.vehicles()[0];
        if (!firstCar) {
            // Log.debug(`First car not found on ${this.paintProps.ride[0].ride().name}`);
            return;
        }
        firstCar.refresh();
        this.firstCarProgress = firstCar.car().trackProgress;
        this.firstCarLocation = firstCar.car().trackLocation;


        // get the progress of the last car
        const lastCar = this.train.vehicles()[this.train.vehicles().length - 1];
        if (!lastCar) {
            Log.debug(`Last car not found on ${this.paintProps.ride[0].ride().name}`);
            return;
        }
        lastCar.refresh();
        this.lastCarProgress = lastCar.car().trackProgress;
        this.lastCarLocation = lastCar.car().trackLocation;

        const secondCar = this.train.vehicles()[1];
        if (!secondCar) {
            // Log.debug(`Second car not found on ${this.paintProps.ride[0].ride().name}`);
            // One or zero cars, so just use the first car's location
            this.secondCarProgress = this.lastCarProgress;
            this.secondCarLocation = this.lastCarLocation;
        }
        else {
            secondCar.refresh();
            this.secondCarProgress = secondCar.car().trackProgress;
            this.secondCarLocation = secondCar.car().trackLocation;
        }
    }

    private computeTailPaintSegments(): void {
        const { patternAfter, patternBefore } = this.paintProps.tailModeProps;
        const segmentsToPaintBefore: TrackSegmentProps[] = [];
        // first build the tail of segment which should go before
        // start at the index of tailModeStartBeforeSegment: 0 is under the first car, 1 is one segment before the car
        const beforeTailSegments = this.getSegmentsNSegmentsBehindCar({
            carLocation: this.firstCarLocation,
            numberOfSegments: -1 * patternBefore.get().length, // set it negative to go in front of the car instead
            setAsMainColour: false
        });
        segmentsToPaintBefore.push(...beforeTailSegments);

        // remove tailModeStartBeforeSegment number of segments from the beginning of the array
        segmentsToPaintBefore.splice(0, tailModeStartBeforeSegment);

        // build the tail segment to go after the train: 0 is under the last car, 1 is the first segment after the car
        const segmentsToPaintAfter: TrackSegmentProps[] = [];
        const afterTailSegments = this.getSegmentsNSegmentsBehindCar({
            carLocation: this.lastCarLocation,
            numberOfSegments: patternAfter.get().length,
            setAsMainColour: false
        });
        segmentsToPaintAfter.push(...afterTailSegments);

        // remove tailModeStartAfterSegment number of segments from the end of the array
        segmentsToPaintAfter.splice(tailModeEndAfterSegment);

        // const beforeSegmentPaintProps: SegmentPaintProps[] = segmentsToPaintBefore.map(props => this.composeFinalTailPaintProps(
        //     {
        //         trackSegmentProps: props,
        //         pattern: patternBefore.get()
        //     }));

        // this.segmentsToPaint = segmentsToPaint.map((props) => this.composeFinalTrainPaintProps({ trackSegmentProps: props }));
    }

    private computeTrainPaintSegments(): void {

        const { numberOfNSegmentsBefore, numberOfNSegmentsAfter, paintEnd, paintStart } = this.paintProps.trainModeProps.getTrainSetInfo(this.trainIndex);
        const segmentsToPaint: TrackSegmentProps[] = [];


        // paintStart == "withFirstCar"
        if (paintStart == "withFirstCar") {
            // Log.debug(`Paint start is with first car. First car progress: ${this.firstCarProgress}`);
            if (this.firstCarProgress < lazyTrackProgressAmount) {
                // then it will at least paint the segment under the first car
                const trackType = getSegmentTypeAtLocation({ location: this.firstCarLocation, ride: this.paintProps.ride[0] });
                segmentsToPaint.push({ location: this.firstCarLocation, trackType: trackType ?? 0, setAsMainColour: false });
            }
        }

        // paintStart = "afterLastCar"
        if (paintStart == "afterLastCar") {
            // Log.debug(`Paint start is after last car. Last car progress: ${this.lastCarProgress}`);
            if (this.lastCarProgress < lazyTrackProgressAmount) {
                const trackType = getSegmentTypeAtLocation({ location: this.lastCarLocation, ride: this.paintProps.ride[0] });
                segmentsToPaint.push({ location: this.lastCarLocation, trackType: trackType ?? 0, setAsMainColour: false });
            }
        }

        // paintStart = "numberOfNSegmentsBefore"
        if (paintStart == "beforeNSegments") {
            // if (this.firstCarProgress < lazyTrackProgressAmount) {
            // Log.debug(`Paint start is before ${numberOfNSegmentsBefore} segments. First car progress: ${this.firstCarProgress}`);
            const segmentsBehind = this.getSegmentsNSegmentsBehindCar({
                carLocation: this.firstCarLocation,
                numberOfSegments: -1 * numberOfNSegmentsBefore, // set it negative to go in front of the car instead
                setAsMainColour: false
            });
            segmentsToPaint.push(...segmentsBehind);
            // }
        }

        // paintEnd = "afterFirstCar"
        if (paintEnd == "afterFirstCar") {
            // Log.debug(`Paint end is after first car. First car progress: ${this.firstCarProgress}`);
            if (this.secondCarProgress < lazyTrackProgressAmount) {
                const segmentsBehind = this.getSegmentsNSegmentsBehindCar({ carLocation: this.secondCarLocation, numberOfSegments: 2, setAsMainColour: true });
                segmentsBehind ? segmentsToPaint.push(...segmentsBehind) : null;
            }
        }

        // paintEnd = "afterLastCar"
        if (paintEnd == "afterLastCar") {
            // Log.debug(`Paint end is after last car. Last car progress: ${this.lastCarProgress}`);
            if (this.lastCarProgress < lazyTrackProgressAmount) {
                const trackType = getSegmentTypeAtLocation({ location: this.lastCarLocation, ride: this.paintProps.ride[0] });
                segmentsToPaint.push({ location: this.lastCarLocation, trackType: trackType ?? 0, setAsMainColour: true });
            }
        }

        // paintEnd = "afterNSegments"
        if (paintEnd == "afterNSegments") {
            // Log.debug(`Paint end is after ${numberOfNSegments} segments. First car progress: ${this.firstCarProgress}`);
            // if (this.firstCarProgress < lazyTrackProgressAmount) {
            const segmentBehind = this.getNthSegmentBehindCar({
                carLocation: this.lastCarLocation,
                numberOfSegments: numberOfNSegmentsAfter,
                setAsMainColour: true
            });
            segmentBehind ? segmentsToPaint.push(segmentBehind) : null;
            // }
        }

        // if paintEnd is perpetual, no need to do anything


        this.segmentsToPaint = segmentsToPaint.map((props) => this.composeFinalTrainPaintProps({ trackSegmentProps: props }));

    }

    composeFinalTrainPaintProps(params: { trackSegmentProps: TrackSegmentProps }): SegmentPaintProps {
        const { trackColours } = this.paintProps.trainModeProps.getTrainSetInfo(this.trainIndex);
        const { trackType, location, setAsMainColour } = params.trackSegmentProps;

        //this is which colour scheme to use
        // take the train index and mod it by the number of vehicle sets
        const initialColourScheme = this.trainIndex % this.paintProps.trainModeProps.numberVehicleSets.get();

        const finalPaintProps: SegmentPaintProps =
        {
            ride: this.paintProps.ride[0],
            segmentLocationToPaint: location,
            trackType: trackType,
            colours: trackColours,
            colourScheme: setAsMainColour ? 0 : (initialColourScheme + 1 as 0 | 1 | 2 | 3),
        };
        return finalPaintProps;
    }

    // composeFinalTailPaintProps(params: { trackSegmentProps: TrackSegmentProps, pattern: PatternValue[] }): SegmentPaintProps {
    composeFinalTailPaintProps(params: { trackSegmentProps: TrackSegmentProps, pattern: PatternValue[] }): void {
        const beforeTrackColours = this.paintProps.tailModeProps.patternBefore.get();
        const afterTrackColours = this.paintProps.tailModeProps.patternAfter.get();
    }

    // i think that the 0th segment is problematic, because it doesn't exactly match with where the train itself is.
    getSegmentsNSegmentsBehindCar(params: { carLocation: CoordsXYZD, numberOfSegments: Omit<number, 0>, setAsMainColour: boolean }): TrackSegmentProps[] {
        const { carLocation, numberOfSegments, setAsMainColour } = params;
        // get a trackIterator at the car location
        const trackIterator = getTrackIteratorAtLocation(carLocation);
        if (!trackIterator) { return []; }


        const segmentsAlongTheWay: TrackSegmentProps[] = [];

        // get the initial segment
        const trackType = trackIterator.segment?.type;
        const location = trackIterator.position;
        segmentsAlongTheWay.push({ trackType: trackType ?? 0, location, setAsMainColour });

        // then loop through the segments until we've reached the number of segments we want
        if (numberOfSegments > 0) {// use previous to iterate backwards
            for (let i = 0; i < numberOfSegments; i++) {
                if (!trackIterator.previous()) { return []; }
                const trackType = trackIterator.segment?.type;
                const location = trackIterator.position;
                segmentsAlongTheWay.push({ trackType: trackType ?? 0, location, setAsMainColour });
            }
        }
        else
            if (numberOfSegments < 0) {// actually use next to iterate forwards
                for (let i = 0; i > numberOfSegments; i--) {
                    if (!trackIterator.next()) { return []; }
                    const trackType = trackIterator.segment?.type;
                    const location = trackIterator.position;
                    segmentsAlongTheWay.push({ trackType: trackType ?? 0, location, setAsMainColour });
                }
            }
        return segmentsAlongTheWay;
    }

    // i think that the 0th segment is problematic, because it doesn't exactly match with where the train itself is.
    getNthSegmentBehindCar(params: { carLocation: CoordsXYZD, numberOfSegments: Omit<number, 0>, setAsMainColour: boolean }): TrackSegmentProps | null {
        const { carLocation, numberOfSegments, setAsMainColour } = params;
        // get a trackIterator at the car location
        const trackIterator = getTrackIteratorAtLocation(carLocation);
        if (!trackIterator) { return null; }

        if (numberOfSegments > 0) {// use previous to iterate backwards
            for (let i = 0; i < numberOfSegments; i++) {
                if (!trackIterator.previous()) { return null; }
            }
            // we've now iterated enough. grab the goods from the iterator
            const trackType = trackIterator.segment?.type;
            const location = trackIterator.position;
            return { trackType: trackType ?? 0, location, setAsMainColour };
        }
        else
            if (numberOfSegments < 0) {// actually use next to iterate forwards
                for (let i = 0; i > numberOfSegments; i--) {
                    if (!trackIterator.next()) { return null; }
                }
                // we've now iterated enough. grab the goods from the iterator
                const trackType = trackIterator.segment?.type;
                const location = trackIterator.position;
                return { trackType: trackType ?? 0, location, setAsMainColour };
            }
        return null;
    }


    // private getSegmentsFromCarLocation(params: { carLocation: CoordsXYZD, numberOfSegments: number }): TrackSegmentProps[] {
    //     const segments = getSegmentsFromCarLocationNonClass({
    //         carLocation: params.carLocation,
    //         ride: this.paintProps.ride[0],
    //         numberOfSegments: params.numberOfSegments
    //     });
    //     // console.log(`Number of segments under car location: ${segments.length}`);
    //     return segments;
    // }
}

export type SegmentPaintProps = {
    ride: ParkRide,
    segmentLocationToPaint: CoordsXYZD,
    trackType: number,
    colours: { main: number, additional: number, supports: number },
    colourScheme: 0 | 1 | 2 | 3
};

type TrackSegmentProps = {
    location: CoordsXYZD,
    trackType: number,
    setAsMainColour: boolean
};

function getSegmentTypeAtLocation(params: { location: CoordsXYZD, ride: ParkRide }): number | undefined {
    const trackIterator = getTrackIteratorAtLocation(params.location);
    if (!trackIterator) return undefined;
    // Log.debug(`Track type at location: ${trackIterator.segment?.type}`);
    return trackIterator.segment?.type;
}

// function getSegmentsFromCarLocationNonClass(params: { carLocation: CoordsXYZD, ride: ParkRide, numberOfSegments: number }): TrackSegmentProps[] {
//     // get a trackIterator at the car location
//     const trackIterator = getTrackIteratorAtLocation(params.carLocation);
//     if (!trackIterator) { return []; }

//     const segments: TrackSegmentProps[] = [];
//     // return an array of {coordsXYZD, trackType}, using previous() to go backwards
//     for (let i = 0; i < params.numberOfSegments; i++) {
//         let location = trackIterator.position;
//         if (i == 0) location = params.carLocation;
//         const trackElementType = trackIterator.segment?.type;
//         if (location && trackElementType !== undefined) {
//             segments.push({
//                 location: location,
//                 trackType: trackElementType,
//                 setAsMainColour: false
//             });
//             const hasValidPrevious = trackIterator.previous();
//             if (!hasValidPrevious) { break; }
//         } else {
//             Log.debug(`No track found at ${JSON.stringify(location)}`);
//             break;
//         }
//     }
//     return segments;
// }
