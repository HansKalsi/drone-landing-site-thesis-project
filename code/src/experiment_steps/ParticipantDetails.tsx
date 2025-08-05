import { ScenarioScreen } from "./shared/ScenarioScreen";

export const ParticipantDetails = ({
    experimentStep,
    setExperimentStep,
}: {
    experimentStep: number;
    setExperimentStep: (step: number) => void;
}) => {


    return (
        <>
            <ScenarioScreen experimentStep={experimentStep} setExperimentStep={setExperimentStep} />
        </>
    )
}