/* eslint-disable @typescript-eslint/no-unused-vars */
import { getTrackElementsFromCoords } from './../services/trackElementFinder';
import { compute, dropdown, groupbox, horizontal, listview, window } from "openrct2-flexui";
import { ElementWrapper } from '../viewmodels/elementWrapper';
import { isDevelopment, pluginVersion } from "../environment";
import { TrackElementType } from "../utilities/trackElementType";
import { debug } from "../utilities/logger";
import { SegmentModel } from '../viewmodels/segmentModel';
import selectSegment from '../services/buttonActions/selectSegment';
import { customImageFor } from '../objects/customButtonSprites';

const buttonSize = 15;
const directionButtonHeight = 25;
const buttonWidthSmall = 25
const buttonWidthMedium = 25
// const buttonWidthLarge = 18
const directionButtonWidth = 25;
const buttonRowHeight = 30;
const windowWidth = 220;
// const controlsWidth = 244;
// const controlsLabelWidth = 82;
// const controlsSpinnerWidth = 146; // controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
// const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

let title = `Advanced Build Menu v${pluginVersion}`;
if (isDevelopment) {
	title += " [DEBUG]";
}

export const trackIteratorWindow = (segmentModel: SegmentModel, elementWrapper: ElementWrapper) => {
	const model = segmentModel;
	const element = elementWrapper;

	const getTrackElementTypeName = (val: number): string => {
		return (TrackElementType)[val];

	};

	return window({
		title,
		width: windowWidth,
		height: 500,
		spacing: 5,
		onOpen: () => {
			// clean up potential issues in case the window crashed or something
			// model.open()
			// if there's nothing already, selected, open the picker tool
			if (model.selectedSegment.get() == null) {
				// todo actually just force toggle the select toggle
				selectSegment(model, true, model.buttonsPressed);
			}
		},
		// onUpdate: () => model.update(),
		onClose: () => model.close(),
		content: [
			// turn banking and steepness
			groupbox({
				// spacing: 5,
				// padding: 2,

				text: "Direction",
				content: [

					// 7 buttons
					horizontal({
						height: buttonRowHeight,
						content: [
							element.toggle({
								buttonType: 'left1Tile',
								width: buttonWidthSmall,
								height: directionButtonHeight,
								image: 5135,// 1 tile left turn
								// onChange: (isPressed) => { debug(`hi`) }


							}),
							element.toggle({
								buttonType: "left3Tile",
								width: buttonWidthSmall,
								height: directionButtonHeight,
								image: customImageFor("mediumLeftTurn") // 3 tile left turn
							}),
							element.toggle({
								buttonType: "left5Tile",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5133 // 5 tile left turn
							}),
							element.toggle({
								buttonType: "noCurve",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5137 // straight
							}),
							element.toggle({
								buttonType: "right5Tile",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5139	// 5 tile right turn
							}),
							element.toggle({
								buttonType: "right3Tile",
								width: buttonWidthSmall,
								height: directionButtonHeight,
								image: customImageFor("mediumRightTurn") // 3 tile right turn
							}),
							element.toggle({
								buttonType: "right1Tile",
								width: buttonWidthSmall,
								height: directionButtonHeight,
								image: 5136 // 1 tile right turn
							}),
						]
					}),
					// large turns and s-bends

					horizontal({
						height: buttonRowHeight,
						content: [
							element.toggle({
								buttonType: "sBendLeft",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: customImageFor("sBendLeft"),
							}),
							element.toggle({
								buttonType: "leftLargeTurn",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5142 // large half left turn
							}),
							element.toggle({
								buttonType: "rightLargeTurn",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5143 // large half right turn
							}),
							element.toggle({
								buttonType: "sBendRight",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: customImageFor("sBendRight")
							}),
						]
					}),
					// banking
					horizontal({
						height: buttonRowHeight,
						content: [
							element.toggle({
								buttonType: "bankLeft",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5153 // left bank
							}),
							element.toggle({
								buttonType: "noBank",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5154 // no bank
							}),
							element.toggle({
								buttonType: "bankRight",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5155 // right bank
							})
						]
					}),
					// steepness
					horizontal({
						height: buttonRowHeight,
						content: [
							element.toggle({
								buttonType: "down90",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5150 // down90
							}),
							element.toggle({
								buttonType: "down60",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5144 // down60
							}),
							element.toggle({
								buttonType: "down25",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5145 // down25
							}),
							element.toggle({
								buttonType: "noPitch",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5146 // flat
							}),
							element.toggle({
								buttonType: "up25",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5147 // Up25
							}),
							element.toggle({
								buttonType: "up60",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5148 // up60
							}),
							element.toggle({
								buttonType: "up90",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5149 // up90
							}),
						]
					}),
					// keep the special dropdown for now
					// button({
					// 	padding: { top: 4 },
					// 	text: "Special...",
					// })
				],
			}),
			groupbox({
				text: "Details",
				content: [
					horizontal({
						content: [
							element.toggle({
								buttonType: "chainLift",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5163 // chain
							}),
							element.toggle({
								buttonType: "boosters",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5130 // boost
							}),
							element.toggle({
								buttonType: "camera",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5089 // camera
							}),
						]
					}),
					horizontal({
						content: [
							element.toggle({
								buttonType: "brakes",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5131 // brakes
							}),
							element.toggle({
								buttonType: "blockBrakes",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5116 // block brakes
							}),
						]
					}),
				]
			}),
			// demolish, move forward/back, select, trial run
			groupbox({
				content: [
					horizontal({
						content: [
							element.toggle({
								buttonType: "demolish",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5162 // demolish
							}),
							element.button({
								buttonType: "iteratePrevious",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5160 // iterate to previous track
							}),
							// segment tile selector tool
							element.toggle({
								buttonType: "select",
								width: directionButtonWidth,
								height: directionButtonHeight,
								tooltip: "Use the picker to select a track segment by clicking it",
								isPressed: compute(model.isPicking, (isPicking) => isPicking),
								image: 29467, // SPR_G2_EYEDROPPER
							}),
							element.button({
								buttonType: "iterateNext",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5161, // iterate to next track
							}),
							element.toggle({
								buttonType: "simulate",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 29481 // start trial run
							}),
						]
					})

				],
			}),
			// choose which segment from the selected tile
			dropdown({
				items: compute(model.trackElementsOnSelectedTile, (elements) => elements.map(e => `Ride: ${e.element.ride}, height: ${e.element.baseHeight}, i: ${TrackElementType[e.segment?.get().trackType || 0]}`)),
				onChange: (selectedIndex) => { model.selectedSegment.set(model.trackElementsOnSelectedTile.get()[selectedIndex].segment); },
				selectedIndex: compute(model.selectedSegment, segment => {
					const potentialIndexOf = model.trackElementsOnSelectedTile.get().map(tei => tei.segment).indexOf(segment);
					return (potentialIndexOf === -1 ? 0 : potentialIndexOf);
				})
			}),
			// display stats for the selected segment
			listview({
				height: 100,
				items: compute(model.selectedSegment, (segment) => {
					if (!segment) return ["No segment selected"];

					const segInfo = segment.get();
					return [
						`Ride: ${segInfo.ride}`,
						`Ride type: ${segInfo.rideType}`,
						`Track element type:  ${getTrackElementTypeName(segInfo.trackType)}`,
						`Location: ${segInfo.location.x}, ${segInfo.location.y}, ${segInfo.location.z}; ${segInfo.location.direction}`,
						``,
						`Next: ${segment.nextLocation()?.x}, ${segment.nextLocation()?.y}, ${segment.nextLocation()?.z}; ${segment.nextLocation()?.direction}`,
						`Previous: ${segment.previousLocation()?.x}, ${segment.previousLocation()?.y}, ${segment.previousLocation()?.z}; ${segment.previousLocation()?.direction}`,
					];
				})
			}),
			// choose a new buildable segment
			dropdown({
				disabled: compute(model.buildableTrackTypes, trackTypes => { return trackTypes.length > 0 ? false : true; }),
				items: compute(model.buildableTrackTypes, trackTypes => {
					const allSegments = trackTypes.map(trackType => TrackElementType[trackType]);
					return allSegments;
				}),
				onChange: (index) => {
					// todo make sure this functionality isn't exclusive because this doesn't fire upon initial segment selection
					debug(`Segment selection dropdown changed to index ${index}`);
					const newTrackType = model.buildableTrackTypes.get()[index];
					if (newTrackType !== null) {
						model.selectedBuild.set(newTrackType);
					}
				},
				selectedIndex: compute(model.selectedBuild, (selectedBuild) => {
					const potentialIndexOf = model.buildableTrackTypes.get().indexOf(selectedBuild || 0);
					return (potentialIndexOf === -1 ? 0 : potentialIndexOf);
				})

			}),
			element.button({
				text: "Build",
				buttonType: "build"
			}),
		]
	});
}
