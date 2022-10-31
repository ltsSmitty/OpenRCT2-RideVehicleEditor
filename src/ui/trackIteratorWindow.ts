/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayStore, button, compute, dropdown, listview, SpinnerWrapMode, store, toggle, window } from "openrct2-flexui";
import { toggleXYZPicker } from "../services/trackSegmentPicker";
import { isDevelopment, pluginVersion } from "../environment";
import { TrackElementType } from "../utilities/trackElementType";
import { debug } from "../utilities/logger";
import { buildTrackElement } from "../services/rideBuilder";
import { getBuildableSegments } from "../services/segmentValidator";

const buttonSize = 24;
// const controlsWidth = 244;
// const controlsLabelWidth = 82;
// const controlsSpinnerWidth = 146; // controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
// const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

const isPicking = store<boolean>(false);
const selectedCoords = store<CoordsXY>({ x: 0, y: 0 });
/**
 * A specific track element (a single-tile track piece like brakes, or a single tile's worth of a multi-element piece like a turn or loop)
 */
const selectedTrack = store<TrackElementItem>();

const nextTrackCoords = store<CoordsXYZD | null>(null);

const prevTrackCoords = store<CoordsXYZD | null>(null);

const selectedIterator = store<TrackIterator | null>(null);

const buildableSegments = arrayStore<TrackElementType>();

const segmentToBuild = store<TrackElementType | null>(null);

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

selectedTrack.subscribe((newVal) => {
	if (newVal) {
		debug(`new val in selected track. ${JSON.stringify(newVal.coords)}, ${newVal.index}.`);
		const newTI = map.getTrackIterator({ x: newVal.coords.x, y: newVal.coords.y }, newVal.index);
		debug(`new TI gotten`);
		selectedIterator.set(newTI);
		clearStationMapData();
		nextTrackCoords.set(selectedIterator.get()?.nextPosition || null);
		prevTrackCoords.set(selectedIterator.get()?.previousPosition || null)
		buildableSegments.set(getBuildableSegments(newVal.element.trackType));

		if (buildableSegments.get().length > 0) {
			debug(`setting segmentToBuild to 0th option`);
			segmentToBuild.set(buildableSegments.get()[0]);
		}
	}
	else selectedIterator.set(null);
});

selectedIterator.subscribe((newTIVal) => {
	debug(`iter: ${JSON.stringify(newTIVal ? newTIVal.position : null)}`);
	nextTrackCoords.set((newTIVal ? newTIVal.nextPosition : null));
	prevTrackCoords.set((newTIVal ? newTIVal.previousPosition : null));
})




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
			onChange: (selectedIndex) => { selectedTrack.set(trackElementsOnSelectedTile.get()[selectedIndex]); },
			selectedIndex: compute(buildableSegments, segments => segments.indexOf(segmentToBuild.get() || 0))
		}),

		listview({
			items: compute(selectedIterator, iter => {
				if (!iter) return ["No track iterator selected"];

				const seg = iter.segment;
				if (!seg) return ["No segment selected"];
				return [
					// `This ride: ${getTrackElementType(seg.type)}`,
					`Ride: ${selectedTrack.get()?.element.ride}`,
					`Ride type: ${map.getRide(selectedTrack.get()?.element.ride || 0).type}`,
					`Ride type: ${map.getRide(0)?.type}`,
					`Track element type:  ${getTrackElementTypeName(seg.type)}`,
					`Next Position:  (${(iter.nextPosition?.x)}, ${iter.nextPosition?.y}, ${iter.nextPosition?.z}), dir ${iter.segment.endDirection}`,
					`Previous Position: (${(iter.previousPosition?.x)}, ${iter.previousPosition?.y}, ${iter.previousPosition?.z})`,

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
				const nextCoords = nextTrackCoords.get();
				const thisRide = selectedTrack.get()?.element;
				if (!selectedTrack.get() || !nextCoords || segmentToBuild.get() == null || thisRide?.ride == null) {
					debug(`nextCoords: ${JSON.stringify(nextCoords)}`);
					debug(`thisRide: ${JSON.stringify(thisRide?.ride)}`);
					debug(`selectedTrack: ${JSON.stringify(selectedTrack.get())}`);
					debug(`segmentToBuild.get(): ${JSON.stringify(segmentToBuild.get())}`);
					return;
				}

				buildTrackElement({
					x: nextCoords.x,
					y: nextCoords.y,
					z: nextCoords.z,
					direction: nextCoords.direction,
					ride: thisRide.ride,
					trackType: segmentToBuild.get() || 0,
					rideType: thisRide.rideType,
				});

				// move TI to next space
				// show next tiles that can be build
				iterateToNextSelectedTrack()
			}
		}),
		button({
			text: "Build at previous position",
			onClick: () => {
				debug(JSON.stringify(context.getTrackSegment(10)?.beginAngle))
				// //build a piece at the supposed next place
				// const prevCoords = prevTrackCoords.get()

				// const thisRide = <number>selectedTrack.get()?.element.ride;
				// if (!selectedTrack.get() || !prevCoords || segmentToBuild.get() == null || thisRide == null) {
				// 	debug(`prevCoords: ${JSON.stringify(prevCoords)}`);
				// 	debug(`thisRide: ${JSON.stringify(thisRide)}`);
				// 	debug(`selectedTrack: ${JSON.stringify(selectedTrack.get())}`);
				// 	debug(`segmentToBuild.get(): ${JSON.stringify(segmentToBuild.get())}`);
				// 	return;
				// }
				// buildTrackElement({
				// 	x: prevCoords.x,
				// 	y: prevCoords.y,
				// 	z: prevCoords.z,
				// 	direction: prevCoords.direction,
				// 	ride: selectedTrack.get()?.element.ride || 0,
				// 	trackType: TrackElementType.Flat,
				// 	rideType: RideType["Hybrid Coaster"],
				// });
			}
		}),
		button({
			text: "Iterate over whole track",
			disabled: compute(selectedIterator, ti => ti ? false : true),
			onClick: () => createSegmentMap(selectedIterator.get())
		})

	]
});

type relativeSegment = "previousSegment" | "thisSegment" | "nextSegment";

type TileElementItem<T extends TileElement> = {
	element: T,
	index: number,
	coords: CoordsXY
}

type TrackElementItem = TileElementItem<TrackElement>;

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
	// update model coords
	selectedCoords.set(coords);
	debug(`Selected coords are (${coords.x}, ${coords.y}`);

	// update model trackElementsOnSelectedTile
	trackElementsOnSelectedTile.set(getTrackElementsFromCoords(coords));

	// update model selectedTrack to 0th val to display in ListView
	// otherwise the Listview will be blank until one is selected from the dropdown
	if (trackElementsOnSelectedTile.get().length > 0) {
		selectedTrack.set(trackElementsOnSelectedTile.get()[0]);
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

	const ride = selectedTrack.get()?.element.ride || 0;
	const rideType = map.getRide(selectedTrack.get()?.element.ride || 0).type;
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
	// get the specific ride
	const ride = selectedTrack.get()?.element.ride;
	const theseTrackCoords = nextTrackCoords.get();
	if (ride != null && theseTrackCoords) {
		const nextSegment = getSpecificTrackElement(ride, theseTrackCoords)
		selectedTrack.set(nextSegment)
		return;
	}
	else {
		debug(`ride: ${ride}`);
		debug(`nextTrackCoords: ${JSON.stringify(theseTrackCoords)}`)
		debug(`Either a ride of the next track coords are missing.`);
	}
}
