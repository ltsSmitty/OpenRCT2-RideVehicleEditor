import * as log from "../utilities/logger";


const pickerToolId = "ti-pick-xy";


/**
 * Starts a tool that allows the user to click on a vehicle to select it.
 */
export function toggleXYZPicker(isPressed: boolean, onPick: (coords: CoordsXYZ) => void, onCancel: () => void): void {
    if (isPressed) {
        ui.activateTool({
            id: pickerToolId,
            cursor: "cross_hair",
            onDown: args => {
                // The picker will choose coords
                const coords = args.mapCoords; // the tool's selected coords
                log.debug(JSON.stringify(args));
                if (coords) {
                    onPick(<CoordsXYZ>coords);
                    ui.tool?.cancel();
                }
            },
            onFinish: onCancel
        });
    }
    else {
        const tool = ui.tool;
        if (tool && tool.id === pickerToolId) {
            tool.cancel();
        }
    }
}
