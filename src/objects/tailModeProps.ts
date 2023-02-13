
const defaultTailColourProps: TailProps[] = [
    {
        tailColours: {
            main: 26,
            additional: 21,
            supports: 26
        },
        tailLength: 3,
    },
    {
        tailColours: {
            main: 21,
            additional: 20,
            supports: 21
        },
        tailLength: 2,
    },
    {
        tailColours: {
            main: 20,
            additional: 19,
            supports: 20
        },
        tailLength: 1,
    }
];

const defaultTailModeProps: TailModeProps = {
    numberOfTailColours: 3,
    paintStart: "afterLastCar",
    tailProps: defaultTailColourProps
};
export type TailProps = {
    tailColours: {
        main: number,
        additional: number,
        supports: number
    };
    tailLength: number;
};

export interface TailModeProps {
    numberOfTailColours: NumberOfSetsOrColours,
    paintStart: PaintStartProps,
    tailProps: TailProps[],
}
