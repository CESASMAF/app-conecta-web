import type { FC } from "hono/jsx/dom"
import { useReducer, useEffect } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { color, font, weight, alpha } from "../../styles/tokens.ts"
import { wizardReducer } from "../../viewmodels/registration/reducer.ts"
import { initialState } from "../../viewmodels/registration/types.ts"
import { saveDraft, loadDraft, clearDraft } from "../../viewmodels/registration/persistence.ts"
import { patientService } from "../../services/patient-service.ts"
import { AppSidebar } from "../components/patient/app-sidebar.tsx"
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
import { SuccessOverlay } from "../components/registration/success-overlay.tsx"

const TOTAL_STEPS = 7

const STEPS = [
  { number: "Etapa 01", title: "Dados Pessoais", desc: "Informações básicas da pessoa de referência." },
  { number: "Etapa 02", title: "Documentos", desc: "CPF, NIS, CNS e documentos de identificação." },
  { number: "Etapa 03", title: "Endereço", desc: "Situação de moradia e localização." },
  { number: "Etapa 04", title: "Diagnósticos", desc: "Pelo menos um diagnóstico é obrigatório." },
  { number: "Etapa 05", title: "Composição Familiar", desc: "Membros da família (opcional)." },
  { number: "Etapa 06", title: "Especificidades (opcional)", desc: "Identidade social, étnica ou cultural." },
  { number: "Etapa 07", title: "Ingresso", desc: "Tipo de ingresso e motivo do atendimento." },
] as const

const bodyOverride = css`
  :-hono-global {
    body { background: ${color.bgSageDeep} !important; }
  }
`

const bgGradient = css`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${color.bgBase} 0%, ${color.bgWarm} 25%, ${color.bgSage} 55%, ${color.bgSageDeep} 100%);
`

const bgBlob1 = css`
  position: fixed;
  top: -10%;
  right: 5%;
  width: min(450px, 50vw);
  height: min(450px, 50vw);
  border-radius: 50%;
  background: radial-gradient(circle, ${alpha(color.primary, 0.06)} 0%, transparent 70%);
  z-index: 0;
`

const bgBlob2 = css`
  position: fixed;
  bottom: -15%;
  left: 10%;
  width: min(500px, 55vw);
  height: min(500px, 55vw);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 160, 100, 0.04) 0%, transparent 70%);
  z-index: 0;
`

const appLayout = css`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`

const mainContent = css`
  margin-left: 64px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1rem, 0.5rem + 2vw, 2rem);
  overflow-y: auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`

const containerFadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`

const glassCardStyle = css`
  background: ${color.bgCard};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid ${color.bgCardBorder};
  border-radius: 20px;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1.5rem, 1rem + 2vw, 2.75rem);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: min(90%, 48rem);
  animation: ${containerFadeIn} 600ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
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
        dispatch({ type: "SAVE_SUCCESS", message: "Cadastro realizado!" })
      } else {
        dispatch({ type: "SAVE_FAILURE", message: result.error.message })
      }
    } else {
      dispatch({ type: "NEXT_STEP" })
    }
  }

  const handleBack = (): void => { dispatch({ type: "PREV_STEP" }) }
  const errors = state.showErrors ? state.errors : new Map<string, string>()
  const step = STEPS[state.currentStep]

  const updateField = (section: string) => (field: string, value: string): void => {
    dispatch({ type: "UPDATE_FIELD", section, field, value })
  }

  return (
    <>
      <div class={bodyOverride} />
      <div class={bgGradient} />
      <div class={bgBlob1} />
      <div class={bgBlob2} />

      <div class={appLayout}>
        <AppSidebar userName="Usuario" userInitials="US" familyCount={0} activeItem="cadastro" />

        <main class={mainContent}>
          <WizardNavBar />
          <WizardStepper currentStep={state.currentStep} />

          <div class={glassCardStyle} key={state.currentStep}>
            {step && (
              <WizardHeader stepNumber={step.number} title={step.title} description={step.desc} />
            )}

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
                  dispatch({ type: "UPDATE_DIAGNOSIS_FIELD", index, field, value })
                }}
                onAddDiagnosis={() => dispatch({ type: "ADD_DIAGNOSIS" })}
                onRemoveDiagnosis={(i) => dispatch({ type: "REMOVE_DIAGNOSIS", index: i })}
                onApplyQuickCid={(i, code, desc) => dispatch({ type: "APPLY_QUICK_CID", index: i, code, description: desc })}
              />
            )}
            {state.currentStep === 4 && (
              <StepFamily
                referencePerson={{
                  firstName: state.fields.firstName,
                  lastName: state.fields.lastName,
                  birthDate: state.documents.birthDate,
                  gender: state.fields.gender,
                }}
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
        </main>
      </div>

      {state.saveResult?.ok && (
        <SuccessOverlay
          message={state.saveResult.message}
          onNewRegistration={() => {
            clearDraft()
            globalThis.location.reload()
          }}
        />
      )}
    </>
  )
}
