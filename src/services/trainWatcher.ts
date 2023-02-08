import { loadAllPropsOnOpen, propStorage } from './preferenceSerializer';
import { ArrayStore, Colour } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { PaintProps } from "../viewmodels/viewModel";
import * as Log from "../utilities/logger";
import { getTrackElementFromCoords } from "./ridePicker";
import ColourChange from "./ridePainter";

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
                const _car = vehicles[0];
                if (!_car) {
                    Log.debug(`No cars found for train ${index} on ${ride.ride().name}`);
                    ride.refresh();
                    return;
                }
                _car.refresh();
                const car = _car.car();

                if (car.trackProgress < lazyTrackProgressAmount) {
                    paintTrack({
                        ride,
                        segmentLocationToPaint: car.trackLocation,
                        colours: [car.colours.body, car.colours.trim, car.colours.tertiary],
                        colourScheme: index % 3 + 1 as 1 | 2 | 3
                    });
                }
            });
        });
    }
}

function getSegmentsFromCarLocation(params: { carLocation: CoordsXYZD, ride: ParkRide, numberOfSegments: number = 1 }) {
    // get a trackIterator at the car location
    // return an array of {coordsXYZD, trackType}, using previous() to go backwards
}




const paintTrack = ({ ride, segmentLocationToPaint, colours, colourScheme }: {
    ride: ParkRide,
    segmentLocationToPaint: CoordsXYZD,
    colours: [Colour, Colour, Colour],
    colourScheme: 0 | 1 | 2 | 3
}): void => {
    const trackType = getTrackElementFromCoords({ ride, coords: segmentLocationToPaint })?.trackType;
    if (trackType == null) { Log.debug(`No track found at ${JSON.stringify(segmentLocationToPaint)}`); return; }

    ColourChange.setRideColour(ride.ride(), colours[0], colours[1], colours[2], -1, -1, -1, colourScheme);
    ColourChange.setColourScheme({
        segmentLocation: segmentLocationToPaint,
        segmentTrackType: trackType,
        colourScheme: colourScheme,
    });
};
