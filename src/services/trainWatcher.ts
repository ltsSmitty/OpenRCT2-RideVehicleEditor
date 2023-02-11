import { loadAllPropsOnOpen, propStorage } from './preferenceSerializer';
import { ArrayStore, Colour } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import * as Log from "../utilities/logger";
import { getTrackElementFromCoords } from "./ridePicker";
import ColourChange from "./ridePainter";
import { getTrackIteratorAtLocation } from './segmentLocator';
import { PaintValidityChecker } from './paintValdityChecker';
import { PaintProps } from '../objects/PaintPropsObj';

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

                // Log.debug(`segmentsToPaint: ${JSON.stringify(segmentsToPaint.map((segment) => segment))}`);

                segmentsToPaint.forEach((segmentToPaint) => {
                    // need to get the ride, colours, and colour scheme
                    const colourIndex = index % paintProp.trainModeProps.numberVehicleSets.get();
                    Log.debug(`Painting colourIndex: ${colourIndex}`);

                    const colours = paintProp.trainModeProps.colourSets.get()[colourIndex].trackColours;
                    const colourScheme = colourIndex % 4 as 0 | 1 | 2 | 3;
                    const { location, trackType } = segmentToPaint;
                    paintSegment({
                        ride: paintProp.ride[0],
                        colours,
                        colourScheme: colourScheme,
                        segmentLocationToPaint: location,
                        trackType
                    });
                });
            });
        });

    }
}



type TrackSegmentProps = {
    location: CoordsXYZD,
    trackType: number,
};


export type SegmentPaintProps = {
    ride: ParkRide,
    segmentLocationToPaint: CoordsXYZD,
    trackType: number,
    colours: { main: number, additional: number, supports: number },
    colourScheme: 0 | 1 | 2 | 3
};

const paintSegment = (params: SegmentPaintProps): void => {
    const { ride, segmentLocationToPaint, colours, colourScheme, trackType } = params;

    ColourChange.setRideColour(ride.ride(), colours.main, colours.additional, colours.supports, -1, -1, -1, colourScheme);
    Log.debug(`successfully set ride colours`);
    ColourChange.setColourScheme({
        segmentLocation: segmentLocationToPaint,
        segmentTrackType: trackType,
        colourScheme: colourScheme,
    });
};
