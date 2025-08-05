import { createContext, useState } from 'react';
import { LoginScreen } from './LoginScreen';
import { ParticipantDetails } from './experiment_steps/ParticipantDetails';
import { ScenarioScreen } from './experiment_steps/shared/ScenarioScreen';
import { PostStudy } from './experiment_steps/PostStudy';

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
    const [completedDetails, setCompletedDetails] = useState<boolean>(false);

    const aiScenarioDesc = "This scenario involves a drone equipped with an onboard AI that has lost communication with its operator. The AI has analyzed the provided image and suggests potential landing sites. You need to evaluate the AI's suggestions and select the best landing site(s) based on your judgment (out of the three highlighted cells) and fill out the accessory information.";
    const nonAiScenarioDesc = "You are a drone operator who has lost communication with your drone. You need to select the best landing site for your drone based on the provided image. Please fill in the form to submit your decision(s).";

    return (
        <DroneTestConsent.Provider value={{ loggedIn, setLoggedIn }}>
            <DroneTestResults.Provider value={{ participantId, setParticipantId, answers, setAnswers }}>
            {!loggedIn ? (
                <LoginScreen />
            ) : !completedDetails ? (
                <ParticipantDetails setCompletedDetails={setCompletedDetails} />
            ) : (
                (() => {
                    switch (experimentStep) {
                        // Onboard AI scenarios
                        case 0:
                            return <ScenarioScreen imgSource="mixed_land_two" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 1:
                            return <ScenarioScreen imgSource="medium_land_two" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 2:
                            return <ScenarioScreen imgSource="difficult_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 3:
                            return <ScenarioScreen imgSource="water_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 4:
                            return <ScenarioScreen imgSource="difficult_roundabout" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 5:
                            return <ScenarioScreen imgSource="potentially_unlandable" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 6:
                            return <ScenarioScreen imgSource="easy_land_three" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 7:
                            return <ScenarioScreen imgSource="very_hard_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 8:
                            return <ScenarioScreen imgSource="rough_ground" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 9:
                            return <ScenarioScreen imgSource="mixed_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 10:
                            return <ScenarioScreen imgSource="medium_land_three" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        case 11:
                            return <ScenarioScreen imgSource="small_safe_area" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={aiScenarioDesc} aiScenario />;
                        // Non-AI scenarios
                        case 12:
                            return <ScenarioScreen imgSource="medium_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 13:
                            return <ScenarioScreen imgSource="very_hard_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 14:
                            return <ScenarioScreen imgSource="easy_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 15:
                            return <ScenarioScreen imgSource="potentially_unlandable_two" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 16:
                            return <ScenarioScreen imgSource="medium_land_three" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 17:
                            return <ScenarioScreen imgSource="easy_medium_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 18:
                            return <ScenarioScreen imgSource="rough_ground" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 19:
                            return <ScenarioScreen imgSource="difficult_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 20:
                            return <ScenarioScreen imgSource="water_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 21:
                            return <ScenarioScreen imgSource="potentially_unlandable_three" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 22:
                            return <ScenarioScreen imgSource="mixed_land_two" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 23:
                            return <ScenarioScreen imgSource="easy_land_four" experimentStep={experimentStep} setExperimentStep={setExperimentStep} scenarioDescription={nonAiScenarioDesc} />;
                        case 24:
                            return <PostStudy experimentStep={experimentStep} setExperimentStep={setExperimentStep} />
                        default:
                            return <>
                                <h1>Experiment Completed</h1>
                                <h1>Thank You For Participating❣️</h1>
                                <h3>You can close this window/tab.</h3>
                            </>;
                        }
                })()
            )}
            </DroneTestResults.Provider>
        </DroneTestConsent.Provider>
    );
}
