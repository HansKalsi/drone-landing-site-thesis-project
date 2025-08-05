export const ScenarioScreen = ({
    experimentStep,
    setExperimentStep,
}: {
    experimentStep: number;
    setExperimentStep: (step: number) => void;
}) => {
    return (
        <div>
            <h1>Scenario Screen</h1>
            <p>This is the scenario screen where you can provide details about the scenario.</p>
            <button onClick={() => setExperimentStep(experimentStep+1)}>Next Step</button>
        </div>
    );
}