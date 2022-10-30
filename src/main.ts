import * as Environment from "./environment";
import { initActions } from "./services/actions";
// import { mainWindow } from "./ui/mainWindow";
import { trackIteratorWindow } from "./ui/trackIteratorWindow"


/**
 * Opens the ride editor window.
 */
function openEditorWindow(): void {
	// Check if game is up-to-date...
	if (context.apiVersion < 59) {
		// 59 => https://github.com/OpenRCT2/OpenRCT2/pull/17821
		const title = "Please update the game!";
		const message = "The version of OpenRCT2 you are currently playing is too old for this plugin.";

		ui.showError(title, message);
		console.log(`[RideVehicleEditor] ${title} ${message}`);
		return;
	}

	// Show the current instance if one is active.
	trackIteratorWindow.open();
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
	ui.registerMenuItem("Track Generator", () => openEditorWindow());
}
