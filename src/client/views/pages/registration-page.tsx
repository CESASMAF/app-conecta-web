import type { FC } from "hono/jsx/dom"
import { useReducer, useEffect } from "hono/jsx/dom"
import { css } from "hono/css"
import { space } from "../../styles/tokens.ts"
import { wizardReducer } from "../../viewmodels/registration/reducer.ts"
import { initialState } from "../../viewmodels/registration/types.ts"
import { saveDraft, loadDraft, clearDraft } from "../../viewmodels/registration/persistence.ts"
import { patientService } from "../../services/patient-service.ts"
import { WizardNavBar } from "../components/registration/wizard-nav-bar.tsx"
import { WizardHeader } from "../components/registration/wizard-header.tsx"
import { WizardStepper } from "../components/registration/wizard-stepper.tsx"
import { WizardButtonBar } from "../components/registration/wizard-button-bar.tsx"
import { StepPersonalData } from "../components/registration/step-personal-data.tsx"
import { StepDocuments } from "../components/registration/step-documents.tsx"
import { StepAddress } from "../components/registration/step-address.tsx"
import { StepDiagnoses } from "../components/registration/step-diagnoses.tsx"
import { StepFamily } from "../components/registration/step-family.tsx"
import { StepSpecificities } from "../components/registration/step-specificities.tsx"
import { StepIntake } from "../components/registration/step-intake.tsx"
import { ErrorBanner } from "../components/ui/error-banner.tsx"

const TOTAL_STEPS = 7

const pageStyle = css`
  display: flex;
  flex-direction: column;
  gap: ${space[5]};
  padding: ${space[5]} ${space[6]};
  max-width: 960px;
  margin: 0 auto;
`

export const RegistrationPage: FC = () => {
  const [state, dispatch] = useReducer(wizardReducer, loadDraft() ?? initialState)

  useEffect(() => { saveDraft(state) }, [state])

  const handleNext = async (): Promise<void> => {
    if (state.currentStep === TOTAL_STEPS - 1) {
      dispatch({ type: "SAVE_START" })
      const result = await patientService.create(state)
      if (result.ok) {
        clearDraft()
        dispatch({ type: "SAVE_SUCCESS", message: "Cadastro salvo com sucesso!" })
      } else {
        dispatch({ type: "SAVE_FAILURE", message: result.error.message })
      }
    } else {
      dispatch({ type: "NEXT_STEP" })
    }
  }

  const handleBack = (): void => { dispatch({ type: "PREV_STEP" }) }
  const errors = state.showErrors ? state.errors : new Map<string, string>()

  const updateField = (section: string) => (field: string, value: string): void => {
    dispatch({ type: "UPDATE_FIELD", section, field, value })
  }

  return (
    <div class={pageStyle}>
      <WizardNavBar />
      <WizardHeader />
      <WizardStepper currentStep={state.currentStep} />

      {state.saveResult && !state.saveResult.ok && (
        <ErrorBanner message={state.saveResult.message} />
      )}

      {state.currentStep === 0 && (
        <StepPersonalData fields={state.fields} errors={errors} onUpdate={updateField("fields")} />
      )}
      {state.currentStep === 1 && (
        <StepDocuments documents={state.documents} errors={errors} onUpdate={updateField("documents")} />
      )}
      {state.currentStep === 2 && (
        <StepAddress address={state.address} errors={errors} onUpdate={updateField("address")} />
      )}
      {state.currentStep === 3 && (
        <StepDiagnoses
          diagnoses={state.diagnoses}
          errors={errors}
          onUpdateEntry={(index, field, value) => {
            // APPLY_QUICK_CID updates code+description; for date, we pass current values
            const diag = state.diagnoses[index]
            if (!diag) return
            const updated = { ...diag, [field]: value }
            dispatch({ type: "APPLY_QUICK_CID", index, code: updated.code, description: updated.description })
          }}
          onAddDiagnosis={() => dispatch({ type: "ADD_DIAGNOSIS" })}
          onRemoveDiagnosis={(i) => dispatch({ type: "REMOVE_DIAGNOSIS", index: i })}
          onApplyQuickCid={(i, code, desc) => dispatch({ type: "APPLY_QUICK_CID", index: i, code, description: desc })}
        />
      )}
      {state.currentStep === 4 && (
        <StepFamily
          familyMembers={state.familyMembers}
          onAddMember={(m) => dispatch({ type: "ADD_FAMILY_MEMBER", member: m })}
          onRemoveMember={(i) => dispatch({ type: "REMOVE_FAMILY_MEMBER", index: i })}
        />
      )}
      {state.currentStep === 5 && (
        <StepSpecificities specificity={state.specificity} errors={errors} onUpdate={updateField("specificity")} />
      )}
      {state.currentStep === 6 && (
        <StepIntake
          intake={state.intake}
          errors={errors}
          onUpdate={updateField("intake")}
          onToggleProgram={(id) => dispatch({ type: "TOGGLE_PROGRAM", programId: id })}
        />
      )}

      <WizardButtonBar
        currentStep={state.currentStep}
        totalSteps={TOTAL_STEPS}
        saving={state.saving}
        onBack={handleBack}
        onNext={handleNext}
      />
    </div>
  )
}
