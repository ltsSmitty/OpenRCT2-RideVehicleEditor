import { checkbox, CheckboxParams, FlexiblePosition, horizontal, label, LabelParams, Scale, spinner, SpinnerParams, WidgetCreator } from "openrct2-flexui";

/**
 * A checkbox with a label on the left side.
 */
export function combinedLabelCheckbox(labelWidth: Scale, params: LabelParams & CheckboxParams): WidgetCreator<FlexiblePosition> {
	const text = params.text;
	params.text = "";
	return horizontal([
		label({
			width: labelWidth,
			disabled: params.disabled,
			tooltip: params.tooltip,
			text
		}),
		checkbox(params)
	]);
}
