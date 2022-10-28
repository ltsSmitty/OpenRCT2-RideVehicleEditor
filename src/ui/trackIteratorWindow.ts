/* eslint-disable @typescript-eslint/no-unused-vars */
import { arrayStore, button, compute, dropdown, listview, SpinnerWrapMode, store, toggle, window } from "openrct2-flexui";
import { toggleXYZPicker } from "../services/trackSegmentPicker";
import { isDevelopment, pluginVersion } from "../environment";
import { TrackElementType } from "../utilities/trackElementType";
import { RideType } from "../utilities/rideType";
import { debug } from "../utilities/logger";

const buttonSize = 24;
// const controlsWidth = 244;
// const controlsLabelWidth = 82;
// const controlsSpinnerWidth = 146; // controlsWidth - (controlsLabelWidth + 4 + 12); // include spacing
// const clampThenWrapMode: SpinnerWrapMode = "clampThenWrap";

type TrackElementOnTile = {
	element: TrackElement,
	index: number,
	ride: number,
	coords: CoordsXY
};

class TrackController {

	readonly selectedCoords = store<CoordsXY>({ x: 0, y: 0 });

	readonly trackElementsOnSelectedTile = arrayStore<TrackElementOnTile>();
	/**
	 * A specific track element (a single-tile track piece like brakes, or a single tile's worth of a multi-element piece like a turn or loop)
	 */
	readonly selectedTrack = store<TrackElementOnTile>();

	readonly selectedIterator = store<TrackIterator | null>(null);

	nextTrackCoords: CoordsXYZD | null = null;
	prevTrackCoords: CoordsXYZD | null = null;

	constructor() {
		// TODO somethign in here
		debug(`in constructor`);
	}

	/**
	 * For a given coords, returns each track element and its index. Useful for getting a TrackIterator at the given coords.
	 */
	private getTrackElementsFromCoords = (coords: CoordsXY): TrackElementOnTile[] => {
		// have to divide the coords by 32 to get the tile coords
		debug(`trying to get the selected tile`);
		const selectedTile = map.getTile(coords.x / 32, coords.y / 32);
		const reducedTrackElements = selectedTile.elements.reduce<TrackElementOnTile[]>((filtered, el, index) => {
			if (el.type === "track" && !isRideAStall(el.ride)) {
				return filtered.concat({
					element: el,
					index: index,
					ride: el.ride,
					coords
				});
			}
			return filtered;
		}, []);
		return reducedTrackElements;
	};

}

const isPicking = store<boolean>(false);
const selectedCoords = store<CoordsXY>({ x: 0, y: 0 });
/**
 * A specific track element (a single-tile track piece like brakes, or a single tile's worth of a multi-element piece like a turn or loop)
 */
const selectedTrack = store<TrackElementOnTile>();
let nextTrackCoords: CoordsXYZD | null = null;
let prevTrackCoords: CoordsXYZD | null = null;
const selectedIterator = store<TrackIterator | null>(null);

selectedTrack.subscribe((newVal) => {
	if (newVal) {
		debug(`new val in selected track. ${JSON.stringify(newVal.coords)}, ${newVal.index}.`);
		const newTI = map.getTrackIterator({ x: newVal.coords.x, y: newVal.coords.y }, newVal.index);
		debug(`new TI gotten`);
		selectedIterator.set(newTI);
	}
	else selectedIterator.set(null);
});




const trackElementsOnSelectedTile = arrayStore<TrackElementOnTile>();

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
			tooltip: "Use the picker to select a vehicle by clicking it",
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
			onChange: (selectedIndex) => { selectedTrack.set(trackElementsOnSelectedTile.get()[selectedIndex]); }
		}),
		listview({
			items: compute(selectedIterator, iter => {
				if (!iter) return ["No track iterator selected"];

				debug(`iter: ${JSON.stringify(iter.position)}`);
				nextTrackCoords = (iter.nextPosition);
				prevTrackCoords = (iter.previousPosition);

				const seg = iter.segment;
				if (!seg) return ["No segment selected"];
				return [
					// `This ride: ${getTrackElementType(seg.type)}`,
					`Ride: ${selectedTrack.get()?.ride}`,
					`Ride type: ${map.getRide(selectedTrack.get()?.ride || 0).type}`,
					`Ride type: ${map.getRide(0)?.type}`,
					`Track element type:  ${getTrackElementType(seg.type)}`,
					`Next Position:  (${(iter.nextPosition?.x)}, ${iter.nextPosition?.y}, ${iter.nextPosition?.z}), dir ${iter.segment.endDirection}`,
					`Previous Position: (${(iter.previousPosition?.x)}, ${iter.previousPosition?.y}, ${iter.previousPosition?.z})`,

				];
			})
		}),
		button({
			text: "Build at next position",
			onClick: () => {
				//build a piece at the supposed next place
				if (!selectedTrack.get() || !nextTrackCoords) { debug(`no track iterator selected`); return; }

				buildTrackElement({
					x: nextTrackCoords.x,
					y: nextTrackCoords.y,
					z: nextTrackCoords.z,
					direction: nextTrackCoords.direction,
					ride: selectedTrack.get()?.ride || 0,
					trackType: TrackElementType.Flat,
					rideType: RideType["Hybrid Coaster"],
				});
				//update the current trackIterator value

				// const nextTI = selectedIterator.get()?.next;
				// if (nextTI) { //selectedIterator

				// }
				// ()
				// selectedIterator.set(selectedIterator.get()?.next || null);
			}
		}),
		button({
			text: "Build at previous position",
			onClick: () => {
				//build a piece at the supposed next place
				if (!selectedTrack.get() || !prevTrackCoords) { debug(`no track iterator selected`); return; }

				buildTrackElement({
					x: prevTrackCoords.x,
					y: prevTrackCoords.y,
					z: prevTrackCoords.z,
					direction: prevTrackCoords.direction,
					ride: selectedTrack.get()?.ride || 0,
					trackType: TrackElementType.Flat,
					rideType: RideType["Hybrid Coaster"],
				});
				//update the current trackIterator value

				// const nextTI = selectedIterator.get()?.next;
				// if (nextTI) { //selectedIterator

				// }
				// ()
				// selectedIterator.set(selectedIterator.get()?.next || null);
			}
		})

	]
});

/**
 * For a given coords, returns each track element and its index. Useful for getting a TrackIterator at the given coords.
 */
const getTrackElementsFromCoords = (coords: CoordsXY): TrackElementOnTile[] => {
	// have to divide the coords by 32 to get the tile coords
	debug(`trying to get the selected tile`);
	const selectedTile = map.getTile(coords.x / 32, coords.y / 32);
	const reducedTrackElements = selectedTile.elements.reduce<TrackElementOnTile[]>((filtered, el, index) => {
		if (el.type === "track" && !isRideAStall(el.ride)) {
			return filtered.concat({
				element: el,
				index: index,
				ride: el.ride,
				coords
			});
		}
		return filtered;
	}, []);
	return reducedTrackElements;
};

/**
 * Since stalls are also considered rides, use this filter to check stall vs true ride
 * @param rideNumber  @returns true if stall, false if other kind of ride.
 */
const isRideAStall = (rideNumber: number): boolean => {
	return map.getRide(rideNumber)?.classification === "stall";
};

const processTileSelected = (coords: CoordsXY): void => {
	selectedCoords.set(coords);
	debug(`Selected coords are (${coords.x}, ${coords.y}`);
	trackElementsOnSelectedTile.set(getTrackElementsFromCoords(coords));
	if (trackElementsOnSelectedTile.get().length > 0) {
		selectedTrack.set(trackElementsOnSelectedTile.get()[0]);
	}

};

const getTrackElementType = (val: number): string => {
	return (TrackElementType)[val];

};


type TrackElementProps = {
	x: number, // not tile x, but the big x
	y: number,
	z: number,
	direction: Direction,
	ride: number, // will log an error if you specify a ride # that doesn't exist
	trackType: TrackElementType, // e.g. TrackElementType.LeftBankedDown25ToDown25
	rideType: RideType,
	brakeSpeed?: number,
	colour?: number,
	seatRotation?: number | null,
	trackPlaceFlags?: number, // the ghost flag is 104
	isFromTrackDesign?: boolean, // default is false
	flags?: number
};

const buildTrackElement = (trackProps: TrackElementProps, callback?: (result: GameActionResult) => void): void => {
	toggleRideBuildingCheats(true);
	// eslint-disable-next-line prefer-const
	let { brakeSpeed, colour, seatRotation, trackPlaceFlags, isFromTrackDesign, flags, ...mainProps } = trackProps;

	(brakeSpeed ? brakeSpeed : brakeSpeed = 0);
	(colour ? colour : colour = 0);
	(seatRotation ? seatRotation : seatRotation = 4);
	(trackPlaceFlags ? trackPlaceFlags : trackPlaceFlags = 0);
	(isFromTrackDesign ? isFromTrackDesign : isFromTrackDesign = false);
	(flags ? flags : flags = 0);

	const trackPlaceParams = {
		...mainProps,
		brakeSpeed,
		colour,
		seatRotation,
		trackPlaceFlags,
		isFromTrackDesign,
		flags
	};

	context.executeAction("trackplace", trackPlaceParams, (result) => {
		debug(`Build result: ${JSON.stringify(result)}`);
		toggleRideBuildingCheats(false);
		if (callback) callback(result);
	});

};

// TODO refactor to use gameactions for network compatability
const toggleRideBuildingCheats = (cheatsOn: boolean) => {
	// context.executeAction("setcheataction", ) // figure out what the args are
	cheats.buildInPauseMode = cheatsOn;
	cheats.allowArbitraryRideTypeChanges = cheatsOn;

};
