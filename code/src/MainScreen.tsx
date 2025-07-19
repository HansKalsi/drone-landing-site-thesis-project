import { useEffect, useRef, useState } from 'react';
import './MainScreen.css'
import { askLLM } from './lib/llm';
import ImagePicker from './ImagePicker';

export const MainScreen: React.FC = () => {
    const [imageB64ForAI, setImageB64ForAI] = useState<string | null>(null);
    const [actuallySendToAI, setActuallySendToAI] = useState<boolean>(true);
    const awaitingAiResponse = useRef(false);
    const [keepParticularCell, setKeepParticularCell] = useState<string | null>(null);
    const [recheckText, setRecheckText] = useState<string>("");
    const [aiCallQueue, setAiCallQueue] = useState<any[]>([]);

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

    async function callAiModel(text: string = systemText, callHandleResponse: boolean = true) {
        const report = await askLLM(
            text,
            "",
            imageB64ForAI || ""
        ).then((response) => {    
            awaitingAiResponse.current = false;
            handleResponse(response, callHandleResponse);
        });
    }

    function handleResponse(response: string, callHandleResponse: boolean) {
        console.log("AI Response:", response);
        // Remove ```json and ``` from response
        const cleanedResponse = response.replace(/```json|```/g, '').trim();
        console.log("Cleaned Response:", cleanedResponse);
        const parsedResponse = JSON.parse(cleanedResponse);
        console.log("Parsed Response:", parsedResponse);
        if (callHandleResponse) {
            // Re-input the response to the ai to see if it agrees with itself
            console.log(parsedResponse.safe_top3);
            setAiCallQueue(parsedResponse.safe_top3);
        }
    }

    useEffect(() => {
        console.log("Image B64 for AI:", imageB64ForAI);
        if (!actuallySendToAI) return; // Don't call AI if not set to do so
        console.log("actually send passed");
        if (!imageB64ForAI) return; // No image to process
        console.log("image exists");
        if (!awaitingAiResponse.current) {
            console.log("not waiting for ai response, hence calling AI model");
            awaitingAiResponse.current = true;
            if (recheckText) {
                callAiModel(recheckText, false).then(() => {
                    // Retrigger ai queue so next item can be processed
                    setAiCallQueue([...aiCallQueue]); // Update the state to trigger re-render
                }); // Call AI with recheck text if it exists       
            } else {
                callAiModel();
            }
        } else {
            console.warn("Already awaiting AI response, skipping this call.");
        }
    }, [imageB64ForAI]);

    useEffect(() => {
        console.log("AI Call Queue:", aiCallQueue);
        console.log("AI Call Queue Length", aiCallQueue.length);
        if (aiCallQueue.length > 0) {
            const aiCall = aiCallQueue.pop(); // Remove the first item from the queue
            console.log(`ID: ${aiCall.id}, Rationale: ${aiCall.rationale}`);
            const recheckText = `This is what we have been told based on the provided image. Grid ID: ${aiCall.id}, Rationale: ${aiCall.rationale}; Do you agree with this assessment or do you have a different opinion? Keep your response to maximum 100 words.
            This would be unsuitable anything resembling a human, clothing, or otherwise could be indangered. Please response in the format: { "id": "${aiCall.id}", "valid_landing_site": <true/false>, "reason": "<50 words maximum>" }
            - The image has been masked so that you only see the grid id cell provided, please ultra analyse it.
            - Bare in mind that anything that looks like an object in the image may be a hazard to the drone itself, and therefore that would make that landing site unsuitable.
            - If you are unsure, always say false, and provide a reason why you are unsure.
            - Pay close attention as to whether there are many colours in the cell grid provided, this indicates obstacles, regardless of it being obvious or not.
            // - If there is a monotone colour, this should indicate a safe landing site, but you must still provide a reason why.`;
            // const recheckText = `This is what we have been told based on the provided image. Grid ID: ${aiCall.id}, Rationale: ${aiCall.rationale}; Do you agree with this assessment or do you have a different opinion?
            // Anything resembling a human, clothing, or otherwise that could be indangered - would render this landing spot unsuitable and unsafe. Please respond in the format: { "id": "${aiCall.id}", "valid_landing_site": <true/false>, "reason": "<50 words maximum>" }
            // - The image has been masked so you can focus only on the grid id cell provided, please ultra analyse it.
            // - Bare in mind that anything that looks like an object in the image may be a hazard to the drone itself, and therefore that would make that landing site unsuitable.
            // - If you are unsure, always say false, and provide a reason why you are unsure.
            // - Pay close attention to the amount of colours in the cell grid provided, a high amount of strong variation could indicate obstacles, regardless of it being obvious or not.
            // - If there is a monotone colour, this should indicate a safe landing site, but you must still provide a reason why.`;
            setRecheckText(recheckText);
            setActuallySendToAI(true); // Set to true to allow AI calls again
            setKeepParticularCell(aiCall.id)
        }
    }, [aiCallQueue]);

    return (
        <div>
            <ImagePicker
                setB64ForAI={setImageB64ForAI}
                soleCellToKeep={keepParticularCell ? keepParticularCell : undefined}
            />
            {/* <div className="image-box">IMAGE BOX</div>
            <div className="right-panel">RIGHT PANEL</div>
            <div className="bottom-panel">BOTTOM PANEL</div> */}
        </div>
    );
}