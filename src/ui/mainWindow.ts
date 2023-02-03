import { CheckboxParams, compute, dropdown, FlexiblePosition, groupbox, horizontal, listview, LabelParams, toggle, WidgetCreator, window } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { combinedLabelCheckbox } from "./utilityControls";
import { RideViewModel } from "../viewmodels/rideViewModel";
import { toggleRidePicker } from "../services/ridePicker";

const buttonSize = 24;
const controlsLabelWidth = 201;

let title = `Wet Paint (v${pluginVersion})`;
if (isDevelopment) {
	title += " [DEBUG]";
}


export const mainWindow = (model: RideViewModel) => window({
	title,
	width: 250,
	height: 201,
	spacing: 5,
	onOpen: () => model.open(),
	content: [
		groupbox({
			text: `Select a ride`,
			content: [
				horizontal([
					dropdown({ // ride list
						items: compute(model.rides, c => c.map(r => r.ride().name)),
						// width: "80%",
						tooltip: "List of rides in the park",
						disabledMessage: "No rides in this park",
						autoDisable: "empty",
						selectedIndex: compute(model.selectedRide, r => r ? r[1] : 0),
						onChange: i => model.selectedRide.set([model.rides.get()[i], i]),
					}),
					toggle({
						width: buttonSize, height: buttonSize,
						tooltip: "Use the picker to select a vehicle by clicking it",
						image: 29467, // SPR_G2_EYEDROPPER
						border: true,
						isPressed: model.isPicking,
						disabled: compute(model.rides, r => r.length === 0),
						onChange: p => toggleRidePicker(p, pickerResult => model.select(pickerResult), () => model.isPicking.set(false))
					}),
				])
			]
		}),
		labelCheckbox({
			text: `Enable colour matching`,
			isChecked: model.enableColourMatching,
			onChange: c => model.enableColourMatching.set(c),
		}),
		// * this feature hasn't been developed yet.
		// labelCheckbox({
		// 	text: `Reset colour after departure`,
		// 	isChecked: model.enableColourReset,
		// 	onChange: c => model.enableColourReset.set(c),
		// }),
		listview({
			items: compute(model.ridesToPaint, r => r.map(r => [`${r.ride.ride().name}`])),
			columns: [{ header: "Rides with Painting Enabled" }],
			height: 90,
		}),
		// label({ // credits
		// 	height: 11,
		// 	padding: [0, 20], // do not cover the resize corner
		// 	text: "github.com/Basssiiie/OpenRCT2-RideVehicleEditor",
		// 	tooltip: "Go to this URL to check for the latest updates",
		// 	alignment: "centred",
		// 	disabled: true
		// })
	]
});

function labelCheckbox(params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition> {
	return combinedLabelCheckbox(controlsLabelWidth, params);
}
