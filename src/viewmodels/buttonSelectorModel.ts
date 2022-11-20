import { store, arrayStore } from 'openrct2-flexui';
import { CurveButton, BankButton, PitchButton, SpecialButton, MiscButton, DetailButton, SelectionControlButton, BuildWindowButton, } from './../services/buttonActions/buttonTypes';

export class ButtonSelectorModel {

    readonly selectedCurve = store<CurveButton | null>(null);
    readonly selectedBank = store<BankButton | null>(null);
    readonly selectedPitch = store<PitchButton | null>(null);
    readonly selectedDetail = store<DetailButton | null>(null);
    readonly selectedMisc = store<MiscButton | null>(null);
    readonly selectedSpecial = store<SpecialButton | null>(null);
    readonly selectedControl = store<SelectionControlButton | null>(null);
    readonly allSelectedButtons = arrayStore<BuildWindowButton>([]);

    // Track whether the selector is picking a segment or not
    readonly isPicking = store<boolean>(false);

    // constructor(model: SegmentModel) {

    // }
}
