import { ArrayStore, Colour } from "openrct2-flexui";
import { ParkRide } from "../objects/parkRide";
import { RidePaintPreference } from "../viewmodels/rideViewModel";
import * as Log from "../utilities/logger";
import { getTrackElementFromCoords } from "./ridePicker";
import ColourChange from "./ridePainter";

const lazyTrackProgressAmount = 10;

export class TrainWatcher {
    private _ridesToPaint: ArrayStore<RidePaintPreference>;


    constructor(ridesToPaint: ArrayStore<RidePaintPreference>) {
        this._ridesToPaint = ridesToPaint;
        context.subscribe("interval.tick", () => this.onRefresh());
    }

    onRefresh(): void {
        // Log.debug(`${this._ridesToPaint.get().length} rides to paint this tick`);
        this._ridesToPaint.get().forEach((ridePreference, idx) => {
            if (!ridePreference.values.enableColourReset &&
                !ridePreference.values.enableColourMatching) {
                this._ridesToPaint.splice(idx, 1);
                return;
            }

            const ride = ridePreference.ride;

            // Log.debug(`Ride: ${ride.ride().name}`);
            const trains = ride.trains();

            // break loop if there are no vehicles on the first train
            const firstTrain = trains[0];

            if (!firstTrain || !firstTrain.vehicles() || firstTrain.vehicles().length === 0) {
                Log.debug(`No trains found for ride ${ride.ride().name}`);
                ride.refresh();
                return;
            }

            trains.forEach((train, index) => {
                const vehicles = train.vehicles();
                // if (!vehicles || vehicles.length === 0) {
                //     Log.debug(`No vehicle found for train`);
                //     ride.refresh();
                //     train.refresh();
                //     return;
                // }
                const car = vehicles[0].car();

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
