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

    return (
        <DroneTestConsent.Provider value={{ loggedIn, setLoggedIn }}>
            {!loggedIn ? (
                <LoginScreen />
            ) : (
                <div>
                    <h1>Welcome to the Drone Test</h1>
                    <button onClick={() => setLoggedIn(false)}>Log Out</button>
                </div>
            )}
        </DroneTestConsent.Provider>
    );
}
