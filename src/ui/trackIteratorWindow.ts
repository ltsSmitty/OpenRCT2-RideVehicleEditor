import { getTrackElementsFromCoords } from './../services/trackElementFinder';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayStore, button, compute, dropdown, groupbox, horizontal, listview, SpinnerWrapMode, toggle, store, window } from "openrct2-flexui";
// import { rideBuildToggle } from '../objects/rideToggle';
import { ElementWrapper } from '../viewmodels/elementWrapper';
import { toggleXYZPicker } from "../services/segmentPicker";
import { isDevelopment, pluginVersion } from "../environment";
import { TrackElementType } from "../utilities/trackElementType";
import { debug } from "../utilities/logger";
import { TrackElementItem } from '../services/SegmentController';
import { SegmentModel } from '../viewmodels/segmentModel';

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
// const buttonModel = new ButtonSelectorModel(model);
const isPicking = store<boolean>(false);

const trackElementsOnSelectedTile = store<TrackElementItem[]>([]);
// // const sC = new SegmentController();

// const onNext = (result: boolean) => {
// 	debug(`Iterated to next segment:`)
// 	debug(`${segment.getSegmentInfo()?.position}`)
// };
// const onPrevious = (result: boolean) => {
// 	debug(`onPrevious callback: ${result}`);
// };




let title = `Advanced Build Menu v${pluginVersion}`;
if (isDevelopment) {
	title += " [DEBUG]";
}

export const trackIteratorWindow = (segmentModel: SegmentModel, elementWrapper: ElementWrapper) => {
	const model = segmentModel;
	const element = elementWrapper;

	const processTileSelected = (coords: CoordsXY): void => {
		const elementsOnCoords = getTrackElementsFromCoords(coords);
		trackElementsOnSelectedTile.set(elementsOnCoords);

		// update model selectedSegment to 0th val to display in ListView
		// otherwise the Listview will be blank until one is selected from the dropdown
		if (trackElementsOnSelectedTile.get().length > 0) {
			model.selectedSegment.set(elementsOnCoords[0].segment);
		}
	};

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
			debug(`Window opened. Is picking: ${isPicking}`);
			if (model.selectedSegment.get() == null) {
				isPicking.set(true)
				toggleXYZPicker(true,
					(coords) => processTileSelected(coords),
					() => {
						isPicking.set(false);
					})
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
								image: 5140 // 3 tile left turn
							}),
							element.toggle({
								buttonType: "left5Tile",
								width: directionButtonWidth,
								height: directionButtonHeight,
								image: 5133 // 5 tile left turn
							}),
							element.toggle({
								buttonType: "straightTrack",
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
								image: 5141 // 3 tile right turn
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
								image: 5142, // todo replace with an s-bend image
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
								image: 5143 // todo replace with an s-bend image
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
								buttonType: "flat",
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
								width: buttonSize, height: buttonSize,
								tooltip: "Use the picker to select a track segment by clicking it",
								image: 29467, // SPR_G2_EYEDROPPER
								isPressed: isPicking,
								// disabled: model.isEditDisabled,
								onChange: p => toggleXYZPicker(p,
									(coords) => processTileSelected(coords),
									() => {
										isPicking.set(false);
									})
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
			button({
				text: `${TrackElementType[model.selectedBuild.get() || 0]}`, // todo make this more friendly
				// height: 50
			}),

			// choose which segment from the selected tile
			dropdown({
				items: compute(trackElementsOnSelectedTile, (elements) => elements.map(e => `Ride: ${e.element.ride}, height: ${e.element.baseHeight}, i: ${TrackElementType[e.segment?.get().trackType || 0]}`)),
				onChange: (selectedIndex) => { model.selectedSegment.set(trackElementsOnSelectedTile.get()[selectedIndex].segment); },
				selectedIndex: compute(model.selectedSegment, segment => {
					const potentialIndexOf = trackElementsOnSelectedTile.get().map(tei => tei.segment).indexOf(segment);
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
			button({
				text: "Build",
				onClick: () => {
					model.buildSelectedFollowingPiece();
					model.moveToFollowingSegment(model.buildDirection.get());
					// buildFollowingSegment(thisSegmentInfo, segmentToBuild.get(), "real");
					// 		// buildTrackElement({
					// 		// 	buildLocation: nextCoords,
					// 		// 	ride: thisRide,
					// 		// 	trackType: segmentToBuild.get() || 0,
					// 		// 	rideType: map.getRide(thisRide)?.type,
					// 		// });

					// 		// move TI to next space
					// 		// show next tiles that can be build
					// 		iterateToNextSelectedTrack()
					// 	}
				}
			}),
			// button({
			// 	text: "Iterate over whole track",
			// 	disabled: compute(selectedIterator, ti => ti ? false : true),
			// 	onClick: () => createSegmentMap(selectedIterator.get())
			// })

		]
	});



	// const createSegmentMap = (ti: TrackIterator | null): void => {

	// 	if (!ti) {
	// 		debug(`no track iterator selected`);
	// 		return;
	// 	}

	// 	for (let i = 0; i < 5000; i++) {
	// 		const completed = pushSegmentToSegmentMap(ti);
	// 		if (completed) {
	// 			debug(`Total track segments: ${ i }`);
	// 			break;
	// 		}
	// 		const nextSegment = ti.next();
	// 		if (!nextSegment) break;
	// 		// TODO add in after like 3k iterations to break that it couldn't find stations

	// 	}

	// 	// remove all the duplicate piece so that the array starts at a BeginStation
	// 	debug(`firstStationIndex: `);
	// 	const finalSegMap = segmentMap.slice(firstStationIndex);

	// 	debug(`Count of station sections: ${ finalSegMap.filter(segment => segment.segmentType === "BeginStation" || segment.segmentType === "MiddleStation" || segment.segmentType === "EndStation").length }`);

	// 	debug(`Total pieces after slice: ${ finalSegMap.length }`);
	// 	finalSegMap.map((seg, i) => {
	// 		debug(`segment ${ i }: ${ seg.segmentType } pointing ${ seg.coords?.direction }${ seg.hasChainLift ? ", \tchainlift" : "" }`);
	// 	});
	// };

	// const stationMap: SegmentItem[] = [];

	// const pushSegmentToSegmentMap = (ti: TrackIterator): boolean => {

	// 	const ride = selectedSegment.get()?.element.ride || 0;
	// 	const rideType = map.getRide(selectedSegment.get()?.element.ride || 0).type;
	// 	const segmentType = getTrackElementTypeName(ti.segment?.type || 0);
	// 	const thisElement = getSpecificTrackElement(ride, ti.position);

	// 	const thisSegment: SegmentItem = {
	// 		ride,
	// 		rideType,
	// 		segmentType,
	// 		hasChainLift: doesElementHaveChainLift(thisElement),
	// 		coords: ti.position,
	// 		nextCoords: ti.previousPosition,
	// 		prevCoords: ti.nextPosition
	// 	};

	// 	// rather than checking if it's a complete circuit every time a segment is built,
	// 	// only check on station pieces. This should significantly cut down on computation.
	// 	if (segmentType === "BeginStation" || segmentType === "MiddleStation" || segmentType === "EndStation") {
	// 		debug(`New station piece found at ${ printSegmentCoords(thisSegment) }`);
	// 		const foundAMatch = stationMap.filter((s => {
	// 			return (
	// 				s.coords?.direction == thisSegment.coords?.direction &&
	// 				s.coords?.x == thisSegment.coords?.x &&
	// 				s.coords?.y == thisSegment.coords?.y &&
	// 				s.coords?.z == thisSegment.coords?.z
	// 			);
	// 		}));

	// 		if (foundAMatch.length > 0) { // made a loop
	// 			debug(`Loop completed at piece ${ foundAMatch[0].segmentType } at ${ foundAMatch[0].coords }`);
	// 			return true;
	// 		}
	// 		// haven't completed the loop, so keep iterating
	// 		if (stationMap.length === 0) { firstStationIndex = segmentMap.length; }
	// 		stationMap.push(thisSegment);
	// 	}

	// 	// not a station
	// 	debug(thisSegment.segmentType);
	// 	segmentMap.push(thisSegment);
	// 	return false; // haven't made a lap yet
	// };

	// const printSegmentCoords = (segment: SegmentItem) => {
	// 	const { coords } = segment;
	// 	return `(${ coords?.x }), ${ coords?.y }, ${ coords?.z }, dir ${ coords?.direction }. `;
	// };

	// const clearStationMapData = () => {
	// 	segmentMap.length = 0;
	// 	stationMap.length = 0;
	// };

	// let firstStationIndex: number;



	// const doesElementHaveChainLift = (trackElem: TrackElementItem) => {
	// 	return trackElem.element.hasChainLift;

	// };

	// const iterateToNextSelectedTrack = () => {
	// 	const iterationResult = segment.nextSegment();

	// 	debug(`iterationResult: ${ iterationResult }`);

	// 	// // get the specific ride
	// 	// const ride = selectedSegment.get()?.element.ride;
	// 	// const theseTrackCoords = nextTrackCoords.get();
	// 	// if (ride != null && theseTrackCoords) {
	// 	// 	const nextSegment = getSpecificTrackElement(ride, theseTrackCoords)
	// 	// 	selectedSegment.set(nextSegment)
	// 	// 	return;
	// 	// }
	// 	// else {
	// 	// 	debug(`ride: ${ ride }`);
	// 	// 	debug(`nextTrackCoords: ${ JSON.stringify(theseTrackCoords) }`)
	// 	// 	debug(`Either a ride of the next track coords are missing.`);
	// 	// }
	// }



}
