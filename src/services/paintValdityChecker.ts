import { RideTrain } from '../objects/rideTrain';
import * as Log from "../utilities/logger";
import { SegmentPaintProps } from './trainWatcher';
import { getTrackIteratorAtLocation } from './segmentLocator';
import { ParkRide } from '../objects/parkRide';
import { PaintProps, PaintMode } from '../objects/PaintPropsObj';

const lazyTrackProgressAmount = 10;

export class PaintValidityChecker {
    private paintProps: PaintProps;
    private train: RideTrain;
    private firstCarProgress: number = -1;
    private lastCarProgress: number = -1;
    private paintMode: PaintMode;
    private firstCarLocation!: CoordsXYZD;
    private lastCarLocation!: CoordsXYZD;
    /**
     * An array of segments which qualify for painting this tick, based on the param's paintStart, paintEnd, and train's loction.
     * This will have up to two SegmentPaintProps, one corresponding to the startPaint value and one for the endPaint value.
     * This gets set upon construction should be called directly in chain.
     */
    segmentsToPaint: SegmentPaintProps[] = [];

    constructor(params: { paintProps: PaintProps, train: RideTrain }) {
        this.paintProps = params.paintProps;
        this.train = params.train;
        this.paintMode = this.paintProps.mode;

        // check where the first and last cars are to determine if we should paint anything
        this.calculateCarLocationAndProgress();
        // if no cars are in the threshold, return
        if (!this.shouldComputeRepaint()) return;

        // if we're in train mode, compute the segments to paint
        if (this.paintMode === "train") {
            this.computeTrainPaintSegments();
        }


    }

    private shouldComputeRepaint(): boolean {
        if (this.paintMode === "train") {
            // consider the paintStart prop
            // regardless of value, it depends on the first car's progress
            if (this.firstCarProgress < lazyTrackProgressAmount) {
                Log.debug(`Painting first car!`);
                return true;
            }
            // consider the paintEnd prop
            // if paintEnd is "afterLastCar" and the progress of the last car < carProgress threshold, return true
            if (this.paintProps.trainModeProps.paintEnd === "afterLastCar" && this.lastCarProgress < lazyTrackProgressAmount) {
                Log.debug(`Painting last car!`);
                return true;
            }
            Log.debug(`Neither car is in threshold`);
            return false;
        }
        // todo implement for Tail mode
        Log.debug(`Not painting because paint mode is not train.`);
        return false;
    }

    private calculateCarLocationAndProgress(): void {
        // get the progress of the first car
        const firstCar = this.train.vehicles()[0];
        if (!firstCar) {
            Log.debug(`First car not found on ${this.paintProps.ride[0].ride().name}`);
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

    }

    private computeTrainPaintSegments(): void {
        // i think the easiest way might be switching through the combinations of start and end paint modes?
        const { paintStart, paintEnd } = this.paintProps.trainModeProps;
        const segmentsToPaint: TrackSegmentProps[] = [];

        Log.debug(`Paint start: ${paintStart}, paint end: ${paintEnd}.`);

        if (paintStart == "withFirstCar" && this.firstCarProgress < lazyTrackProgressAmount) {
            // then it will at least paint the segment under the first car
            Log.debug(`Looking for segment under first car.`);
            const segmentUnderFirstCar = this.getSegmentsFromCarLocation({
                carLocation: this.firstCarLocation,
                numberOfSegments: 1,
            })[0];
            segmentsToPaint.push(segmentUnderFirstCar);

            // if paintEnd is "afterLastCar" and the progress of the last car < carProgress threshold, then paint the segment after the last car
            if (paintEnd === "afterLastCar" && this.lastCarProgress < lazyTrackProgressAmount) {
                // get the segment 1 behind the last car
                Log.debug(`Looking for segment under first car, mode "afterLastCar".`);
                const segmentAfterLastCar = this.getSegmentsFromCarLocation({
                    carLocation: this.lastCarLocation,
                    numberOfSegments: 2,
                })[1];
                segmentsToPaint.push(segmentAfterLastCar);
            }

            // if paintEnd is afterNSegments, then get the nth segment after the first car
            if (paintEnd === "afterNSegments" && this.firstCarProgress < lazyTrackProgressAmount) {
                Log.debug(`Looking for segment under first car, mode "afterNSegments".`);
                const nthSegment = this.getSegmentsFromCarLocation({
                    carLocation: this.firstCarLocation,
                    numberOfSegments: this.paintProps.trainModeProps.numberOfNSegments ?? 0,
                })[this.paintProps.trainModeProps.numberOfNSegments ?? 0];
                segmentsToPaint.push(nthSegment);
            }

            // if paintEnd is perpetual, no need to do anything
        }
    }

    private getSegmentsFromCarLocation(params: { carLocation: CoordsXYZD, numberOfSegments: number }): TrackSegmentProps[] {
        return getSegmentsFromCarLocationNonClass({
            carLocation: params.carLocation,
            ride: this.paintProps.ride[0],
            numberOfSegments: params.numberOfSegments
        })
    }
}

function getSegmentsBetweenCars(params: { car1Location: CoordsXYZD, car2Location: CoordsXYZD, ride: ParkRide }): TrackSegmentProps[] {
    // get a trackIterator at the first car location
    const trackIterator = getTrackIteratorAtLocation(params.car1Location);
    if (!trackIterator) {
        Log.debug(`Unable to get a trackIterator at ${JSON.stringify(params.car1Location)}`);
        return [];
    }

    const segments: TrackSegmentProps[] = [];
    let failsafeIterator = 0;
    // loop through until the location matches the second car's location
    while (!locationsMatch(trackIterator.position, params.car2Location) && failsafeIterator < 1000) {
        const location = trackIterator.position;
        const trackElementType = trackIterator.segment?.type;
        if (location && trackElementType) {
            segments.push({
                location: location,
                trackType: trackElementType,
            });
            const hasValidPrevious = trackIterator.previous();
            failsafeIterator++;
            if (!hasValidPrevious) {
                Log.debug(`No valid previous track to look for the segment of the last car`);
                return segments;
            }
        } else {
            Log.debug(`No track found at ${JSON.stringify(location)}`);
            return segments;
        }
    }
    // push the last car's location on since the loop stopped one before it
    // will this be problematic?
    segments.push({ location: trackIterator.position, trackType: trackIterator.segment?.type ?? 0 });
    return segments;
}

function locationsMatch(loc1: CoordsXYZD, loc2: CoordsXYZD): boolean {
    return loc1.x === loc2.x && loc1.y === loc2.y && loc1.z === loc2.z && loc1.direction === loc2.direction;
}

type TrackSegmentProps = {
    location: CoordsXYZD,
    trackType: number,
};

function getSegmentsFromCarLocationNonClass(params: { carLocation: CoordsXYZD, ride: ParkRide, numberOfSegments: number }): TrackSegmentProps[] {
    // get a trackIterator at the car location
    const trackIterator = getTrackIteratorAtLocation(params.carLocation);
    if (!trackIterator) { return []; }

    const segments: TrackSegmentProps[] = [];
    // return an array of {coordsXYZD, trackType}, using previous() to go backwards
    for (let i = 0; i < params.numberOfSegments; i++) {
        const location = trackIterator.position;
        const trackElementType = trackIterator.segment?.type;
        if (location && trackElementType) {
            segments.push({
                location: location,
                trackType: trackElementType,
            });
            const hasValidPrevious = trackIterator.previous();
            if (!hasValidPrevious) { break; }
        } else {
            Log.debug(`No track found at ${JSON.stringify(location)}`);
            break;
        }
    }
    return segments;
}
