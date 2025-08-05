import { useContext, useEffect, useRef, useState } from "react";
import { DroneTestResults } from "../../DroneTest";

export const ScenarioScreen = ({
    imgSource,
    experimentStep,
    setExperimentStep,
    aiScenario,
    scenarioDescription,
}: {
    imgSource: string;
    experimentStep: number;
    setExperimentStep: (step: number) => void;
    aiScenario?: boolean;
    scenarioDescription?: string;
}) => {
    const { participantId } = useContext(DroneTestResults);
    const [imgSrc, setImgSrc] = useState<string>('');
    // Track the start time of the scenario for decision time tracking
    const scenarioStartTracker = useRef<number>(window.performance.now());
    // Grab JSON data from file
    const [jsonData, setJsonData] = useState<any>({});
    const [aiLandingSites, setAiLandingSites] = useState<any[]>([]);

    useEffect(() => {
        setImgSrc(imgSource);
    }, [imgSource]);

    useEffect(() => {
        if (imgSrc) {
            const jsonUrl = `/ai_scenario_results/${imgSrc}/AI_SCENARIO_OUTPUT--ai-output-and-metadata.json`;
            
            fetch(jsonUrl)
              .then((r) => r.ok ? r.json() : Promise.reject(r))
              .then(setJsonData);
        }
    }, [imgSrc]);

    useEffect(() => {
        if (!aiScenario) {
            return;
        }
        console.log("jsonData", jsonData);
        const entries = Object.entries(jsonData);
        console.log("jsonData", entries);
        if (entries.length > 0) {
            console.log(entries);
            setAiLandingSites(Array.isArray(entries[2][1]) ? entries[2][1] : []);
        }
    }, [jsonData]);

    function handleClick(e: any) {
        e.preventDefault();
        e.stopPropagation();

        // Record the decision time
        const decisionTime = window.performance.now() - scenarioStartTracker.current;

        // console log form data
        const formData = new FormData(e.target.form);
        const idealLandingSites = formData.get('idealLandingSites');
        const rationale = formData.get('rationale');
        const perceivedSafety = formData.get('perceivedSafety');
        const confidence = formData.get('confidence');
        const aiAccuracy = formData.get('aiAccuracy');
        const aiTrust = formData.get('aiTrust');

        const constructedPId = `${participantId}--scenario-${experimentStep}`;

        // POST the form data to the server
        fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pid: constructedPId,
                data: {
                    imgSource: imgSrc,
                    idealLandingSites,
                    rationale,
                    perceivedSafety,
                    confidence,
                    aiAccuracy: aiScenario ? aiAccuracy : undefined,
                    aiTrust: aiScenario ? aiTrust : undefined,
                    decisionTime: decisionTime,
                }
            }),
        })
        .then(response => {
            console.log("Form data submitted successfully:", response);
            // Reset the tracker for the next scenario
            scenarioStartTracker.current = window.performance.now();
            // Increment the experiment step
            setExperimentStep(experimentStep + 1);
        })
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', gap: '20px' }}>
            <div style={{ width: '65vw' }}>
                <h1>Scenario Screen</h1>
                {/* Easy Tooltip */}
                <link rel="stylesheet" href="https://unpkg.com/balloon-css/balloon.min.css"></link>
                <h4 data-balloon-length='fit' data-balloon-pos="down" data-balloon-break style={{ color: 'teal', cursor: 'help' }} aria-label={'1. Please answer every question unless it is marked as optional.\n\n2. If you decide to stop at any point, simply close your browser -\n none of your answers will be saved for the current scenario (past submissions will be).\n\n3. You may need to scroll down on the image to see the whole image.\n\n4. ' + scenarioDescription}>Hover/Tap here to view help info</h4>
                {aiScenario && <div>{aiLandingSites.map((site: { id: string, rationale: string, valid_landing_site: boolean }) =>  <p><strong style={{ color: 'lightgreen' }}>{site.id}:</strong> <i>{site.rationale}</i></p>)}</div>}
                <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '20px' }}>
                    <img style={{ width: '60vw' }} src={`/ai_scenario_results/${imgSrc}/${aiScenario ? 'AI_SCENARIO_OUTPUT--top-three-highlighted.png' : 'AI_SCENARIO_OUTPUT--grid-overlay.png'}`}></img>
                </div>
            </div>
            <div style={{ width: '25vw' }}>
                <form>
                    <label>
                        Ideal Landing Sites (up to three) [leave blank if none]
                        <input
                            id="idealLandingSites"
                            name="idealLandingSites"
                            type="text"
                            placeholder="A3, B4, C5"
                            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        />
                    </label>
                    <label>
                        Rationale for choices / no-choice
                        {/* big textbox */}
                        <textarea
                            id="rationale"
                            name="rationale"
                            rows={5}
                            placeholder="E.g: 'I chose A3 because it is the safest option with no obstacles.' or 'Possibly F5, but nothing is ideal.'"
                            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                        ></textarea>
                    </label>
                    <label>
                        Perceived safety of your choice(s)
                        <select id="perceivedSafety" name="perceivedSafety" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                            <option value="1">1 - Not safe at all</option>
                            <option value="2">2 - Slightly safe</option>
                            <option value="3">3 - Moderately safe</option>
                            <option value="4">4 - Very safe</option>
                            <option value="5">5 - Extremely safe</option>
                        </select>
                    </label>
                    <label>
                        Confidence in your decision
                        <select id="confidence" name="confidence" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                            <option value="1">1 - Not at all confident</option>
                            <option value="2">2 - Slightly confident</option>
                            <option value="3">3 - Moderately confident</option>
                            <option value="4">4 - Very confident</option>
                            <option value="5">5 - Extremely confident</option>
                        </select>
                    </label>
                    {aiScenario && (
                    <>
                        <label>
                            Accuracy of the AI's suggestions
                            <select id="aiAccuracy" name="aiAccuracy" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                                <option value="1">1 - Not accurate at all</option>
                                <option value="2">2 - Slightly accurate</option>
                                <option value="3">3 - Moderately accurate</option>
                                <option value="4">4 - Very accurate</option>
                                <option value="5">5 - Extremely accurate</option>
                            </select>
                        </label>
                        <label>
                            Trust in the Onboard AI for this scenario (assuming it operated independantly)
                            <select id="aiTrust" name="aiTrust" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                                <option value="1">1 - No trust at all</option>
                                <option value="2">2 - Slightly trusting</option>
                                <option value="3">3 - Moderately trusting</option>
                                <option value="4">4 - Very trusting</option>
                                <option value="5">5 - Extremely trusting</option>
                            </select>
                        </label>
                    </>
                    )}
                    <button style={{ marginTop: '5vh' }} onClick={handleClick}>{experimentStep < 23 ? 'Submit & Continue' : 'Complete Experiment'}</button>
                </form>
            </div>
        </div>
    );
}
