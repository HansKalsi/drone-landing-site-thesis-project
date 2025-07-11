import { useEffect, useRef, useState } from 'react';
import './MainScreen.css'
import { askLLM } from './lib/llm';
import ImagePicker from './test';

export const MainScreen: React.FC = () => {
    const [imageB64ForAI, setImageB64ForAI] = useState<string | null>(null);

    const awaitingAiResponse = useRef(false);

    // "unsafe_grids": ["<ID>", ...],
    const systemText = `
        You are an onboard drone AI landing assistant.
        Identify the safest landing spots for a drone, avoiding obstacles like trees, rocks, water, and other hazardous areas for a drone to safely land.
        Make sure you check every single grid quadrant throughout the whole image first before making any decisions, then pick your top 3 landing sites.
        It is important to consider any big changes in colour in a quadrant, as this may indicate an unsuitable landing spot.
        Beware that your image may be blurry, so you must be careful when making your decisions.
        Death or risk of injury is unacceptable, so you must be very careful when making your decisions.
        Prioritise completely obvious safe landing spots.

        Return valid JSON **only**.

        Format:
        {
        "safe_top3": [
            { "id": "<ID>", "rationale": "<50 words maximum>" },
            ...
        ]
        }
        Rules:
        - "safe_top3" must contain maximum 3 items.
        - If no safe squares exist, return {"unknown": "<50 words maximum>"}, but still provide the 50 word rationale as to why.
        - If no grid squares are detected, return {"unknown": 'no grid detected'}.
        - Each quadrant borders are defined in white, the label is placed in the center, consider the whole square when making your decision.
    `;
    // const systemText = `
    //     You are an onboard drone AI landing assistant.
    //     Make sure you consider the image as a whole, and each grid quadrant - including how the quadrants may blend together to provide a bigger picture of the terrain.
    //     Your goal is to find the safest landing spots for a drone in the provided image.
    //     Keep in mind that this image is an aerial top down view, so the perspective is from above.
    //     Pay close attention to dark spots, as this would indicate shadows from obstacles and would not be a safe landing spot.
    //     Analyze the image and identify areas that are safe for landing, avoiding obstacles like trees, rocks, water, and other hazardous areas.
    // `;

    useEffect(() => {
        if (!imageB64ForAI) return; // No image to process
        if (!awaitingAiResponse.current) {
            awaitingAiResponse.current = true;
            (async () => {
                const report = await askLLM(
                    systemText,
                    "",
                    imageB64ForAI || ""
                ).then((response) => {    
                    awaitingAiResponse.current = false;
                    console.log(response);
                });
            })();
        }
    }, [imageB64ForAI]);

    const imageSrc = "https://thumbs.dreamstime.com/b/aerial-top-down-view-to-forest-trees-tourist-paths-slovakia-national-park-mala-fatra-vibrant-colors-fresh-nature-beautiful-153796506.jpg"
    const [blobURL, setBlobURL] = useState<string | null>(null);

    useEffect(() => {
        async function loadImage() {
          const res = await fetch(imageSrc, { mode: "cors" });
          const blob = await res.blob();
          const objectURL = URL.createObjectURL(blob);
          setBlobURL(objectURL); // state you pass to <img src=...>
        }
        loadImage();
      }, [imageSrc]);
      

    return (
        <div>
            <ImagePicker setB64ForAI={setImageB64ForAI} />
            {/* {blobURL && (
                <GridOverlay imageSrc={blobURL} rows={26} cols={52} />
            )} */}
            {/* <div className="image-box">IMAGE BOX</div>
            <div className="right-panel">RIGHT PANEL</div>
            <div className="bottom-panel">BOTTOM PANEL</div> */}
        </div>
    );
}