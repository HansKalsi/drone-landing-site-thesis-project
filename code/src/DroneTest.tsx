import { createContext, useState } from 'react';
import { LoginScreen } from './LoginScreen';

export const DroneTestConsent = createContext<{
    loggedIn: boolean;
    setLoggedIn: (value: boolean) => void;
}>({
    loggedIn: false,
    setLoggedIn: () => {}
})

export const DroneTest = () => {
    const [loggedIn, setLoggedIn] = useState(false);

    // Record answers to database when the user is finished
    async function handleFinish(pid: string, answers: object) {
        await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid, data: answers }),
        });
    }

    function handleClick() {
        setLoggedIn(false);
        handleFinish('TEST', { answer1: 'value1', answer2: 'value2' });
    }

    return (
        <DroneTestConsent.Provider value={{ loggedIn, setLoggedIn }}>
            {!loggedIn ? (
                <LoginScreen />
            ) : (
                <div>
                    <h1>Welcome to the Drone Test</h1>
                    <button onClick={handleClick}>Log Out</button>
                </div>
            )}
        </DroneTestConsent.Provider>
    );
}
