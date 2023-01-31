import { GlobalStateController } from './../../objects/GlobalConstructionController';

import * as actions from "../actions";

const simulateRide = (model: GlobalStateController, activate: boolean) => {
    const thisRide = model.selectedSegment.get()?.get().ride;
    return actions.simulateRide(thisRide || 0, activate);
}

export default simulateRide;
