import { useContext, useRef } from "react";
import { DroneTestResults } from "../../DroneTest";

export const ScenarioScreen = ({
    imgSource,
    experimentStep,
    setExperimentStep,
    aiScenario,
}: {
    imgSource: string;
    experimentStep: number;
    setExperimentStep: (step: number) => void;
    aiScenario?: boolean;
}) => {
    const { participantId } = useContext(DroneTestResults);
    const imgSrc = useRef<string>(imgSource);
    // Track the start time of the scenario for decision time tracking
    const scenarioStartTracker = useRef<number>(window.performance.now());

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

        const constructedPId = `${participantId}--${experimentStep}`;

        // POST the form data to the server
        fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pid: constructedPId,
                data: {
                    imgSource: imgSrc.current,
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
                <h4 data-balloon-length='fit' data-balloon-pos="up" data-balloon-break style={{ color: 'teal', cursor: 'help' }} aria-label={'1. Please answer every question unless it is marked as optional.\n\n2. Think about the simulator scenario you just completed when answering Section B items.\n\n3. If you decide to stop at any point, simply close your browser -\n none of your answers will be saved for the current iteration (past submissions will be).'}>Hover/Tap here to view help info</h4>
                <p>.</p>
                <div>
                    <img style={{ width: '60vw' }} src={`../../../public/ai_scenario_results/${imgSrc.current}/AI_SCENARIO_OUTPUT--top-three-highlighted.png`}></img>
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
                            Trust in the AI System for this scenario (assuming it operated independantly)
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
                    <button style={{ marginTop: '5vh' }} onClick={handleClick}>{experimentStep < 17 ? 'Submit & Continue' : 'Complete Experiment'}</button>
                </form>
            </div>
        </div>
    );
}
