// use this object to get/set the ride # of the selected segment.
// use this location to infer the next/previous location using a TI

export class RideController {

    private _ride: number | null = null;

    constructor() {
        this.ride = null;
    }

    get ride(): number | null {
        return this._ride;
    }

    set ride(ride) {
        this._ride = ride;
    }
}

// todo validate that the ride exists
