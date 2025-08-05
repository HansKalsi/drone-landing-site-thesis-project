import { useContext } from "react";
import { DroneTestResults } from "../DroneTest";

export const ParticipantDetails = ({
    setCompletedDetails
}: {
    setCompletedDetails: (value: boolean) => void;
}) => {
    const { participantId } = useContext(DroneTestResults);

    function handleClick(e: any) {
        e.preventDefault();
        e.stopPropagation();

        // Collect the form data
        const formData = new FormData(e.target.form);
        const flightHours = formData.get('flightHours') as string;
        const picHours = formData.get('picHours') as string;
        const flyingExperience = formData.get('flyingExperience') as string;

        // Construct the participant ID
        const constructedPId = `${participantId}--details`;

        // POST the form data to the server
        fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pid: constructedPId,
                data: {
                    flightHours,
                    picHours,
                    flyingExperience,
                }
            }),
        })
        .then(response => {
            console.log("Participant details submitted successfully:", response);
            setCompletedDetails(true);
        });
    }

    return (
        <div>
            <h1>Participant Details</h1>
            <form>
                {/* Total flight hours (as a drone operator and/or airplane pilot) */}
                <label>
                    Total flight hours (as a drone operator and/or airplane pilot):
                    <select id="flightHours" name="flightHours" defaultValue={0} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="0">0-500 hours</option>
                        <option value="501">501-1500 hours</option>
                        <option value="1501">1501-3000 hours</option>
                        <option value="3000">3000+ hours</option>
                    </select>
                </label>
                {/* Pilot-in-command hours */}
                <label>
                    Pilot-in-command hours:
                    <select id="picHours" name="picHours" defaultValue={0} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="0">0-200 hours</option>
                        <option value="201">201-800 hours</option>
                        <option value="801">801-1500 hours</option>
                        <option value="1500">1500+ hours</option>
                    </select>
                </label>
                {/* Do they have flying experience yes/no */}
                <label>
                    Do you have flying (including drone operation) experience?
                    <select id="flyingExperience" name="flyingExperience" defaultValue="yes" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <button onClick={handleClick} style={{ marginTop: '5vh' }}>Submit & Continue</button>
            </form>
        </div>
    )
}
