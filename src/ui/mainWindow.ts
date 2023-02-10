import { CheckboxParams, compute, dropdown, FlexiblePosition, groupbox, horizontal, listview, label, spinner, LabelParams, toggle, WidgetCreator, tab, tabwindow, WindowTemplate, colourPicker, Store } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { combinedLabelCheckbox } from "./utilityControls";
import { RideViewModel } from "../viewmodels/viewModel";
import { toggleRidePicker } from "../services/ridePicker";
import { ParkRide } from '../objects/parkRide';
import * as Log from '../utilities/logger';
import { propKeyStrings, NumberOfSetsOrColours } from "../objects/PaintPropsObj";
import { TrainModePropertiesObj, TrainModeVehicleProps } from "../objects/trainModeProps";

const buttonSize = 24;
const controlsLabelWidth = 201;

let title = `Wet Paint (v${pluginVersion})`;
if (isDevelopment) {
	title += " [DEBUG]";
}


export const mainWindow = (model: RideViewModel): WindowTemplate => {

	const isTrainTabDisabled = compute(model.painter.rideStore, model.painter.colouringEnabledStore, model.painter.modeStore, (r, c, m) => r == undefined || !c || m !== "train");

	const numTrains = compute(model.painter.rideStore, (r) => (r ? r[0].trains().length : 0));

	const doesTrainExist = (trainIndex: number): Store<boolean> => compute(numTrains, (n) => (trainIndex < n));

	const isThisVehicleSetEnabled = (vehIndex: number): Store<boolean> => compute(model.painter.trainModeProps.numberVehicleSets, numVehicleSets => numVehicleSets > vehIndex);

	const isTailTabDisabled = compute(model.painter.rideStore, model.painter.colouringEnabledStore, model.painter.modeStore, (r, c, m) => r == undefined || !c || m !== "tail");


	return tabwindow({
		title,
		width: 280,
		height: 351,
		onOpen: () => model.open(),
		tabs: [
			tab({ // ride and mode selection tab
				image: context.getIcon("view"),
				spacing: 5,
				content: [
					groupbox({ // ride selection
						text: `Ride selection`,
						content: [
							horizontal([
								dropdown({ // ride list
									items: compute(model.rides, c => c.map(r => r.ride().name)),
									// width: "80%",
									tooltip: "List of rides in the park",
									disabledMessage: "No rides in this park",
									autoDisable: "empty",
									selectedIndex: compute(model.painter.rideStore, r => r ? r[1] : 0),
									onChange: i => model.painter.ride = ([model.rides.get()[i], i]),
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
					groupbox({ // mode selection
						text: `Mode selection`,
						content: [
							labelCheckbox({
								text: `Enable colour matching`,
								isChecked: model.painter.colouringEnabledStore,
								onChange: c => model.painter.colouringEnabled = (c)
							}),
							//
							horizontal([
								label({
									text: "Colour mode:"
								}),
								dropdown({
									items: [propKeyStrings.train, propKeyStrings.tail],
									onChange: i => i === 0 ? model.painter.mode = ("train") : model.painter.mode = ("tail"),
								})
							]
							)
						]
					}),
					listview({
						items: compute(model.ridesToPaint, r => r.map(r => [
							`${r.ride[0].ride().name}`,
							// `${r.paintMode}`
						])),
						columns: [{ header: "Painting Enabled", width: "60%" }, { header: "Colour Mode" }],
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
			}),
			tab({ // train mode tab
				image: context.getIcon("link_chain"),
				spacing: 5,
				content: [
					groupbox({ // train mode
						text: `Vehicle`,
						content: [
							label({
								padding: [0, 10],

								text: compute(model.painter.rideStore, model.painter.colouringEnabledStore, (ride, paintingEnabled) => {
									if (!paintingEnabled || model.painter.mode !== "train") return "Enable painting & `Train Mode` on the \nfirst tab to enable Train Mode options.";
									return `${ride ? ride[0].ride().name : `No ride`} selected`;
								})
							}),
							horizontal([
								label({
									width: "80%",
									text: "Number of vehicle sets:",
									visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible")
								}),
								dropdown({
									width: "20%",
									visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible"),
									items: compute(numTrains, n => {
										if (n <= 1) return [propKeyStrings[1]];
										if (n == 2) return [propKeyStrings[1], propKeyStrings[2]];
										return [propKeyStrings[1], propKeyStrings[2], propKeyStrings[3]];
									}),
									selectedIndex: compute(model.painter.trainModeProps.numberVehicleSets, model.painter.rideStore, (numberVehicleSets, ride) => numberVehicleSets - 1),
									onChange: (i) => {
										Log.debug(`Number of vehicle sets changed to ${i + 1}.`);
										model.painter.trainModeProps.numberVehicleSets.set(i + 1 as NumberOfSetsOrColours);
									}
								})
							])
						]
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps.vehicleProps[0],
						vehicleProps: model.painter.trainModeProps.vehicleProps,
						trainIndex: 0,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(0), isThisVehicleSetEnabled(0), (t1, t2, t3) => (t1 || !t2 || !t3))
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps.vehicleProps[1],
						vehicleProps: model.painter.trainModeProps.vehicleProps,
						trainIndex: 1,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(1), isThisVehicleSetEnabled(1), (t1, t2, t3) => t1 || !t2 || !t3)
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps.vehicleProps[2],
						vehicleProps: model.painter.trainModeProps.vehicleProps,
						trainIndex: 2,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(2), isThisVehicleSetEnabled(2), (t1, t2, t3) => t1 || !t2 || !t3)
					}),
				]
			})
		]

	});
};

function labelCheckbox(params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition> {
	return combinedLabelCheckbox(controlsLabelWidth, params);
}

function trainGroupbox({ ride, trainProps, trainIndex, isDisabled, vehicleProps }: {
	ride: Store<[ParkRide, number] | null>,
	trainProps: TrainModeVehicleProps,
	trainIndex: number, isDisabled: Store<boolean>,
	vehicleProps: [TrainModeVehicleProps, TrainModeVehicleProps, TrainModeVehicleProps]
}): WidgetCreator<FlexiblePosition> {

	const thisColourSetStore = trainProps.colourSet;

	Log.debug(`Initialized colourSetStore for the index ${trainIndex}: ${vehicleProps[trainIndex].id}`);

	const calculateVisiblity = compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden");

	function updateTrainColour(params: { trainIndex: number, partNumber: number, newColour: number }): void {
		Log.debug(`Updated colourSetStore for the index ${trainIndex}: ${vehicleProps[trainIndex].id}`);

		Log.debug(`Updating train colour for train ${trainIndex} part ${params.partNumber} to ${params.newColour}, ${vehicleProps[trainIndex].id}`);
		const firstColourSet = vehicleProps[trainIndex].colourSet.get();
		firstColourSet.vehicleColours[params.partNumber] = params.newColour;
		vehicleProps[trainIndex].colourSet.set({ ...firstColourSet });
		// vehicleProps[params.trainIndex].colourSet.set({ ...firstColourSet });
	}

	return groupbox({ // the options for a single train
		disabled: isDisabled,
		text: `Train Set ${trainIndex + 1}`,
		visibility: calculateVisiblity,
		content: [
			horizontal({ // Train & track colour row
				content: [
					label({
						text: "Train colour",
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden")
					}),
					colourPicker({ // train main colour
						disabled: doesTrainExist(ride, trainIndex),
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						colour: compute(ride, thisColourSetStore, (r, s) => {
							Log.debug(`Vehicle ${trainIndex}'s body is ${r ? r[0].ride().vehicleColours[trainIndex].body ?? "undefined" : "undefined"}`);
							return r ? r[0].ride().vehicleColours[trainIndex].body ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, partNumber: 0, newColour: c })
					}),
					colourPicker({ // train trim colour
						disabled: doesTrainExist(ride, trainIndex),
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						colour: compute(ride, thisColourSetStore, (r, s) => {
							Log.debug(`Vehicle ${trainIndex}'s trim is ${r ? r[0].ride().vehicleColours[trainIndex].trim ?? "undefined" : "undefined"}`);
							return r ? r[0].ride().vehicleColours[trainIndex].trim ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, partNumber: 1, newColour: c })
					}),
					colourPicker({ // train teriary colour
						disabled: doesTrainExist(ride, trainIndex),
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						colour: compute(ride, thisColourSetStore, (r, s) => {
							Log.debug(`Vehicle ${trainIndex}'s tertiary is ${r ? r[0].ride().vehicleColours[trainIndex].tertiary ?? "undefined" : "undefined"}`);
							return r ? r[0].ride().vehicleColours[trainIndex].tertiary ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, partNumber: 2, newColour: c })
					}),
					label({ text: "Track colour", visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"), }),

					// colourPicker({ // track main
					// 	visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
					// 	disabled: doesTrainExist(ride, trainIndex),
					// 	colour: compute(trainModeProps, (props) => props.vehicleSetColours[trainIndex].trackColours[0]),
					// 	onChange: (c) => {
					// 		const trainProps = trainModeProps.get();
					// 		trainProps.vehicleSetColours[trainIndex].trackColours[0] = c;
					// 		trainModeProps.set({ ...trainProps });
					// 	}
					// }),
					// colourPicker({ // track additional
					// 	visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
					// 	disabled: doesTrainExist(ride, trainIndex),
					// 	colour: compute(trainModeProps, (props) => props.vehicleSetColours[trainIndex].trackColours[0]),
					// 	onChange: (c) => {
					// 		const trainProps = trainModeProps.get();
					// 		trainProps.vehicleSetColours[trainIndex].trackColours[1] = c;
					// 		trainModeProps.set({ ...trainProps });
					// 	}
					// }),
					// colourPicker({ // track supports
					// 	visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
					// 	disabled: doesTrainExist(ride, trainIndex),
					// 	colour: compute(trainModeProps, (props) => props.vehicleSetColours[trainIndex].trackColours[0]),
					// 	onChange: (c) => {
					// 		const trainProps = trainModeProps.get();
					// 		trainProps.vehicleSetColours[trainIndex].trackColours[2] = c;
					// 		trainModeProps.set({ ...trainProps });
					// 	}
					// }),

				]
			}),
			horizontal([ // Paint start row
				label({ text: "Paint start:", visibility: calculateVisiblity, width: 70 }),
				dropdown({
					width: 120,
					items: [propKeyStrings.withFirstCar, propKeyStrings.afterFirstCar],
					visibility: calculateVisiblity,
					onChange: (i) => {
						(i === 0) ? trainProps.paintStart.set("withFirstCar") : trainProps.paintStart.set("afterLastCar");
					}
				})
			]),
			horizontal([ // Paint end row
				label({ text: "Paint end:", visibility: calculateVisiblity, width: 70 }),
				dropdown({
					width: 120,
					items: [propKeyStrings.afterFirstCar, propKeyStrings.afterLastCar, propKeyStrings.perpetual, propKeyStrings.afterNSegments],
					visibility: calculateVisiblity,
					onChange: (i) => {
						const paintEnd = trainProps.paintEnd;
						switch (i) {
							case 0:
								paintEnd.set("afterFirstCar");
								break;
							case 1:
								paintEnd.set("afterLastCar");
								break;
							case 2:
								paintEnd.set("perpetual");
								break;
							case 3:
								paintEnd.set("afterNSegments");
								break;
						}
					}
				}),
				spinner({
					visibility: compute(calculateVisiblity, trainProps.paintEnd, (vis, paintEnd) => {
						if (vis === "visible" && paintEnd === "afterNSegments") {
							return "visible";
						}
						return "hidden";
					}),
					minimum: 0,
					maximum: 255,
					value: 1
					// value: compute(trainModeProps.paintEnd, (props) => props.numberVehicleSets),
					// onChange: (v) => {
					// 	// don't actually have a place to save this yet
					// }
				})
			])
		]
	});
}

function doesTrainExist(ride: Store<[ParkRide, number] | null>, trainIndex: number): Store<boolean> {
	// check if the vehicle has at least trainIndex number of vehicles
	return compute(ride, (r) => {
		// Log.debug(`doesTrainExist: ${r?.[0].trains().length} ${trainIndex} `);
		return (r ? r[0].trains().length <= trainIndex : false);
	});
}

