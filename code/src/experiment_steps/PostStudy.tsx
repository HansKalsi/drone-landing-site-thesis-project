import { useContext } from "react";
import { DroneTestResults } from "../DroneTest";

export const PostStudy = ({
    experimentStep,
    setExperimentStep
}: {
    experimentStep: number;
    setExperimentStep: (step: number) => void;
}) => {
    const { participantId } = useContext(DroneTestResults);


    function handleClick(e: any) {
        e.preventDefault();
        e.stopPropagation();
        
        // Collect the form data
        const formData = new FormData(e.target.form);
        const realistic = formData.get('realistic') as string;
        const aiRationales = formData.get('aiRationales') as string;
        const usefulAI = formData.get('usefulAI') as string;
        const mentalWorkload = formData.get('mentalWorkload') as string;
        const comfortableAI = formData.get('comfortableAI') as string;
        const aiInterference = formData.get('aiInterference') as string;
        const additionalFeedback = formData.get('additionalFeedback') as string;

        // Construct the participant ID
        const constructedPId = `${participantId}--post-study`;

        // POST the form data to the server
        fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pid: constructedPId,
                data: {
                    realistic,
                    aiRationales,
                    usefulAI,
                    mentalWorkload,
                    comfortableAI,
                    aiInterference,
                    additionalFeedback
                }
            }),
        })
        .then(response => {
            console.log("Post-study feedback submitted successfully:", response);
            // Set the experiment step to 0 to conclude the experiment
            setExperimentStep(experimentStep + 1);
        });
    }

    return (
        <div>
            <h1>Post-Study Reflection</h1>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '600px', margin: 'auto' }}>
                <label>
                    The simulator scenarios were realistic:
                    <select id="realistic" name="realistic" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    The AI rationales were clear:
                    <select id="aiRationales" name="aiRationales" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    I think this AI system would be useful in real operational scenarios:
                    <select id="usefulAI" name="usefulAI" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    The task required a high mental workload:
                    <select id="mentalWorkload" name="mentalWorkload" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    I would be comfortable relying on an autonomous drone that uses this Onboard AI in a loss of connection emergency:
                    <select id="comfortableAI" name="comfortableAI" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    The AI suggestions interfered with my own decision-making:
                    <select id="aiInterference" name="aiInterference" defaultValue={3} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="1">1 Strongly Disagree</option>
                        <option value="2">2 Disagree</option>
                        <option value="3">3 Neutral</option>
                        <option value="4">4 Agree</option>
                        <option value="5">5 Strongly Agree</option>
                    </select>
                </label>
                <label>
                    Anything else you would like to tell us?
                    <textarea
                        id="additionalFeedback"
                        name="additionalFeedback"
                        rows={5}
                        placeholder="Please provide any additional feedback or comments you have about the experiment."
                        style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
                    ></textarea>
                </label>
                <button onClick={handleClick}>Submit & Conclude Experiment</button>
            </form>
        </div>
    );
}