import { createContext, useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { ParticipantDetails } from './experiment_steps/ParticipantDetails';
import { ScenarioScreen } from './experiment_steps/shared/ScenarioScreen';

export const DroneTestConsent = createContext<{
    loggedIn: boolean;
    setLoggedIn: (value: boolean) => void;
}>({
    loggedIn: false,
    setLoggedIn: () => {}
})

export const DroneTestResults = createContext<{
    participantId: string;
    setParticipantId: (value: string) => void;
    answers: object;
    setAnswers: (value: object) => void;
}>({
    participantId: 'Unknown',
    setParticipantId: () => {},
    answers: {},
    setAnswers: () => {}
});

export const DroneTest = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [participantId, setParticipantId] = useState<string>('Unknown');
    const [answers, setAnswers] = useState<object>({});
    const [experimentStep, setExperimentStep] = useState<number>(0);

    // Record answers to database when the user is finished
    async function handleFinish(pid: string, answers: object) {
        console.log("Recording answers for participant:", pid, answers);
        await fetch('/api/route', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pid, data: answers }),
        });
    }

    function handleClick() {
        setLoggedIn(false);
        handleFinish(participantId, answers);
    }

    return (
        <DroneTestConsent.Provider value={{ loggedIn, setLoggedIn }}>
            <DroneTestResults.Provider value={{ participantId, setParticipantId, answers, setAnswers }}>
            {!loggedIn ? (
                <LoginScreen />
            ) : (
                (() => {
                    switch (experimentStep) {
                        case 0:
                            return <ScenarioScreen imgSource="very_hard_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} />;
                    }
                })()
            )}
            </DroneTestResults.Provider>
        </DroneTestConsent.Provider>
    );
}
