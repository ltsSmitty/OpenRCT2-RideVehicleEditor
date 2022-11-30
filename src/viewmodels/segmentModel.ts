import { SegmentElementPainter } from './../objects/segmentElementPainter';
import { Segment, SegmentDescriptor } from './../objects/segment';
import * as highlighter from '../services/highlightGround';
import * as builder from './builderModel';
import * as finder from '../services/trackElementFinder';
import * as storage from '../utilities/coldStorage';

import { store } from 'openrct2-flexui';
import { getSuggestedNextSegment } from '../utilities/suggestedNextSegment';

import { debug } from '../utilities/logger';
import { TrackElementType } from '../utilities/trackElementType';
import { TrackElementItem } from '../services/SegmentController';
import { RideType } from '../utilities/rideType';
import { TrackTypeSelector } from '../objects/trackTypeSelector';

const startingRideType: RideType | null = null; // Looping Coaster
const startingDirection = "next";

type NextSegmentExistsValidator = {
	exists: false | "real" | "ghost",
	element: null | TrackElementItem
};

export class SegmentModel {

	// the currently selected segment
	readonly selectedSegment = store<Segment | null>(null);
	TIAtSelectedSegment: TrackIterator | null = null;


	// the segment which will be built as a ghost or real segment
	readonly selectedBuild = store<Partial<SegmentDescriptor>>({});
	readonly buildDirection = store<"next" | "previous" | null>(null);

	// an existing ghost segment
	readonly previewSegment = store<Segment | null>(null);
	// not used yet, but for placing the first station or a snippet to start a ride at a new place
	readonly buildRotation = store<Direction | null>(null);

	// List the track elements on a selected tile. Used for dropdown selection.
	readonly trackElementsOnSelectedTile = store<TrackElementItem[]>([]);

	readonly originalRideType = store<RideType | null>(startingRideType);

	private segmentPainter = new SegmentElementPainter();
	readonly trackTypeSelector: TrackTypeSelector;

	constructor() {
		// initialize values
		this.updateSelectedBuild("rideType", startingRideType);
		this.buildDirection.set(startingDirection);
		this.trackTypeSelector = new TrackTypeSelector(this);

		// initialize event listeners
		this.selectedSegment.subscribe((seg) => this.onSegmentChange(seg));
		this.buildDirection.subscribe((dir) => this.onBuildDirectionChange(dir));
		this.buildRotation.subscribe((rotation) => this.onRotationChange(rotation));
		// this.buildableTrackByRelativeSegment.subscribe((newbuildableTrackTypesList) => this.onBuildableTrackTypesChange(newbuildableTrackTypesList));
		this.selectedBuild.subscribe((newSelectedBuild) => this.onSelectedBuildChange(newSelectedBuild));
		this.previewSegment.subscribe((newPreviewSegment) => this.onPreviewSegmentChange(newPreviewSegment));

		// context.subscribe("action.execute", (event: GameActionEventArgs) => {
		//     const action = event.action as ActionType;
		//     switch (action) {
		//         case "ridesetappearance":
		//         case "ridesetcolourscheme": {
		//             debug(`<${action}>\n\t- type: ${event.type}
		// \t- args: ${JSON.stringify(
		//                 event.args, null, 2
		//             )}\n\t- result: ${JSON.stringify(event.result)}`);
		//             break;
		//         }
		//     }
		// })
	}

	/**
	 * @summary Called upon plugin mount. If the game was saved without closing the window, some artifacts will remain, including the preview track,
	 * the highlight under the preview track, and the yellow painting of the selected segment. This function will remove all of those artifacts.
	 */
	cleanUpFromImproperClose(): void {
		debug("cleaning up from improper close on pluginMount.");

		// if threre is still a previewSegment, call close to clean up
		const storedPaintedSegmentDetails = storage.getPaintedSegmentDetails();
		const storedPreviewSegment = storage.getPreviewSegment();
		if (storedPreviewSegment || storedPaintedSegmentDetails.segment) {

			debug(`there is a stored preview segment or a stored painted segment. Cleaning up.`);
			debug(`stored preview segment: ${JSON.stringify(storedPreviewSegment || storedPaintedSegmentDetails.segment)}`);
			//          // if something goes wrong during testing, this will catch it and make sure the plugin doesn't crash
			// if (!storedPreviewSegment?.get || !storedPaintedSegmentDetails?.segment?.get) {
			//     // debug(`the stored data is bugged. clearing it.`);
			//     this.previewSegment.set(null);
			this.segmentPainter.clearMemory();
			//     this.close();
			//     return;
			// }

			this.previewSegment.set(storedPreviewSegment);
			// this.segmentPainter.clearMemory();
			debug(`cleaning up from improper close. preview segment is ${JSON.stringify(storedPreviewSegment?.get())}`);
			this.close();
		}
	}

	close(): void {
		debug("closing segment model");
		this.segmentPainter.restoreInitialColour();
		if (this.previewSegment.get() !== null) {
			builder.removeSegment(this.previewSegment.get()!, "ghost", this.buildDirection.get());
		}
		this.previewSegment.set(null);
		this.selectedSegment.set(null);
		this.updateTrackIterator();
	}

	/**
	 * Main function called by the Ui to construct the selected segment.
	 */
	buildFollowingPiece(): void {
		const segToBuild = this.selectedBuild.get();
		const { ride, rideType, trackType, location } = segToBuild;
		const direction = this.buildDirection.get();
		if (ride == null || rideType == null || trackType == null || location == null || direction == null) {
			debug("Unable to build segment. Missing data.");
			debug(`ride: ${ride},
			rideType: ${rideType},
			trackType: ${trackType},
			location: ${location},
			direction: ${direction}`);
			return;
		}
		// remove the preview segment if it exists
		// todo not working with previous inversions
		// verify whether this is still the case
		const previewSegment = this.previewSegment.get();
		if (previewSegment !== null) {
			builder.removeSegment(previewSegment, "ghost", direction, (result) => {
				debug(`Ghost removed from the next position of the selected segment. Result is ${JSON.stringify(result, null, 2)}`);
			});
		}

		this.demolish("previewSegment");
		this.build("real");

	}

	/**
	 * Demolish a segment.
	 * @param type The selected segment or the preview segment.
	 */
	private demolish(type: "selectedSegment" | "previewSegment"): void {
		const seg = (type === "selectedSegment") ? this.selectedSegment.get() : this.previewSegment.get();
		if (seg === null) {
			debug(`Error demolishing ${type}. Segment is null.`);
			return;
		}
		builder.removeSegment(<Segment>seg, (type === "selectedSegment") ? "real" : "ghost", this.buildDirection.get());
	}

	moveToFollowingSegment(): boolean {
		const direction = this.buildDirection.get();
		if (direction == null) {
			"no direction set; not moving to next segment";
			return false;
		}
		debug(`Moving to ${direction} segment`);
		debug(`Trying to determine if there is a segment in the ${direction} direction. If there is, the segment will iterate in that direction; if there isn't nothing will happen.`);

		const TIAtSegment = this.TIAtSelectedSegment;
		if (TIAtSegment == null) {
			debug("Error: no track iterator exists");
			return false;
		}

		const isThereAFollowingSegment = (direction == "next" ? TIAtSegment.next() : TIAtSegment.previous()); // moves the iterator to the next segment and returns true if it worked;
		if (isThereAFollowingSegment) {
			debug(`The TI was about to iterate ${direction}. Updating the segment based on what's there.`);
			debug(`The TI says the ride should be found at (${TIAtSegment.position.x}, ${TIAtSegment.position.y}, ${TIAtSegment.position.z}) dir ${TIAtSegment.position.direction}.`);
			const followingTrackElementItem = finder.getSpecificTrackElement(this.selectedSegment.get()?.get().ride || 0, TIAtSegment.position);

			// add to nextSegment to create a whole new segment object
			const nextSegment = new Segment({
				location: TIAtSegment.position,
				ride: followingTrackElementItem.element.ride,
				trackType: followingTrackElementItem.element.trackType,
				rideType: followingTrackElementItem.element.rideType
			});

			// check if there's a preview segment to delete.
			if (this.previewSegment.get() != null) {
				debug(`There is a preview segment. Removing it.`);
				this.demolish("previewSegment");
			}
			debug(`The segment was found, of trackType ${nextSegment.get().trackType}. Setting the selected segment to it, and returning.`);
			this.selectedSegment.set(nextSegment);
			return true;
		}
		return false;
	}

	debugButtonChange(action: any) {
		debug(`button pressed: ${JSON.stringify(action, null, 2)}`);
	}


	private onSegmentChange = (newSeg: Segment | null): void => {
		if (newSeg == null) {
			debug("no segment selected");
			return;
		}
		debug(`selectedSegment changed to ${TrackElementType[newSeg.get().trackType]} at (${newSeg.get().location.x}, ${newSeg.get().location.y}, ${newSeg.get().location.z}, direction: ${newSeg.get().location.direction})`);

		this.updateSelectedBuild("ride", newSeg.get().ride); // update the ride type
		this.updateLocationModel();                         // update the location model
		this.highlightSelectedSegment(); // highlight the selected segment to make it obvious what's selected.
		this.setOriginalRideType(newSeg); // update the original rideType

		// don't actually assume this. the TI might have been set in a different step.
		if (!this.TIAtSelectedSegment) this.updateTrackIterator();

		// before figuring out what can be built in the direction, check if there's even an option
		// check if there's room for a preview segment
		const nextSegmentExists = this.checkForNextTrackInDirection();
		if (nextSegmentExists === "real") {
			debug(`No need to generate a preview segment. There's already a track in the direction we're building.`);
			return;
		}
		// is there a ghost track in direction? => not sure
		// is it empty in direction? => calculate buildable track types


		// potentially do this in the buttonModel in response to this change instead of doing it here.
		this.trackTypeSelector.updateReferenceSegment(newSeg);
	};

	updateSelectedBuild = (key: keyof SegmentDescriptor, value: CoordsXYZD | number | TrackElementType | RideType | null): void => {
		const selectedBuild = this.selectedBuild.get();
		// debug(`initial selected build is ${JSON.stringify(selectedBuild, null, 2)}`);
		const finalBuild = { ...selectedBuild, [key]: value };
		// debug(`final selected build is ${JSON.stringify(finalBuild, null, 2)}`);
		this.selectedBuild.set(finalBuild);
	};

	private highlightSelectedSegment(): void {
		const newSeg = this.selectedSegment.get();
		if (newSeg == null) return;
		storage.setSelectedSegment(newSeg); // store in cold storage in case of crash
		const wasPaintOfSelectedSegmentSucessful = this.segmentPainter.paintSelectedSegment(newSeg);
		// todo reimplement this with start/stop interval
		// if (this.previewSegment.get() == null) {
		//     this.segmentPainter.togglePainting(true);
		// } else {
		//     this.segmentPainter.togglePainting(false);
		// }
		if (!wasPaintOfSelectedSegmentSucessful) {
			debug(`failed to paint the selected segment!!!!!!!`);
		}
	}

	/**
	 * Reset build options when the navigation mode is changed to/from forward & backward building modes.
	 */
	private onBuildDirectionChange = (newDirection: "next" | "previous" | null): void => {
		debug(`Build direction changed to ${newDirection}`);
		this.updateLocationModel(); // update the location model
	};

	/**
	 * TODO - this is not working. It is not updating the buildable segments when the rotation changes.
	 * Recalculate details after rotating an unbuild floating piece
	 * (like rotating a single yet-placed station with the standard ride builder)
	 */
	private onRotationChange = (rotation: Direction | null): void => {
		// const segment = this.selectedSegment.get();

		// if (segment == null || rotation == null) return;
		// const rotatedSegment = new Segment({
		//     location: { x: segment.location.x, y: segment.location.y, z: segment.location.z,  },
		// })
		// segment.get().location.direction = rotation;
		// // this.ss.updateSegment(segment);
		// // todo make sure to set nextBuildPosition at the sme time
	};

	private onBuildableTrackTypesChange = (newBuildOptions: TrackElementType[]): void => {
		debug(`Buildable segments have changed.`);

		// figure out which are valid based on the selected segment

		// this is where it might be worthwhile to use another class to do this hard work.
		const recommendedSegment = getSuggestedNextSegment(newBuildOptions, this.selectedSegment.get(), this.selectedBuild.get().trackType ?? 0);

		debug(`The default selected build has been selected: ${TrackElementType[recommendedSegment]}`);
		this.updateSelectedBuild("trackType", recommendedSegment);
	};

	// will be updated any time a property of the SegmentDesc change
	// todo make sure to handle highlighting
	private onSelectedBuildChange = (selectedBuild: Partial<SegmentDescriptor>): void => {

		const { trackType, rideType, ride, location } = selectedBuild;
		const direction = this.buildDirection.get();
		const segment = this.selectedSegment.get();
		// first hande if the ride type has changed or even exists
		// if (rideType != null) {

		// }

		debug(`On selectedBuild change:`);
		// if all 4 segment descriptor fields are set, go ahead and build.
		if (!(trackType != null && rideType != null && ride != null && location != null && direction != null && segment != null)) {
			debug(`Not all fields are set for the selected build. Not building preview.`);
			debug(`trackType: ${trackType}, rideType: ${rideType}, ride: ${ride}, location: ${location}, direction: ${direction}, segment: ${segment}`);
			return;
		}
		debug(`On selectedBuild change:`);
		debug(`All necessary segment descriptor fields are set. Potentially building a preview segment if there isn't a real piece there already.`);
		debug(`trackType: ${trackType}, rideType: ${rideType}, ride: ${ride}, location: ${location}, direction: ${direction}, segment: ${segment}`);

		const trackAtFollowingBuildLocation = this.checkForNextTrackInDirection();

		// case: the next location is free
		if (!trackAtFollowingBuildLocation) {
			debug(`\tThere was no track at the location of the selected build. Building the preview now:
			\t trackType: ${trackType},
			\t rideType: ${rideType},
			\t ride: ${ride},
			\t location: ${JSON.stringify(location)},`);
			this.build("ghost");
		}

		// case: the next location is already occupied by a ghost
		if (trackAtFollowingBuildLocation === "ghost") {
			debug(`\tThere was a ghost at the location of the selected build.Removing it now.`);
			this.demolish("previewSegment");
			debug(` Building the new piece now.`);
			this.build("ghost");
		}

		// case: the next location is occupied by a real track piece
		if (trackAtFollowingBuildLocation === "real") {
			debug(`There is a real track piece at the location of the selected build.Cannot build a preview piece here.`);
			// need to nullify something, but not sure what
			// this.updateSelectedBuild("location", null);

			this.updateSelectedBuild("trackType", null);
			return;
		}

		// todo remove the ghost if this edit window closes
		// todo the ghost will be remove if the build is reselected, but it'd be nice if it were done on subscription of some sort.
	};


	private onNextBuildPositionChange = (newNextBuildPosition: CoordsXYZD | null): void => {
		debug(`next build position changed to ${JSON.stringify(newNextBuildPosition)} `);
	}

	private onPreviewSegmentChange(newPreviewSegment: Segment | null): void {
		// debug(`preview segment changed to ${JSON.stringify(newPreviewSegment?.get())
		//     } `);
		debug(`preview segment changed to ${JSON.stringify(newPreviewSegment)}`)
		highlighter.highlightMapRangeUnderSegment(newPreviewSegment);
		storage.setPreviewSegment(newPreviewSegment);
	}

	private setOriginalRideType = (segment: Segment): void => {
		const rideId = segment.get().ride;
		const ride = map.getRide(rideId);
		this.updateSelectedBuild("rideType", ride.type);
		this.originalRideType.set(ride.type);
		debug(`original ride type set to ${ride.type}`);
	};

	/**
	 * Change the ride type of the selected segment
	 * @param newRideType the new ride type
	 */
	changeRideType = (newRideType: RideType): void => {
		const segment = this.selectedSegment.get();
		if (!segment) { return }
		const trackElement = finder.getTrackElementFromSegment(segment);
		if (trackElement) {
			trackElement.element.rideType = newRideType;
		}
	};

	private updateLocationModel() {
		const thisTI = this.TIAtSelectedSegment;
		const segment = this.selectedSegment.get();
		const direction = this.buildDirection.get();

		if (thisTI && direction && segment) {
			let location: CoordsXYZD | null;
			(direction == "next") ? location = thisTI.nextPosition : location = thisTI.previousPosition;
			if (location == null) {
				debug(`Unable to remove track: no ${direction} location`);
				return;
			}
			if (direction == "previous") {
				debug(`initial direction before rotating: ${location.direction}`);
				location.direction = segment.get().location.direction;
			}
			debug(`Updating selectedBuild.location: ${location.x}, ${location.y}, ${location.z}, ${location.direction}`);
			this.updateSelectedBuild("location", location);
			return;
		}
		debug(`Unable to update location model: segment or direction or TI missing`);
		this.updateSelectedBuild("location", null);
	}

	build(ghost: "ghost" | "real" = "real",
		callback?: ((response: { result: GameActionResult, newlyBuiltSegment: Segment }) => void)): void {
		const build = this.selectedBuild.get();
		const direction = this.buildDirection.get();
		builder.buildSegment(<SegmentDescriptor>build, direction || "next", ghost, ({ result, newlyBuiltSegment }) => {
			// if it was a ghost, set the previewSegment to the newly built segment
			if (ghost == "ghost") {
				this.previewSegment.set(newlyBuiltSegment);
			}
			if (callback) {
				callback({ result, newlyBuiltSegment });
				return;
			}
			if (result.error) {
				debug(`Error building that piece. ${result?.errorMessage}`);
				return;
			}
			debug(`${ghost} track built at ${newlyBuiltSegment.get().location}`);
		});
	}

	private updateTrackIterator(): void {
		this.TIAtSelectedSegment = finder.getTIAtSegment(this.selectedSegment.get());
	}

	private checkForNextTrackInDirection = (): "real" | "ghost" | null => {
		debug(`Checking if there is a track at the next build location, to know whether to build or not.`);
		const segment = this.selectedSegment.get();
		const direction = this.buildDirection.get();
		const TIAtSegment = this.TIAtSelectedSegment;

		if (segment && direction && TIAtSegment) {

			// the TI can find real segments and it's much cheaper than using the finder.
			const isThereARealNextSegment = TIAtSegment.nextPosition != null;
			if (isThereARealNextSegment) return "real";

			debug(`No real segment found at the next build location. Checking for a ghost.`);
			const trackAtFollowingBuildLocation = finder.doesSegmentHaveNextSegment({
				selectedSegment: segment,
				tiAtSegment: TIAtSegment,
				buildDirection: direction
			});

			return trackAtFollowingBuildLocation;
		}
		return null;
	};

}




