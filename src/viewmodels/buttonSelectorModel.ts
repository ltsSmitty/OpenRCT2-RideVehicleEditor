import { store, arrayStore } from 'openrct2-flexui';
import { Segment } from '../objects/segment';
import { debug } from '../utilities/logger';
import { CurveButton, BankButton, PitchButton, SpecialButton, MiscButton, DetailButton, SelectionControlButton, BuildWindowButton, } from './../services/buttonActions/buttonTypes';
import { SegmentModel } from './segmentModel';

export class ButtonSelectorModel {

    readonly selectedCurve = store<CurveButton | null>("noCurve");
    readonly selectedBank = store<BankButton | null>("noBank");
    readonly selectedPitch = store<PitchButton | null>("noPitch");
    readonly selectedDetail = store<DetailButton | null>(null);
    readonly selectedMisc = store<MiscButton | null>(null);
    readonly selectedSpecial = store<SpecialButton | null>(null);
    readonly selectedControl = store<SelectionControlButton | null>(null);
    readonly allSelectedButtons = arrayStore<BuildWindowButton>([]);
    readonly model: SegmentModel;
    // Track whether the selector is picking a segment or not
    readonly isPicking = store<boolean>(false);

    constructor(model: SegmentModel) {
        this.model = model;

        // subscribe to selectedSegment changes to update the selected buttons
        this.model.selectedSegment.subscribe((segment) => { this.onSegmentChange(segment); });
    }

    // use this function to do reset all the buttons.
    private onSegmentChange(newSegment: Segment | null) {
        debug(`in buttonSelectorModel.onSegmentChange()`);
    }
}
