import { useContext, useEffect, useState } from 'react';
import { DroneTestConsent } from './DroneTest';

export const LoginScreen = () => {
    const { setLoggedIn } = useContext(DroneTestConsent);
    const [consent, setConsent] = useState(false);
    const [withdrawal, setWithdrawal] = useState(false);
    const [confidentiality, setConfidentiality] = useState(false);
    const [participantId, setParticipantId] = useState<string>('Unknown');
    
    useEffect(() => {
        console.log("change checked")
        if (consent && withdrawal && confidentiality) {
            // Generate a unqiue participant ID for the user based on the current ms time
            const participantIdTemp = Date.now().toString();
            console.log("all checked", participantIdTemp);
            setParticipantId(participantIdTemp);
        } else {
            console.log("not all checked");
            setParticipantId('Unknown');
        }
    }, [consent, withdrawal, confidentiality]);

    function formOnSubmit(e: any) {
        // Record the user's consent and other details
        e.preventDefault();
        e.stopPropagation();
        if (participantId !== 'Unknown') {
            console.log("Form submitted with participant ID:", participantId);
            // Here you would typically send the data to your server or API
            setLoggedIn(true);
        } else {
            console.error("Please complete all consent checkboxes before submitting.");
        }
    }

    return (
        <div>
            <h1>Hans' MSc Thesis Experiment (~20mins)</h1>
            <h2>Explainable On-Board AI for Safe-Landing Site Selection in Lost-Link Drone Emergencies</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px', margin: 'auto' }}>
                <label>
                    <input id='consent' type="checkbox" required onChange={() => setConsent(!consent)} />
                    I have read the <a href='/docs/online-participant-information-sheet.pdf' download='DroneParticipationDocument.pdf' target='_blank' rel="noopener noreferrer">Participant Information</a> document and agree to all fields in the <a href='/docs/Research_Consent_Form.pdf' download='DroneConsentForm.pdf' target='_blank' rel="noopener noreferrer">Consent Form</a>.
                </label>
                <br />
                <label>
                    <input id='withdrawal' type="checkbox" required onChange={() => setWithdrawal(!withdrawal)} />
                    I understand that I can withdraw from the study at any time without penalty (by reaching out and providing my unique participant ID).
                </label>
                <br />
                <label>
                    <input id='confidentiality' type="checkbox" required onChange={() => setConfidentiality(!confidentiality)} />
                    I understand that my anonymous data will be used for research purposes only and will be kept confidential.
                </label>
                <input id='p_id' hidden defaultValue={participantId}></input>
                <h3>Participant ID: {participantId}</h3>
                <p>Note: Please save your Participant ID, as you will need it if you later decide to withdraw from the study.</p>
                <button onClick={formOnSubmit}>Log In</button>
            </form>
        </div>
    );
}
