// use this object to get/set the location of the selected segment.
// use this location to infer the next/previous location using a TI
import * as finder from '../../services/trackElementFinder';
import { debug } from '../../utilities/logger';
import { BuildController } from './CoreInterface';

export class SegmentLocationController {

    private _location: CoordsXYZD | null = null;
    private _ride: number | null = null;
    private _TIAtThisLocation: TrackIterator | null = null;

    constructor(buildController: BuildController) {
        // constructor({ location, ride }: { location: CoordsXYZD | null, ride: number }) {
        this._location = buildController.location;
        this._ride = buildController.ride;

    }

    get location(): CoordsXYZD | null {
        return this._location;
    }

    set location(location) {
        this._location = location;
        this.updateTrackIterator();
    }

    get ride(): number | null {
        return this._ride;
    }

    set ride(ride) {
        this._ride = ride;
        this.updateTrackIterator();
    }

    get nextLocation(): CoordsXYZD | null {
        this.updateTrackIterator();
        if (this._TIAtThisLocation) {
            return this._TIAtThisLocation.nextPosition;
        }
        return null;
    }

    get previousLocation(): CoordsXYZD | null {
        this.updateTrackIterator();
        if (this._TIAtThisLocation) {
            return this._TIAtThisLocation.previousPosition;
        }
        return null;
    }

    next(): boolean {
        if (this._TIAtThisLocation) {
            // try moving next. if it succeeds, update the location
            if (this._TIAtThisLocation.next()) { // moves the TI to the next segment during the check
                this._location = this._TIAtThisLocation.position; // this `position` is now the updated next position
                debug(`Successfully moved next.`);
                return true;
            }
        }
        debug(`Move next invalid.`);
        return false;
    }

    previous(): boolean {
        if (this._TIAtThisLocation) {
            // try moving previous. if it succeeds, update the location
            if (this._TIAtThisLocation.previous()) { // moves the TI to the previous segment during the check
                this._location = this._TIAtThisLocation.position; // this `position` is now the updated previous position
                debug(`Successfully moved previous.`);
                return true;
            }
        }
        debug(`Move previous invalid.`);
        return false;
    }

    private updateTrackIterator(): void {
        // make sure the location and ride are not null
        if (this._location && this._ride !== null) {
            // if there is a TI and its position is the same as the location, don't update the TI
            if (this._TIAtThisLocation && areTwoLocationsEqual(this._location, this._TIAtThisLocation.position)) {
                // no need to update the TI
                return;
            }
            this._TIAtThisLocation = finder.getTIAtSegment({ location: this._location, ride: this._ride });
            return;
        }
        this._TIAtThisLocation = null;
    }
}

const areTwoLocationsEqual = (location1: CoordsXYZD | null, location2: CoordsXYZD | null | undefined): boolean => {
    if (location1 && location2) {
        return JSON.stringify(location1) == JSON.stringify(location2);
    }
    return false;
};


