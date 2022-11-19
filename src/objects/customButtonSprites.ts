enum ImageMoniker {
    "sBendLeft",
    "sBendRight",
    "mediumLeftTurn",
    "mediumRightTurn",
    "turnAroundLeft",
    "turnAroundRight",
    "snippet"
}

type ImageType =
    "sBendLeft" |
    "sBendRight" |
    "mediumLeftTurn" |
    "mediumRightTurn" |
    "turnAroundLeft" |
    "turnAroundRight" |
    "snippet";

// type CustomSpriteParams = Record<ImageMoniker, { width: number, height: number, data: string }>;

// const initCustomSprites2 = () => {

//     const images: CustomSpriteParams = {
//         sBendLeft: { width: 19, height: 20, data: pngToBase64.sbendLeft },
//         sBendRight: { width: 19, height: 20, data: pngToBase64.sbendRight },
//         mediumLeftTurn: { width: 19, height: 20, data: pngToBase64.mediumLeftTurn },
//         mediumRightTurn: { width: 19, height: 20, data: pngToBase64.mediumRightTurn },
//         turnAroundLeft: { width: 19, height: 20, data: pngToBase64.turnAroundLeft },
//         turnAroundRight: { width: 19, height: 20, data: pngToBase64.turnAroundRight },
//         snippet: { width: 19, height: 20, data: pngToBase64.snippet },
//     };

//     const range = ui.imageManager.allocate(Object.keys(images).length);
//     if (range) {
//         // modern version created by copilot
//         images.forEach((image, index) => {
//             ui.imageManager.setPixelData(range.start + index, {
//                 type: "rle",
//                 width: image.width,
//                 height: image.height,
//                 data: image.data,
//             });
//             imageMap[index] = range.start + index;
//         })

//         // Object.entries(images).forEach(([key, value]) => {
//         //     const { width, height, data } = value;

//         // const img = new Image(width, height);
//         // img.src = data;
//         // customSprites[key] = img;
//     });
// }

const imageMap: number[] = [];

export const initCustomSprites = (): void => {
    const images = [
        { width: 19, height: 20, data: pngToBase64.sbendLeft },
        { width: 19, height: 20, data: pngToBase64.sbendRight },
        { width: 19, height: 16, data: pngToBase64.mediumLeftTurn },
        { width: 19, height: 16, data: pngToBase64.mediumRightTurn },
        { width: 19, height: 16, data: pngToBase64.turnAroundLeft },
        { width: 19, height: 16, data: pngToBase64.turnAroundRight },
        { width: 20, height: 20, data: pngToBase64.snippet },
    ];

    // imageMap = Array(images.length);
    const range = ui.imageManager.allocate(images.length);
    if (range) {
        // modern version created by copilot
        images.forEach((image, index) => {
            ui.imageManager.setPixelData(range.start + index, {
                type: "rle",
                width: image.width,
                height: image.height,
                data: image.data,
            });
            imageMap[index] = range.start + index;
        })

        // // Intelorca's version
        // for (let i = 0; i < images.length; i++) {
        //     const imageIndex = range.start + i;
        //     const image = images[i];
        //     imageMap[i] = imageIndex;
        //     ui.imageManager.setPixelData(imageIndex, {
        //         type: 'rle',
        //         width: image.width,
        //         height: image.height,
        //         data: image.data
        //     });
        // }
    }
};

const getImage = (moniker: ImageMoniker): number => imageMap[moniker];

const pngToBase64 = {
    "sbendLeft": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAUCAMAAABYi/ZGAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAd0lEQVQYlWXQUQ4DIQgEUE80iQxo73+yBW0tsvP5AoK0tgK0GkytiGlWEHOMcaOTfdwS/ii1x1vRmRFGmpcqSTmFwCJBXjLazQgkha2M6Tnd1I0+7MIvJ5TYZJfyYBehLuV/TsSrff3rGOiM6dX0ZdK70Moh91ceJPools1PV5QAAAAASUVORK5CYII=",

    "sbendRight": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAUCAMAAABYi/ZGAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAf0lEQVQYlV2QWw4FIQhDXVETRGTc/8ZumYcXIfMzJ21t2tr/gFYPPiqEmxUIn3OekMgusgQ/lOyRFc4MYapG6VDVvoUItxF8JYGXDd2itS6SzLA8NPxsvGFY5g/ZMub4Q5LT73926JLqsqrcTx9zqByDcDW2L4zlRXoZ7oiK+wFXJCil6LkpIQAAAABJRU5ErkJggg==",

    "mediumLeftTurn": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAMAAADDGrRQAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAcklEQVQYlV3P2xFEIQgDUCrKDELA/itbcO9L8e8YNYqsAeQcpJ2I5GlFbtiOFwW9/NVOMWLOmY6NMjPIC+FknWXk3LBWNFb0RqO7qrGDX1TA66EnKBgckMa6xh4s6wpVXu+Wqy7S3V77b9CG6th/jjXyA4hhIgrxHPY2AAAAAElFTkSuQmCC",

    "mediumRightTurn": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAMAAADDGrRQAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAdUlEQVQYlWXQSw7AIAgEUE80CcgA9z9Z0X60ra54YQzS2jpA+x6E/RDBDwJIeyFgzKRviIhM96IHEV43YkNkUYazsjTFpGrKqLKa2G8aoS5qF43HPEcEYtSTOLuqgFJwTz9yVUDkmcOsT1s7ALuK6O+jeG/pAKSAIhjDrBI/AAAAAElFTkSuQmCC",

    "turnAroundLeft": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAMAAADDGrRQAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAfUlEQVQYlU3QUQ7EIAgEUE80iSKQ3v9iOwzVLumHeTJYHaMLXeMr4Mkn0/enlAgPZ21cyqa4iOyeRpxkpWwLDbIKcjx29V3Tkvb2geNkgPm7mSnjOFmUTeeYnmg3u4j8eMjSrs6wJkaqMfsHTVS2jzGuG2HNuczPjfH3YOMHogQu28z/JOMAAAAASUVORK5CYII=",

    "turnAroundRight": "iVBORw0KGgoAAAANSUhEUgAAABMAAAAQCAMAAADDGrRQAAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAfElEQVQYlUWQiw0AIQhDmaiJgpDbf7Er4IeYSJ5tRUWy0CWvgC++iGWPkrgvXyzDRdHIL0S0piGOM11qBRUlSyPjYalrVk62ZFdXSUpd7EbqONuIZsqroc3GYl5HC2b1wCTkygkxKPRoQ6NkVoxwI3rHmFrzM+a8933T3n72NS7V3F2TJwAAAABJRU5ErkJggg==",

    "snippet": "iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAMAAAC6V+0/AAADAFBMVEUAAAABAQECAgIDAwMEBAQFBQUGBgYHBwcICAgJCQkXIyMjMzMvQ0M/U1NLY2Nbc3Nvg4ODl5efr6+3w8PT29vv8/MzLwA/OwBPSwtbWxNrax93ey+HizuXm0+nr1+7v3PLz4vf46NDKwdXOwtvSxd/Vx+PYyefczOzg0O/l1fLr2/bx4fn26P378NHGwBfKwB3PwCPUwenbwe/iw/XpxPzyxv/5y//81//+4///8MjAABPAABfBwdvDw9/GxuPJyejOzuzT0/HZ2fXf3/rn5//v78bMxMjPxcvTx87XydHbytXfzNjjztzm0ODq0uTu1Ojy1+322cfNxsvRyM7UytLYzdbb0Nvh0+Hn1+ft2+3z3/D25PP56ff978PPwATUwAXZwAfewAnjwc3nxdHrydbvz9vz1eL33Oj74/D/7NPKxNjNxt3RyuLVzunY0O7c1PPg2PXl3Pjq4Pvv5f3z6v/48MPEzcnK1czN2c/Q3dTU4tjY5t3d6+Li7+fn8+3t9/T0+/v7/8AG28AJ5cHM6cPQ7sbU8srZ99Dh+Nbo+d3u++P0/Ov5/vX9/8LKw8PNxcXRx8jUysvYzs7c0tPh19jm3d7r4uTx6ev28PP898/AF9LB3NTD39fH49rK5t7P6uHU7ubZ8erf9e/m+fXw/Pz6/8/AABXAABzAACPAACrAADHAADjBwD/BwD/T0P/e3P/q6P/29dPJwBvMwCTPwC3RwDbTwD/UwD/bxf/izP/o0//t2v/y4f/26MAMy8APzcAS0MAV08Ha2MXf3crk49Hp6Nju7uDz8+r5+fP//8/ABtnADN7Cz+PF0+jH1+3J2/bO4/vW6vzd7v3l8v7t9//1+8nEwA3HwdHLw9bPx9rUzN7Z0uPf2ujk3+7q5PPw6vn28P/8983S0v/twD/2wD//wAHa2MHa2Mnj4cbg3sHa2M3m5c3m5eb4+Nzy8s3m5dDW1tTa2tje3tvMy+DNy+XPzOrQzO/Sy/TTyvnVyP/Xx//fyf/mzP/tz//z0v///+Pg7FnAAAAAXRSTlMAQObYZgAAAFB6VFh0U29mdHdhcmUAAAiZ8y9IzQtyDjHSUSgz0DPRM9I1NLDQTbc0SzKwSE5U0IAx8vMUUlLLUnPyCzQVCoryyzJTUlMUkioV3DNLPEqTAKwLFQ4WTu3NAAAAL0lEQVQYlWNggIH1axgwwfpVdBJcg02QIFgPBmsgjodx1qwCA4iZcA4Zhg+WAAEALxQoakvEP2AAAAAASUVORK5CYII="
}

export const customImageFor = (image: ImageType): number => {
    switch (image) {
        case "sBendLeft": {
            return getImage(0);
        }
        case "sBendRight": {
            return getImage(1);
        }
        case "mediumLeftTurn": {
            return getImage(2);
        }
        case "mediumRightTurn": {
            return getImage(3);
        }
        case "turnAroundLeft": {
            return getImage(4);
        }
        case "turnAroundRight": {
            return getImage(5);
        }
        case "snippet": {
            return getImage(6);
        }
    }

}
