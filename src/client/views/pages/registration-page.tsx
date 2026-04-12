import type { FC } from "hono/jsx/dom";
import { useEffect, useReducer } from "hono/jsx/dom";
import { css } from "hono/css";
import { easing, sage } from "../../styles/tokens.ts";
import {
  containerFadeIn,
  sageCard,
  sageTextHeading,
  sageTextMuted,
} from "../../styles/base.ts";
import { wizardReducer } from "../../viewmodels/registration/reducer.ts";
import { initialState } from "../../viewmodels/registration/types.ts";
import type { LocationType } from "../../viewmodels/registration/types.ts";
import {
  clearDraft,
  loadDraft,
  saveDraft,
} from "../../viewmodels/registration/persistence.ts";
import { patientService } from "../../services/patient-service.ts";
import { Sidebar } from "../components/registration/sidebar.tsx";
import { WizardTopBar } from "../components/registration/wizard-top-bar.tsx";
import { WizardStepper } from "../components/registration/wizard-stepper.tsx";
import { WizardButtonBar } from "../components/registration/wizard-button-bar.tsx";
import { SuccessOverlay } from "../components/registration/success-overlay.tsx";
import { StepPersonalData } from "../components/registration/step-personal-data.tsx";
import { StepDocuments } from "../components/registration/step-documents.tsx";
import { StepAddress } from "../components/registration/step-address.tsx";
import { StepDiagnoses } from "../components/registration/step-diagnoses.tsx";
import { StepFamily } from "../components/registration/step-family.tsx";
import { StepSpecificities } from "../components/registration/step-specificities.tsx";
import { StepIntake } from "../components/registration/step-intake.tsx";

const TOTAL_STEPS = 7;

const STEP_META = [
  {
    num: "01",
    title: "Dados Pessoais",
    desc: "Informacoes basicas do paciente.",
  },
  {
    num: "02",
    title: "Documentos",
    desc: "Documentos de identificacao civil.",
  },
  { num: "03", title: "Endereco", desc: "Localizacao e dados residenciais." },
  { num: "04", title: "Diagnosticos", desc: "Diagnosticos medicos e CIDs." },
  {
    num: "05",
    title: "Composicao Familiar",
    desc: "Membros do nucleo familiar.",
  },
  {
    num: "06",
    title: "Especificidades (opcional)",
    desc: "Identidade sociocultural.",
  },
  { num: "07", title: "Ingresso", desc: "Informacoes de entrada no servico." },
] as const;

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Sessao expirada. Faca login novamente.",
  FORBIDDEN: "Sem permissao para cadastrar.",
  VALIDATION_ERROR: "Dados invalidos. Revise os campos.",
  SERVER_ERROR: "Erro no servidor. Tente novamente.",
  NETWORK_ERROR: "Sem conexao. Verifique sua internet.",
  NOT_FOUND: "Servico indisponivel.",
};

// --- Layout Styles ---

const pageLayout = css`
  display: flex;
  min-height: 100vh;
  background: ${sage.bgBase};
`;

const mainContent = css`
  flex: 1;
  margin-left: 64px;
  padding: 24px 48px 48px;
  max-width: 900px;
  animation: ${containerFadeIn} 600ms ${easing.out};
  @media (max-width: 600px) {
    margin-left: 0;
    padding: 16px 20px 32px;
  }
`;

const wizardCardStyle = css`
  ${sageCard} padding: 40px;
  margin-top: 24px;
  @media (max-width: 600px) {
    padding: 24px 16px;
  }
`;

const stepHeaderStyle = css`
  margin-bottom: 32px;
`;

const stepNumStyle = css`
  font-family: ${sage.textSoft};
  font-size: 12px;
  font-weight: 600;
  color: ${sage.textSoft};
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const stepTitleStyle = css`
  ${sageTextHeading} font-size: 22px;
  margin: 0 0 4px;
`;

const stepDescStyle = css`
  ${sageTextMuted} margin: 0;
`;

// --- Main Page ---

export const RegistrationPage: FC = () => {
  const [state, dispatch] = useReducer(
    wizardReducer,
    loadDraft() ?? initialState,
  );

  useEffect(() => {
    saveDraft(state);
  }, [state]);

  const errors = state.showErrors ? state.errors : new Map<string, string>();
  const updateField =
    (section: string) => (field: string, value: string): void => {
      dispatch({ type: "UPDATE_FIELD", section, field, value });
    };
  const meta = STEP_META[state.currentStep] ?? STEP_META[0];
  const isLast = state.currentStep === TOTAL_STEPS - 1;
  const showSuccess = state.saveResult?.ok === true;

  const handleNext = async (): Promise<void> => {
    if (isLast) {
      dispatch({ type: "SAVE_START" });
      const result = await patientService.create(state);
      if (result.ok) {
        clearDraft();
        dispatch({
          type: "SAVE_SUCCESS",
          message: "Cadastro salvo com sucesso!",
        });
      } else {
        dispatch({
          type: "SAVE_FAILURE",
          message: ERROR_MESSAGES[result.error] ?? "Erro desconhecido.",
        });
      }
    } else {
      dispatch({ type: "NEXT_STEP" });
    }
  };

  return (
    <div class={pageLayout}>
      <Sidebar activeItem="cadastro" />
      <main class={mainContent}>
        <WizardTopBar draftSaved={state.currentStep > 0} />
        <WizardStepper
          currentStep={state.currentStep}
          onGoToStep={(step) => dispatch({ type: "GO_TO_STEP", step })}
        />
        <div class={wizardCardStyle}>
          <div class={stepHeaderStyle}>
            <div class={stepNumStyle}>Etapa {meta.num}</div>
            <h2 class={stepTitleStyle}>
              {meta.title}
            </h2>
            <p class={stepDescStyle}>{meta.desc}</p>
          </div>

          {state.currentStep === 0 && (
            <StepPersonalData
              fields={state.fields}
              errors={errors}
              onUpdate={updateField("fields")}
            />
          )}
          {state.currentStep === 1 && (
            <StepDocuments
              documents={state.documents}
              errors={errors}
              onUpdate={updateField("documents")}
            />
          )}
          {state.currentStep === 2 && (
            <StepAddress
              address={state.address}
              errors={errors}
              onUpdate={updateField("address")}
              onSetLocationType={(lt: LocationType) =>
                dispatch({ type: "SET_LOCATION_TYPE", locationType: lt })}
            />
          )}
          {state.currentStep === 3 && (
            <StepDiagnoses
              diagnoses={state.diagnoses}
              errors={errors}
              onUpdateEntry={(i, f, v) =>
                dispatch({
                  type: "UPDATE_DIAGNOSIS_FIELD",
                  index: i,
                  field: f,
                  value: v,
                })}
              onAddDiagnosis={() => dispatch({ type: "ADD_DIAGNOSIS" })}
              onRemoveDiagnosis={(i) =>
                dispatch({ type: "REMOVE_DIAGNOSIS", index: i })}
              onApplyQuickCid={(i, c, d) =>
                dispatch({
                  type: "APPLY_QUICK_CID",
                  index: i,
                  code: c,
                  description: d,
                })}
            />
          )}
          {state.currentStep === 4 && (
            <StepFamily
              familyMembers={state.familyMembers}
              onAddMember={(m) =>
                dispatch({ type: "ADD_FAMILY_MEMBER", member: m })}
              onRemoveMember={(i) =>
                dispatch({ type: "REMOVE_FAMILY_MEMBER", index: i })}
            />
          )}
          {state.currentStep === 5 && (
            <StepSpecificities
              specificity={state.specificity}
              errors={errors}
              onUpdate={updateField("specificity")}
            />
          )}
          {state.currentStep === 6 && (
            <StepIntake
              intake={state.intake}
              errors={errors}
              onUpdate={updateField("intake")}
              onToggleProgram={(id) =>
                dispatch({ type: "TOGGLE_PROGRAM", programId: id })}
            />
          )}

          <WizardButtonBar
            currentStep={state.currentStep}
            isLastStep={isLast}
            saving={state.saving}
            onBack={() => dispatch({ type: "PREV_STEP" })}
            onNext={handleNext}
          />
        </div>
      </main>
      <SuccessOverlay
        visible={showSuccess}
        onNewRegistration={() => dispatch({ type: "RESET" })}
        onViewFamilies={() => {
          globalThis.location.href = "/social-care";
        }}
      />
    </div>
  );
};
