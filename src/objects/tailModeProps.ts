import { arrayStore, store } from "openrct2-flexui";
import { ColourSet, ThreeTuple } from "./trainModeProps";
import * as Log from "../utilities/logger";
import _ from "lodash-es";
import { NumberOfSetsOrColours } from "./PaintPropsObj";

export type PatternValue = 0 | 1 | 2 | 3;

type TrackColourSet = ColourSet["trackColours"];

export type PatternChoice = "before" | "after";

const defaultStartSegmentBefore = 1;
const defaultStartSegmentAfter = 1;
const defaultPatternChoice = "before";

const defaultNumberOfTailSets = 2;

const defaultTrackColourSet: TrackColourSet = { main: 0, additional: 0, supports: 0 };

const defaultTrackColourSets: ThreeTuple<TrackColourSet> = [
    { ...defaultTrackColourSet }, { ...defaultTrackColourSet }, { ...defaultTrackColourSet }];

const defaultTrainModePropsStore = {
    trackColourSets: store<ThreeTuple<TrackColourSet>>(defaultTrackColourSets),
    numberOfTailSets: store<NumberOfSetsOrColours>(defaultNumberOfTailSets),
    patternBefore: arrayStore<PatternValue>([]),
    patternAfter: arrayStore<PatternValue>([]),
    patternChoice: store<PatternChoice>("before"),
    startBefore: store<number>(defaultStartSegmentBefore),
    startAfter: store<number>(defaultStartSegmentAfter),
};

export interface TailModeProperties {
    trackColourSets: ThreeTuple<TrackColourSet>;
    numberOfTailSets: NumberOfSetsOrColours;
    patternBefore: PatternValue[];
    patternAfter: PatternValue[];
    patternChoice: PatternChoice;
    startBefore: number;
    startAfter: number;
}

export class TailModePropertiesObj {
    readonly trackColourSets = store<ThreeTuple<TrackColourSet>>(defaultTrackColourSets);
    readonly numberOfTailSets = store<NumberOfSetsOrColours>(defaultNumberOfTailSets);
    readonly patternBefore = arrayStore<PatternValue>([]);
    readonly patternAfter = arrayStore<PatternValue>([]);
    readonly patternChoice = store<PatternChoice>(defaultPatternChoice);
    readonly startBefore = store<number>(defaultStartSegmentBefore);
    readonly startAfter = store<number>(defaultStartSegmentAfter);

    reset(): void {
        Log.debug(`Resetting tail mode properties to defaults.`);
        this.trackColourSets.set({ ...defaultTrackColourSets });
        this.numberOfTailSets.set(defaultNumberOfTailSets);
        this.patternBefore.set([]);
        this.patternAfter.set([]);
        this.patternChoice.set(defaultPatternChoice);
        this.startBefore.set(defaultStartSegmentBefore);
        this.startAfter.set(defaultStartSegmentAfter);
    }

    setTrackColour(params: { trackIndex: number, part: keyof TrackColourSet, colour: number }): void {
        const { trackIndex, part, colour } = params;
        const trackColourSets = this.trackColourSets.get();
        trackColourSets[trackIndex][part] = colour;
        this.trackColourSets.set(trackColourSets);
    }

    prettyPrintTrackColours(): void {
        Log.debug(`Track colours:
        [ ${this.trackColourSets.get()[0].main}, ${this.trackColourSets.get()[0].additional}, ${this.trackColourSets.get()[0].supports} ]
        [ ${this.trackColourSets.get()[1].main}, ${this.trackColourSets.get()[1].additional}, ${this.trackColourSets.get()[1].supports} ]
        [ ${this.trackColourSets.get()[2].main}, ${this.trackColourSets.get()[2].additional}, ${this.trackColourSets.get()[2].supports} ]`);
    }

    addToPattern(params: { pattern: PatternChoice, value: PatternValue }): void {
        const { pattern, value } = params;
        const patternStore = pattern === "before" ? this.patternBefore : this.patternAfter;
        patternStore.push(value);
    }

    removeFromPattern(params: { pattern: PatternChoice }): void {
        const { pattern } = params;
        const patternStore = pattern === "before" ? this.patternBefore : this.patternAfter;
        patternStore.pop();
    }

    setStartValue(params: { pattern: PatternChoice, value: number }): void {
        const { pattern, value } = params;
        const startStore = pattern === "before" ? this.startBefore : this.startAfter;
        startStore.set(value);
    }

    setPattern(params: { pattern: PatternChoice, values: PatternValue[] }): void {
        const { pattern, values } = params;
        const patternStore = pattern === "before" ? this.patternBefore : this.patternAfter;
        patternStore.set(values);
    }

    setPatternChoice(pattern: PatternChoice): void {
        this.patternChoice.set(pattern);
    }

    setNumberOfTailSets(value: NumberOfSetsOrColours): void {
        this.numberOfTailSets.set(value);
    }

    setFromExistingProps(existingProps: TailModePropertiesObj): void {
        this.trackColourSets.set(existingProps.trackColourSets.get() ?? defaultTrackColourSets);
        this.numberOfTailSets.set(existingProps.numberOfTailSets.get() ?? defaultNumberOfTailSets);
        this.patternBefore.set(existingProps.patternBefore.get() ?? []);
        this.patternAfter.set(existingProps.patternAfter.get() ?? []);
        this.patternChoice.set(existingProps.patternChoice.get() ?? defaultPatternChoice);
        this.startBefore.set(existingProps.startBefore.get() ?? defaultStartSegmentBefore);
        this.startAfter.set(existingProps.startAfter.get() ?? defaultStartSegmentAfter);
    }

    flatten(): TailModeProperties {
        return {
            trackColourSets: { ...this.trackColourSets.get() },
            numberOfTailSets: this.numberOfTailSets.get(),
            patternBefore: this.patternBefore.get(),
            patternAfter: this.patternAfter.get(),
            patternChoice: this.patternChoice.get(),
            startBefore: this.startBefore.get(),
            startAfter: this.startAfter.get(),
        };
    }

    setTrackColourSets(trackColourSets: ThreeTuple<TrackColourSet>): void {
        this.trackColourSets.set([
            _.cloneDeep(trackColourSets[0]),
            _.cloneDeep(trackColourSets[1]),
            _.cloneDeep(trackColourSets[2]),
        ]);
    }

    unflatten(props: TailModeProperties): void {
        if (!props.trackColourSets) { return }
        Log.debug(`Unflattening tail mode properties.`);

        this.setTrackColourSets(props.trackColourSets);
        this.setNumberOfTailSets(props.numberOfTailSets);
        this.setStartValue({ pattern: "before", value: props.startBefore });
        this.setStartValue({ pattern: "after", value: props.startAfter });
        this.setPatternChoice(props.patternChoice);
        this.setPattern({ pattern: "before", values: props.patternBefore });
        this.setPattern({ pattern: "after", values: props.patternAfter });
    }
}

