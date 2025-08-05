import { createContext, useState } from 'react';
import { LoginScreen } from './LoginScreen';

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
                <div>
                    <h1>Welcome to the Drone Test</h1>
                    <button onClick={handleClick}>Log Out</button>
                </div>
            )}
            </DroneTestResults.Provider>
        </DroneTestConsent.Provider>
    );
}
