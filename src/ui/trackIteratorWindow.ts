import { SegmentSelector } from './../objects/segmentSelector';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayStore, button, compute, dropdown, listview, SpinnerWrapMode, store, toggle, window } from "openrct2-flexui";
import { toggleXYZPicker } from "../services/segmentPicker";
import { isDevelopment, pluginVersion } from "../environment";
import { TrackElementType } from "../utilities/trackElementType";
import { debug } from "../utilities/logger";
import { buildTrackElement, buildFollowingSegment } from "../services/rideBuilder";
import { getBuildableSegments } from "../services/segmentValidator";
import { TileElementItem, TrackElementItem } from '../services/SegmentController';

import { SegmentModel } from '../viewmodels/segmentModel';

const buttonSize = 24;
// const controlsWidth = 244;
// const controlsLabelWidth = 82;
// const controlsSpinnerWidth = 146; // controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
// const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

const isPicking = store<boolean>(false);

// const sC = new SegmentController();

const onNext = (result: boolean) => {
	debug(`Iterated to next segment:`)
	debug(`${segment.getSegmentInfo()?.position}`)
};
const onPrevious = (result: boolean) => {
	debug(`onPrevious callback: ${result}`);
};

const buildableSegments = arrayStore<TrackElementType>();
const segmentToBuild = store<TrackElementType | null>(null);
const segment = new SegmentSelector(onNext, onPrevious);
const segmentPositionStore = segment.positionStore;

segmentToBuild.subscribe((newSegment) => {
	debug(`segmentInfo upon trying to build preview: \n${JSON.stringify(segment.getSegmentInfo())}`)
	if (segment.getSegmentInfo() && newSegment !== null) {
		buildFollowingSegment(segment.getSegmentInfo(), newSegment, "preview");
	}
})

type SegmentItem = {
	ride: number,
	rideType: number,
	segmentType: string,
	hasChainLift: boolean,
	coords: CoordsXYZD | null,
	nextCoords: CoordsXYZD | null,
	prevCoords: CoordsXYZD | null
};
const segmentMap: SegmentItem[] = [];

// selectedSegment.subscribe((newVal) => {
// 	if (newVal) {
// 		debug(`new val in selected track. ${JSON.stringify(newVal.coords)}, ${newVal.index}.`);
// 		const newTI = map.getTrackIterator({ x: newVal.coords.x, y: newVal.coords.y }, newVal.index);
// 		debug(`new TI gotten`);
// 		selectedIterator.set(newTI);
// 		clearStationMapData();
// 		nextTrackCoords.set(selectedIterator.get()?.nextPosition || null);
// 		prevTrackCoords.set(selectedIterator.get()?.previousPosition || null)
segmentPositionStore.subscribe(newPosition => {
	debug(`segment store updated`);
	if (!segment.getSegmentInfo()?.position) {
		debug(`no segment selected`);
		return;
	}
	debug(`seg: ${JSON.stringify(segment.getSegmentInfo())}`)
	const segInfo = segment.getSegmentInfo();

	if (!segInfo) {
		debug(`no segment info able to be gotten`);
		return;
	}
	buildableSegments.set(getBuildableSegments(segInfo.segment.type));

	if (buildableSegments.get().length > 0) {
		debug(`setting segmentToBuild to 0th option`);
		segmentToBuild.set(buildableSegments.get()[0]);
	}
})

// 	}
// 	else selectedIterator.set(null);
// });

// selectedIterator.subscribe((newTIVal) => {
// 	debug(`iter: ${JSON.stringify(newTIVal ? newTIVal.position : null)}`);
// 	nextTrackCoords.set((newTIVal ? newTIVal.nextPosition : null));
// 	prevTrackCoords.set((newTIVal ? newTIVal.previousPosition : null));
// })




const trackElementsOnSelectedTile = arrayStore<TrackElementItem>();

let title = `Track iterator (v${pluginVersion})`;
if (isDevelopment) {
	title += " [DEBUG]";
}

export const trackIteratorWindow = window({
	title,
	width: 500, minWidth: 465, maxWidth: 560,
	height: 401,
	spacing: 5,
	// onOpen: () => model.open(),
	// onUpdate: () => model.update(),
	// onClose: () => rideWindow.close(),
	content: [
		toggle({
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
		dropdown({
			items: compute(trackElementsOnSelectedTile, (elements) => elements.map(e => `Ride: ${e.element.ride}, height: ${e.element.baseHeight}, i: ${e.index}`)),
			onChange: (selectedIndex) => { segment.setSegment(trackElementsOnSelectedTile.get()[selectedIndex]); },
			selectedIndex: compute(buildableSegments, segments => segments.indexOf(segmentToBuild.get() || 0))
		}),

		listview({
			items: compute(segmentPositionStore, newPosition => {
				if (!segment.getSegmentInfo()) return ["No track iterator selected"];

				const segInfo = segment.getSegmentInfo();
				if (!segInfo) return ["No segment selected"];
				return [
					`Ride: ${segInfo.ride}`,
					`Ride type: ${map.getRide(segInfo.ride || 0).type}`,
					`Track element type:  ${getTrackElementTypeName(segInfo.segment.type)}`,
					`Next Position:  (${segInfo.nextPosition.x}, ${segInfo.nextPosition?.y}, ${segInfo.nextPosition?.z}), dir ${segInfo.nextPosition.direction}`,
					`Previous Position: (${(segInfo.previousPosition?.x)}, ${segInfo.previousPosition?.y}, ${segInfo.previousPosition?.z}), dir ${segInfo.nextPosition.direction}`,

				];
			})
		}),
		dropdown({
			disabled: compute(buildableSegments, segments => { return segments ? false : true; }),
			items: compute(buildableSegments, segments => {
				const allSegments = segments.map(seg => TrackElementType[seg])
				return allSegments;
			}),
			onChange: (index) => {
				debug(`Segment selection dropdown changed.`);
				segmentToBuild.set(buildableSegments.get()[index]);
				if (segmentToBuild.get())
					debug(`Segment to build changed to ${TrackElementType[segmentToBuild.get()!]}`)
			}
		}),
		listview({
			items: compute(segmentToBuild, segment => {
				if (!segment) return ["No segment selected"];
				return [`${JSON.stringify(context.getTrackSegment(segment))}`]
				// const segDetails = context.getTrackSegment(segment)
				// // const detailMap = Object.keys(segDetails || {}).map((key) => { return (segDetails ? `${key}: ${segDetails[key]}` : "") })
				// debug(`detailMap: ${detailMap}`)
				// return [...detailMap];
			})
		}),
		button({
			text: "Build at next position",
			onClick: () => {
				//build a piece at the supposed next place
				const thisSegmentInfo = segment.getSegmentInfo();
				const nextCoords = thisSegmentInfo?.nextPosition;
				const thisRide = thisSegmentInfo?.ride;
				if (!thisSegmentInfo || !nextCoords || segmentToBuild.get() == null || thisRide == null) {
					debug(`error building at this position:`);
					debug(`nextCoords: ${JSON.stringify(nextCoords)}`);
					debug(`thisRide: ${JSON.stringify(thisRide)}`);
					debug(`selectedSegment: ${JSON.stringify(thisSegmentInfo?.segment)}`);
					debug(`segmentToBuild.get(): ${JSON.stringify(segmentToBuild.get())}`);
					return;
				}

				buildFollowingSegment(thisSegmentInfo, segmentToBuild.get(), "real");
				// buildTrackElement({
				// 	buildLocation: nextCoords,
				// 	ride: thisRide,
				// 	trackType: segmentToBuild.get() || 0,
				// 	rideType: map.getRide(thisRide)?.type,
				// });

				// move TI to next space
				// show next tiles that can be build
				iterateToNextSelectedTrack()
			}
		}),
		button({
			text: "Build at previous position",
			onClick: () => {
				debug(JSON.stringify(context.getTrackSegment(10)?.beginAngle))

			}
		}),
		// button({
		// 	text: "Iterate over whole track",
		// 	disabled: compute(selectedIterator, ti => ti ? false : true),
		// 	onClick: () => createSegmentMap(selectedIterator.get())
		// })

	]
});



const getTileElements = <T extends TileElement>(elementType: TileElementType, coords: CoordsXY): TileElementItem<T>[] => {
	debug(`Qureying tile for ${elementType} elements at coords (${coords.x}, ${coords.y})`);

	// have to divide the mapCoords by 32 to get the tile coords
	const selectedTile = map.getTile(coords.x / 32, coords.y / 32);

	// filter and map to elements of the given type
	const reducedELements = selectedTile.elements.reduce<TileElementItem<T>[]>((filtered, el, index) => {
		if (el.type === elementType) {
			return filtered.concat({
				element: <T>el,
				index: index,
				coords
			});
		}
		return filtered;
	}, []);

	debug(`Query returned ${reducedELements.length} elements`);
	return reducedELements;
}

/**
 * For a given coords, returns each track element and its index. Useful for getting a TrackIterator at the given coords.
 */
const getTrackElementsFromCoords = (coords: CoordsXY): TrackElementItem[] => {
	const potentialTrackElements = getTileElements<TrackElement>("track", coords);
	const trackElementsWithoutStalls = potentialTrackElements.filter(t => !isRideAStall(t.element.ride));
	return trackElementsWithoutStalls;
}

/**
 * Get the TrackElementItem for a specific ride and given XYZD.
 * This may behave unexpectedly if collision checks are off and there are multiple segments at the same XYZD.
 * In that case, it will return the 0th element.
 */
const getSpecificTrackElement = (ride: number, coords: CoordsXYZD): TrackElementItem => {
	const trackELementsOnTile = getTrackElementsFromCoords({ x: coords.x, y: coords.y });
	// make sure the ride matches this ride
	const trackForThisRide = trackELementsOnTile.filter(e => e.element.ride === ride);

	// if there are two segments for the same ride in this tile, make sure it's the proper one
	const chosenTrack = trackForThisRide.filter(t => t.element.baseZ === coords.z);
	if (chosenTrack.length > 1) console.log(`Error: There are two overlapping elements at this tile with the same XYZD. Returning the first.`);
	return chosenTrack[0];
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
	return map.getRide(rideNumber)?.classification === "stall";
};

const processTileSelected = (coords: CoordsXY): void => {

	// get a Segment[]




	// update model coords
	// selectedCoords.set(coords);
	// debug(`Selected coords are (${coords.x}, ${coords.y}`);

	// const elementsOnCoords = getTrackElementsFromCoords(coords);

	// update model trackElementsOnSelectedTile
	trackElementsOnSelectedTile.set(getTrackElementsFromCoords(coords));

	// debug(`number of trackElements found: ${trackElementsOnSelectedTile.get().length}`);
	// update model selectedSegment to 0th val to display in ListView
	// otherwise the Listview will be blank until one is selected from the dropdown
	if (trackElementsOnSelectedTile.get().length > 0) {
		segment.setSegment(trackElementsOnSelectedTile.get()[0]);

		// debug(`segment deets: ${JSON.stringify(segment.getSegmentInfo())}`)
		// const segmentCopy = <SegmentSelector>{ ...segment };
		// segmentStore.set(segmentCopy);
	}
};

const getTrackElementTypeName = (val: number): string => {
	return (TrackElementType)[val];

};

const createSegmentMap = (ti: TrackIterator | null): void => {

	if (!ti) {
		debug(`no track iterator selected`);
		return;
	}

	for (let i = 0; i < 5000; i++) {
		const completed = pushSegmentToSegmentMap(ti);
		if (completed) {
			debug(`Total track segments: ${i}`);
			break;
		}
		const nextSegment = ti.next();
		if (!nextSegment) break;
		// TODO add in after like 3k iterations to break that it couldn't find stations

	}

	// remove all the duplicate piece so that the array starts at a BeginStation
	debug(`firstStationIndex: `);
	const finalSegMap = segmentMap.slice(firstStationIndex);

	debug(`Count of station sections: ${finalSegMap.filter(segment => segment.segmentType === "BeginStation" || segment.segmentType === "MiddleStation" || segment.segmentType === "EndStation").length}`);

	debug(`Total pieces after slice: ${finalSegMap.length}`);
	finalSegMap.map((seg, i) => {
		debug(`segment ${i}: ${seg.segmentType} pointing ${seg.coords?.direction}${seg.hasChainLift ? ", \tchainlift" : ""}`);
	});
};

const stationMap: SegmentItem[] = [];

const pushSegmentToSegmentMap = (ti: TrackIterator): boolean => {

	const ride = selectedSegment.get()?.element.ride || 0;
	const rideType = map.getRide(selectedSegment.get()?.element.ride || 0).type;
	const segmentType = getTrackElementTypeName(ti.segment?.type || 0);
	const thisElement = getSpecificTrackElement(ride, ti.position);

	const thisSegment: SegmentItem = {
		ride,
		rideType,
		segmentType,
		hasChainLift: doesElementHaveChainLift(thisElement),
		coords: ti.position,
		nextCoords: ti.previousPosition,
		prevCoords: ti.nextPosition
	};

	// rather than checking if it's a complete circuit every time a segment is built,
	// only check on station pieces. This should significantly cut down on computation.
	if (segmentType === "BeginStation" || segmentType === "MiddleStation" || segmentType === "EndStation") {
		debug(`New station piece found at ${printSegmentCoords(thisSegment)}`);
		const foundAMatch = stationMap.filter((s => {
			return (
				s.coords?.direction == thisSegment.coords?.direction &&
				s.coords?.x == thisSegment.coords?.x &&
				s.coords?.y == thisSegment.coords?.y &&
				s.coords?.z == thisSegment.coords?.z
			);
		}));

		if (foundAMatch.length > 0) { // made a loop
			debug(`Loop completed at piece ${foundAMatch[0].segmentType} at ${foundAMatch[0].coords}`);
			return true;
		}
		// haven't completed the loop, so keep iterating
		if (stationMap.length === 0) { firstStationIndex = segmentMap.length; }
		stationMap.push(thisSegment);
	}

	// not a station
	debug(thisSegment.segmentType);
	segmentMap.push(thisSegment);
	return false; // haven't made a lap yet
};

const printSegmentCoords = (segment: SegmentItem) => {
	const { coords } = segment;
	return `(${coords?.x}), ${coords?.y}, ${coords?.z}, dir ${coords?.direction}. `;
};

const clearStationMapData = () => {
	segmentMap.length = 0;
	stationMap.length = 0;
};

let firstStationIndex: number;



const doesElementHaveChainLift = (trackElem: TrackElementItem) => {
	return trackElem.element.hasChainLift;

};

const iterateToNextSelectedTrack = () => {
	const iterationResult = segment.nextSegment();

	debug(`iterationResult: ${iterationResult}`);

	// // get the specific ride
	// const ride = selectedSegment.get()?.element.ride;
	// const theseTrackCoords = nextTrackCoords.get();
	// if (ride != null && theseTrackCoords) {
	// 	const nextSegment = getSpecificTrackElement(ride, theseTrackCoords)
	// 	selectedSegment.set(nextSegment)
	// 	return;
	// }
	// else {
	// 	debug(`ride: ${ride}`);
	// 	debug(`nextTrackCoords: ${JSON.stringify(theseTrackCoords)}`)
	// 	debug(`Either a ride of the next track coords are missing.`);
	// }
}



