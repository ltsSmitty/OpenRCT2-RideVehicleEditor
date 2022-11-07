import { SelectionButton } from "../objects/rideToggle";

export const setGlobalButtonPressed = (buttonType: SelectionButton, isPressed: boolean): void => {
    if (isPressed) {
        context.sharedStorage.set(`advancedTrackBuilder.selectedButton`, buttonType);
    }
}

export const getGlobalButtonPressed = () => {
    return context.sharedStorage.get<SelectionButton | undefined>(`advancedTrackBuilder.selectedButton`);
}
