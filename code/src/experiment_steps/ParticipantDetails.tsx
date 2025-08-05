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
            <ScenarioScreen imgSource="very_hard_land" experimentStep={experimentStep} setExperimentStep={setExperimentStep} />
        </>
    )
}
