import { CheckboxParams, compute, dropdown, FlexiblePosition, groupbox, horizontal, listview, label, spinner, LabelParams, toggle, WidgetCreator, tab, tabwindow, WindowTemplate, colourPicker, Store, Padding, button } from "openrct2-flexui";
import { isDevelopment, pluginVersion } from "../environment";
import { combinedLabelCheckbox } from "./utilityControls";
import { RideViewModel } from "../viewmodels/viewModel";
import { toggleRidePicker } from "../services/ridePicker";
import { ParkRide } from '../objects/parkRide';
import * as Log from '../utilities/logger';
import { propKeyStrings, NumberOfSetsOrColours } from "../objects/PaintPropsObj";
import { ColourSet, TrainModePropertiesObj } from "../objects/trainModeProps";
import ColourChange from "../services/ridePainter";

const buttonSize = 24;
const controlsLabelWidth = 201;

const colourSetBoxPadding: Padding = [0, "10%", 0, "20%"];

let title = `Wet Paint (v${pluginVersion})`;
if (isDevelopment) {
	title += " [DEBUG]";
}


export const mainWindow = (model: RideViewModel): WindowTemplate => {

	const isTrainTabDisabled = compute(model.painter.rideStore, model.painter.colouringEnabledStore, model.painter.modeStore,
		(ride, colouringEnabled, mode) => ride == undefined || !colouringEnabled || mode !== "train");

	const isTailTabDisabled = compute(model.painter.rideStore, model.painter.colouringEnabledStore, model.painter.modeStore,
		(ride, colouringEnabled, mode) => ride == undefined || !colouringEnabled || mode !== "tail");

	const numTrains = compute(model.painter.rideStore, (r) => (r ? r[0].trains().length : 0));
	const doesTrainExist = (trainIndex: number): Store<boolean> => compute(numTrains, (n) => (trainIndex < n));

	const isThisTrackSetDisabled = (trackIndex: number): Store<boolean> => compute(model.painter.tailModeProps.numberOfTailSets, numTailSets => numTailSets <= (trackIndex - 1));

	const isThisVehicleSetEnabled = (vehIndex: number): Store<boolean> => compute(model.painter.trainModeProps.numberVehicleSets, numVehicleSets => numVehicleSets > vehIndex);

	const paintColourScheme = (colour: number, part: keyof ColourSet["trackColours"], schemeNumber: 0 | 1 | 2 | 3): void => {
		const ride = model.painter.rideStore.get(); if (!ride) return;
		ColourChange.setRideColourAlt({
			ride: ride[0].ride(),
			colour,
			partNumber: (part == "main" ? 0 : part == "additional" ? 1 : part == "supports" ? 2 : 0),
			trainNumber: schemeNumber,
		});
	};

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
									selectedIndex: compute(model.painter.modeStore, m => m === "train" ? 0 : 1),
								})
							]
							)
						]
					}),
					listview({
						items: compute(model.ridesToPaint, r => r.map(r => [
							`${r.ride[0].ride().name}`,
							`${propKeyStrings[r.mode]}`
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
				image: 5186, //context.getIcon("link_chain"),
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
							]),
							horizontal([ // selected ride's main colour scheme display
								label({ text: `Ride main colour scheme:`, visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible") }),
								colourPicker({
									colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].main ?? 0),
									onChange: (colour) => { paintColourScheme(colour, "main", 0); },
									visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible")
								}),
								colourPicker({
									colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].additional ?? 0),
									onChange: (colour) => { paintColourScheme(colour, "additional", 0); },
									visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible")
								}),
								colourPicker({
									colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].supports ?? 0),
									onChange: (colour) => { paintColourScheme(colour, "supports", 0); },
									visibility: compute(isTrainTabDisabled, d => d ? "hidden" : "visible")
								}),
							])
						]
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps,
						trainIndex: 0,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(0), isThisVehicleSetEnabled(0), (t1, t2, t3) => (t1 || !t2 || !t3))
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps,
						trainIndex: 1,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(1), isThisVehicleSetEnabled(1), (t1, t2, t3) => t1 || !t2 || !t3)
					}),
					trainGroupbox({
						ride: model.painter.rideStore,
						trainProps: model.painter.trainModeProps,
						trainIndex: 2,
						isDisabled: compute(isTrainTabDisabled, doesTrainExist(2), isThisVehicleSetEnabled(2), (t1, t2, t3) => t1 || !t2 || !t3)
					}),
				]
			}),
			tab({ // tail mode tab
				image: 5170, //context.getIcon("link_chain"),
				spacing: 5,
				content: [
					groupbox({ // Top section
						text: `Tail Mode`,
						content: [
							label({
								padding: [0, 10],
								text: compute(model.painter.rideStore, model.painter.colouringEnabledStore, (ride, paintingEnabled) => {
									if (!paintingEnabled || model.painter.mode !== "tail") return "Enable painting & `Tail Mode` on the \nfirst tab to enable Tail Mode options.";
									return `${ride ? ride[0].ride().name : `No ride`} selected`;
								})
							}),
							horizontal([
								label({
									width: "80%",
									text: "Number of tail colour sets:",
									visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible")
								}),
								dropdown({
									width: "20%",
									visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible"),
									items: ["1", "2", "3"],
									selectedIndex: compute(model.painter.tailModeProps.numberOfTailSets, model.painter.rideStore, (numberTailSets, ride) => numberTailSets - 1),
									onChange: (i) => {
										Log.debug(`Number of vehicle sets changed to ${i + 1}.`);
										model.painter.tailModeProps.setNumberOfTailSets(i + 1 as NumberOfSetsOrColours);
									}
								})
							])
						]
					}),
					groupbox({
						text: "Colour Schemes",
						width: "100%",
						visibility: compute(isTailTabDisabled, d => d ? "none" : "visible"),
						content: [
							horizontal([
								groupbox({
									text: "Main",
									padding: colourSetBoxPadding,
									visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible"),
									content: [
										horizontal([
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].main ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "main", 0); },
												visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible")
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].additional ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "additional", 0); },
												visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible")
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[0].supports ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "supports", 0); },
												visibility: compute(isTailTabDisabled, d => d ? "hidden" : "visible")
											}),
										])

									]
								}),
								groupbox({
									text: "Tail 1",
									padding: colourSetBoxPadding,
									visibility: compute(isTailTabDisabled, d => d ? "none" : "visible"),
									content: [
										horizontal([
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[1].main ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "main", 1); },
												visibility: compute(isTailTabDisabled, d => d ? "none" : "visible")
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[1].additional ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "additional", 1); },
												visibility: compute(isTailTabDisabled, d => d ? "none" : "visible")
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[1].supports ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "supports", 1); },
												visibility: compute(isTailTabDisabled, d => d ? "none" : "visible")
											}),
										])

									]
								}),
								groupbox({
									text: "Tail 2",
									padding: colourSetBoxPadding,
									visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(2), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
									content: [
										horizontal([
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[2].main ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "main", 2); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(2), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[2].additional ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "additional", 2); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(2), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[2].supports ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "supports", 2); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(2), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
										])
									]
								}),
								groupbox({
									text: "Tail 3",
									padding: colourSetBoxPadding,
									visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(3), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
									content: [
										horizontal([
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[3].main ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "main", 3); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(3), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[3].additional ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "additional", 3); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(3), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
											colourPicker({
												colour: compute(model.painter.rideStore, (ride) => ride?.[0].ride().colourSchemes[3].supports ?? 0),
												onChange: (colour) => { paintColourScheme(colour, "supports", 3); },
												visibility: compute(isTailTabDisabled, isThisTrackSetDisabled(3), (tailTabDisabled, trackSetDisabled) => tailTabDisabled || trackSetDisabled ? "none" : "visible"),
											}),
										])
									]
								})
							])
						]
					}),
					groupbox({
						text: "Create tail pattern",
						content: [
							horizontal([
								label({ text: "Tail end" }),
								dropdown({
									items: [propKeyStrings.before, propKeyStrings.after],
									selectedIndex: compute(model.painter.rideStore, model.painter.tailModeProps.patternChoice, (ride, pattern) => pattern === "before" ? 0 : 1),
									onChange: (index) => model.painter.tailModeProps.setPatternChoice(index === 0 ? "before" : "after")
								})
							]),
							horizontal({
								height: 30,
								content: [

									button({
										text: "Main",
										onClick: () => model.painter.tailModeProps.addToPattern({ pattern: model.painter.tailModeProps.patternChoice.get(), value: 0 })
									}),
									button({
										text: "Set 1",
										onClick: () => model.painter.tailModeProps.addToPattern({ pattern: model.painter.tailModeProps.patternChoice.get(), value: 1 })
									}),
									button({
										text: "Set 2",
										onClick: () => model.painter.tailModeProps.addToPattern({ pattern: model.painter.tailModeProps.patternChoice.get(), value: 2 })
									}),
									button({
										text: "Set 3",
										onClick: () => model.painter.tailModeProps.addToPattern({ pattern: model.painter.tailModeProps.patternChoice.get(), value: 3 })
									}),
									button({
										text: "Delete",
										onClick: () => model.painter.tailModeProps.removeFromPattern({ pattern: model.painter.tailModeProps.patternChoice.get() })
									}),
								]
							}),
							horizontal({
								height: 30,
								padding: [5, 0, 0, 0],
								content: [
									label({ text: `Before:`, width: "20%" }),
									label({ text: compute(model.painter.tailModeProps.patternBefore, (pattern) => pattern.join(", ")) }),
								]
							}),
							horizontal({
								height: 30,
								content: [
									label({ text: `After:`, width: "20%" }),
									label({ text: compute(model.painter.tailModeProps.patternAfter, (pattern) => pattern.join(", ")) }),
								]
							}),
							button({
								text: "Clear patterns",
								onClick: () => {
									model.painter.tailModeProps.setPattern({ pattern: "before", values: [] });
									model.painter.tailModeProps.setPattern({ pattern: "after", values: [] });
								}

							})

						]
					})
				]
			})
		]
	});
};


function labelCheckbox(params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition> {
	return combinedLabelCheckbox(controlsLabelWidth, params);
}

function trainGroupbox({ ride, trainProps, trainIndex, isDisabled }: {
	ride: Store<[ParkRide, number] | null>,
	trainProps: TrainModePropertiesObj,
	trainIndex: 0 | 1 | 2,
	isDisabled: Store<boolean>,

}): WidgetCreator<FlexiblePosition> {

	const calculateVisiblity = compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden");

	function updateTrainColour(params:
		{ trainIndex: 0 | 1 | 2, colour: number, part: keyof ColourSet["vehicleColours"] }): void {

		const { trainIndex, colour, part } = params;
		Log.debug(`Train index: ${trainIndex}, new colour: ${colour}, part: ${part}`);

		trainProps.setVehicleColour({ trainIndex, colour, part });
	}

	function updateTrackColour(params:
		{ trainIndex: 0 | 1 | 2, colour: number, part: keyof ColourSet["trackColours"] }): void {

		const { trainIndex, colour, part } = params;
		Log.debug(`Track index: ${trainIndex}, new colour: ${colour}, part: ${part}`);

		trainProps.setTrackColour({ trainIndex, colour, part });
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
						colour: compute(ride, trainProps.colourSets, trainProps.numberVehicleSets, (r, c, n) => {
							return r ? r[0].ride().vehicleColours[trainIndex].body ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, colour: c, part: "body" })
					}),
					colourPicker({ // train trim colour
						disabled: doesTrainExist(ride, trainIndex),
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						// colour: compute(ride, (r) => {
						colour: compute(ride, trainProps.colourSets, trainProps.numberVehicleSets, (r, c, n) => {
							return r ? r[0].ride().vehicleColours[trainIndex].trim ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, colour: c, part: "trim" })
					}),
					colourPicker({ // train teriary colour
						disabled: doesTrainExist(ride, trainIndex),
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						colour: compute(ride, trainProps.colourSets, trainProps.numberVehicleSets, (r, c, n) => {
							return r ? r[0].ride().vehicleColours[trainIndex].tertiary ?? 0 : 0;
						}),
						onChange: (c) => updateTrainColour({ trainIndex, colour: c, part: "tertiary" })
					}),

					label({ text: "Track colour", visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"), }),

					colourPicker({ // track main
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						disabled: doesTrainExist(ride, trainIndex),
						colour: compute(ride, trainProps.colourSets, (r, c) => {
							return r ? c[trainIndex].trackColours.main ?? 0 : 0;
						}),
						onChange: (c) => updateTrackColour({ trainIndex, colour: c, part: "main" })
					}),
					colourPicker({ // track additional
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						disabled: doesTrainExist(ride, trainIndex),
						colour: compute(ride, trainProps.colourSets, (r, c) => {
							return r ? c[trainIndex].trackColours.additional ?? 0 : 0;
						}),
						onChange: (c) => updateTrackColour({ trainIndex, colour: c, part: "additional" })
					}),
					colourPicker({ // track supports
						visibility: compute(isDisabled, (disabled) => !disabled ? "visible" : "hidden"),
						disabled: doesTrainExist(ride, trainIndex),
						colour: compute(ride, trainProps.colourSets, (r, c) => {
							return r ? c[trainIndex].trackColours.supports ?? 0 : 0;
						}),
						onChange: (c) => updateTrackColour({ trainIndex, colour: c, part: "supports" })
					}),

				]
			}),
			horizontal([ // Paint start row
				label({ text: "Paint start:", visibility: calculateVisiblity, width: 70 }),
				dropdown({
					width: 120,
					items: [propKeyStrings.withFirstCar, propKeyStrings.afterLastCar, propKeyStrings.beforeNSegments],
					visibility: calculateVisiblity,
					onChange: (i) => {
						switch (i) {
							case 0:
								trainProps.setPaintStart({ trainIndex, paintStart: "withFirstCar" });
								break;
							case 1:
								trainProps.setPaintStart({ trainIndex, paintStart: "afterLastCar" });
								break;
							case 2:
								trainProps.setPaintStart({ trainIndex, paintStart: "beforeNSegments" });
								break;
						}
					},
					selectedIndex: compute(ride, trainProps.paintStart, (r, p) => {
						return r ? (p[trainIndex] === "withFirstCar" ? 0 : p[trainIndex] === "afterLastCar" ? 1 : 2) : 0;
					})
				}),
				spinner({
					visibility: compute(calculateVisiblity, trainProps.numberOfNSegmentsBefore, trainProps.paintStart, (vis, numberOfNSegment, e) => {
						if (vis === "visible" && trainProps.paintStart.get()[trainIndex] === "beforeNSegments") {
							return "visible";
						}
						return "hidden";
					}),
					value: compute(trainProps.numberOfNSegmentsBefore, (numberOfSegs) => numberOfSegs[trainIndex]),
					minimum: -255,
					maximum: 255,
					onChange: (v) => {
						trainProps.setNumberOfNSegments({ trainIndex, numberOfNSegments: v, position: "before" });
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
						switch (i) {
							case 0:
								trainProps.setPaintEnd({ trainIndex, paintEnd: "afterFirstCar" });
								break;
							case 1:
								trainProps.setPaintEnd({ trainIndex, paintEnd: "afterLastCar" });
								break;
							case 2:
								trainProps.setPaintEnd({ trainIndex, paintEnd: "perpetual" });
								break;
							case 3:
								trainProps.setPaintEnd({ trainIndex, paintEnd: "afterNSegments" });
								break;
						}
					},
					selectedIndex: compute(ride, trainProps.paintEnd, (r, p) => {
						return r ? (p[trainIndex] === "afterFirstCar" ? 0 : p[trainIndex] === "afterLastCar" ? 1 : p[trainIndex] === "perpetual" ? 2 : 3) : 0;
					})
				}),
				spinner({
					visibility: compute(calculateVisiblity, trainProps.numberOfNSegmentsAfter, trainProps.paintEnd, (vis, numberOfNSegment, e) => {
						if (vis === "visible" && trainProps.paintEnd.get()[trainIndex] === "afterNSegments") {
							return "visible";
						}
						return "hidden";
					}),
					value: compute(trainProps.numberOfNSegmentsAfter, (numberOfSegs) => numberOfSegs[trainIndex]),
					minimum: -255,
					maximum: 255,
					onChange: (v) => {
						trainProps.setNumberOfNSegments({ trainIndex, numberOfNSegments: v, position: "after" });
					}
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

