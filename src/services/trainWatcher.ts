import { loadAllPropsOnOpen } from './preferenceSerializer';
import { ArrayStore } from "openrct2-flexui";
import * as Log from "../utilities/logger";
import ColourChange from "./ridePainter";
import { PaintValidityChecker, SegmentPaintProps } from './paintValdityChecker';
import { PaintProps } from '../objects/PaintPropsObj';
import { getTrackElementsAt } from './segmentLocator';

const lazyTrackProgressAmount = 10;

export class TrainWatcher {
    private _ridesToPaint: ArrayStore<PaintProps>;


    constructor(ridesToPaint: ArrayStore<PaintProps>) {
        this._ridesToPaint = ridesToPaint;
        context.subscribe("interval.tick", () => this.onRefresh());
    }

    onRefresh(): void {

        // loop through all rides that need to be painted
        const ridesToPaint = this._ridesToPaint.get();
        ridesToPaint.forEach((paintProp, idx) => {
            if (!paintProp.colouringEnabled) {
                Log.debug(`splicing out index ${idx} from _ridesToPaint}`);
                this._ridesToPaint.splice(idx, 1);
                return;
            }

            const ride = paintProp.ride[0];
            ride.refresh();

            // sometimes the save can get corrupted. If that happens, refresh the ride and try again
            if (!ride?.trains) {
                Log.debug(`Save corrupted, resetting painting props.`);
                this._ridesToPaint.set(loadAllPropsOnOpen({ reset: true }));
                return;
            }
            const trains = ride.trains();

            // break loop if there are no vehicles on the first train
            const firstTrain = trains[0];

            if (!firstTrain || !firstTrain.vehicles() || firstTrain.vehicles().length === 0) {
                Log.debug(`No trains found for ride ${ride.ride().name}`);
                ride.refresh();
                return;
            }

            // loop through all trains that need to be painted
            trains.forEach((train, index) => {
                const vehicles = train.vehicles();
                if (!vehicles || vehicles.length === 0) {

                    vehicles[index].refresh;
                    ride.refresh();
                    return;
                }

                const segmentsToPaint = new PaintValidityChecker({ paintProps: paintProp, train, trainIndex: index }).segmentsToPaint;
                segmentsToPaint.forEach((segmentToPaint) => paintSegment(segmentToPaint));
            });
        });

    }
}

const paintSegment = (params: SegmentPaintProps): void => {
    const { ride, segmentLocationToPaint, colours, colourScheme, trackType } = params;

    if (colourScheme !== 0) {
        ColourChange.setRideColour(ride.ride(), colours.main, colours.additional, colours.supports, -1, -1, -1, colourScheme);
    }

    queryExecuteSetColourScheme({ location: segmentLocationToPaint, trackType: trackType, colourScheme: colourScheme });
};

function queryExecuteSetColourScheme(params: { location: CoordsXYZD, trackType: number, colourScheme: 0 | 1 | 2 | 3 }): void {
    context.queryAction("ridesetcolourscheme", { ...params.location, trackType: params.trackType, colourScheme: params.colourScheme }, (queryResults) => {
        if (queryResults.error) {
            // console.log(`Query failed: Initial args were: ${JSON.stringify(params, null, 2)}`);

            // look up what segments are actually on that x,y
            const matchingSegments = getTrackElementsAt(params.location).filter((segment) => segment.trackType === params.trackType);

            if (matchingSegments.length === 0) {
                Log.debug(`Unable to find the right segment since there are none of them at this location.`);
                return;
            }

            if (matchingSegments.length > 1) {
                Log.debug(`Unable to find the right segment since there are two of them at this location. Original z: ${params.location.z}; located ${matchingSegments.map(s => s.baseZ).join(", ")}. Returning whichever one is closer`);
                // sort matching segments by subtracting params.location.z from the baseZ of each segment
                matchingSegments.sort((a, b) => Math.abs(a.baseZ - params.location.z) - Math.abs(b.baseZ - params.location.z)); // sort in place
            }
            // Log.debug(`Found a segment that matches the right type at a corrected z of ${matchingSegments[0].baseZ} instead of ${params.location.z}.`);
            const correctedZ = matchingSegments[0].baseZ;
            params.location.z = correctedZ;

            queryExecuteSetColourScheme(params);
        }
        else context.executeAction("ridesetcolourscheme", { ...params.location, trackType: params.trackType, colourScheme: params.colourScheme }, (paintResult) => {
            // Log.debug(`Colour change result: ${JSON.stringify(paintResult, null, 2)}`);
        });
    });
}
