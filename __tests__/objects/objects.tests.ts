// import { SegmentLocationController } from "../../src/objects/CoreControllers/LocationController";

import { buildController } from "../../src/objects/CoreControllers/CoreInterface";
import { RideController } from "../../src/objects/CoreControllers/RideController";
import { debug } from "../../src/utilities/logger";
import { expect, test } from "@jest/globals";

// test(`SegmentLocationController`, () => {

//     // const segmentLocationController = new SegmentLocationController(buildController);
//     // expect(segmentLocationController.location).toBe(null);
//     // t.is(segmentLocationController.ride, null);
//     // t.is(segmentLocationController.nextLocation, null);
//     // t.is(segmentLocationController.previousLocation, null);
//     // t.is(segmentLocationController.next(), false);
// });

test(`RideController`, () => {
    const rideController = new RideController(buildController);
    debug(`rideController.ride: ${rideController.ride}`)

    expect(rideController.ride).toBe(null);
    rideController.ride = 1;
    debug(`buildController.ride: ${buildController.ride}`)
    expect(rideController.ride).toBe(1);
    expect(buildController.ride).toBe(1);
})

