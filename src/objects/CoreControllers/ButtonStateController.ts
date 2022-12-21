import { BuildWindowButton } from "../../services/buttonActions/buttonTypes";
import { ButtonsActivelyPressed } from "../../services/buttonToTrackElementMap";

interface IButtonStateController {
    // return the buttons that are pressed. not sure if this actually has a purpose
    getPressedButtons(): BuildWindowButton[];

    // return the buttons that are pressed and not disabled
    getPressedButtonsActive(): ButtonsActivelyPressed;
}

export class ButtonStateController {

}
