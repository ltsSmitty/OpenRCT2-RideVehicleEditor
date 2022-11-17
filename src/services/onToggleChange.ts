import { SegmentModel } from './../viewmodels/segmentModel';
import { ArrayStore } from "openrct2-flexui";
import { SelectionButton } from './../viewmodels/elementWrapper';

export const buttonToggleChanged = (options: {
    buttonType: SelectionButton,
    isPressed: boolean, segmentModel:
    SegmentModel, buttonsPressed:
    ArrayStore<SelectionButton>
}) => {

    const { buttonType, isPressed, segmentModel: model, buttonsPressed } = options;
    // do something

    let modelResponse;

    switch (options.buttonType) {
        case "iterateNext": {
            modelResponse = model.moveToFollowingSegment("next");
            model.buildDirection.set("next");
            break;
        }
        case "iteratePrevious": {
            modelResponse = model.moveToFollowingSegment("previous");
            model.buildDirection.set("previous");
            break;
        }
    }
    model.debugButtonChange({ buttonType, isPressed, modelResponse });
}
