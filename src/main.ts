import { ElementWrapper } from './viewmodels/elementWrapper';
import { SegmentModel } from './viewmodels/segmentModel';
import * as Environment from "./environment";
import { initActions } from "./services/actions";
// import { mainWindow } from "./ui/mainWindow";
import { trackIteratorWindow } from "./ui/trackIteratorWindow";
import { WindowTemplate } from 'openrct2-flexui';
import { debug } from './utilities/logger';
import { initCustomSprites } from './objects/customButtonSprites';


/**
 * Opens the ride editor window.
 */
function openEditorWindow(window: WindowTemplate): void {
	// Check if game is up-to-date...
	if (context.apiVersion < 59) {
		// 59 => https://github.com/OpenRCT2/OpenRCT2/pull/17821
		const title = "Please update the game!";
		const message = "The version of OpenRCT2 you are currently playing is too old for this plugin.";

		ui.showError(title, message);
		console.log(`[TrackGenerator] ${title} ${message}`);
		return;
	}

	window.open();
}


/**
 * Entry point of the plugin.
 */
export function main(): void {
	if (!Environment.isUiAvailable) {
		console.log("UI unavailable, plugin disabled.");
		return;
	}

	initActions();
	initCustomSprites();

	const segmentModel = new SegmentModel();
	segmentModel.cleanUpFromImproperClose();
	const elementWrapper = new ElementWrapper(segmentModel);
	const window = trackIteratorWindow(segmentModel, elementWrapper);
	ui.registerMenuItem("Track Generator", () => openEditorWindow(window));
}
