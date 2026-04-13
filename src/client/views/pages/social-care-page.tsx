import { useReducer, useEffect, useCallback } from "hono/jsx/dom"
import { css } from "hono/css"
import { socialCareReducer, filterFamilies } from "../../viewmodels/social-care/reducer.ts"
import { initialState } from "../../viewmodels/social-care/types.ts"
import type { PatientDetail, FichaStatus } from "../../viewmodels/social-care/types.ts"
import { patientService, type PatientDetail as ServicePatientDetail } from "../../services/patient-service.ts"
import { color, font, weight, radius } from "../../styles/tokens.ts"
import { AppSidebar } from "../components/patient/app-sidebar.tsx"
import { SearchInput } from "../components/ui/search-input.tsx"
import { FamilyList } from "../components/patient/family-list.tsx"
import { DetailPanel } from "../components/patient/detail-panel.tsx"
import { EmptyState } from "../components/ui/empty-state.tsx"
import { SkeletonList } from "../components/patient/skeleton-card.tsx"

/* Body background override to match gradient bottom color on scroll */
const bodyOverride = css`
  :-hono-global {
    body {
      background: ${color.bgSageDeep} !important;
      font-family: ${font.satoshi};
      color: ${color.textSagePrimary};
      min-height: 100vh;
      overflow-x: hidden;
    }
  }
`

const bgGradientStyle = css`
  position: fixed;
  inset: 0;
  z-index: 0;
  background: linear-gradient(155deg, ${color.bgBase} 0%, ${color.bgWarm} 25%, ${color.bgSage} 55%, ${color.bgSageDeep} 100%);
  pointer-events: none;
`

const bgBlob1Style = css`
  position: fixed;
  top: -15%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(79, 132, 72, 0.07) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
`

const bgBlob2Style = css`
  position: fixed;
  bottom: -20%;
  left: -5%;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180, 160, 100, 0.05) 0%, transparent 70%);
  z-index: 0;
  pointer-events: none;
`

const appStyle = css`
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100vh;
`

const mainStyle = css`
  margin-left: 64px;
  flex: 1;
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1.5rem, 1rem + 2vw, 3rem);
  max-width: min(90%, 72rem);
  position: relative;
  transition: margin-left 300ms cubic-bezier(0.16, 1, 0.3, 1);

  @media (max-width: 768px) {
    margin-left: 0;
    padding: clamp(1rem, 0.5rem + 2vw, 1.5rem) clamp(0.75rem, 0.5rem + 1vw, 1.25rem);
  }
`

const headerStyle = css`
  margin-bottom: clamp(1.5rem, 1rem + 1.5vw, 2.25rem);
`

const headerTopStyle = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: clamp(0.75rem, 0.5rem + 1vw, 1.25rem);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`

const titleStyle = css`
  font-family: ${font.erode};
  font-size: clamp(2rem, 1.5rem + 2.5vw, 2.625rem);
  font-weight: ${weight.bold};
  color: ${color.textSagePrimary};
  letter-spacing: -0.03em;
  line-height: 1;
`

const counterStyle = css`
  font-family: ${font.satoshi};
  font-size: clamp(0.8125rem, 0.75rem + 0.25vw, 0.875rem);
  color: ${color.textSageMuted};
  font-weight: ${weight.medium};
  margin-top: 0.375rem;

  & strong {
    color: ${color.textSageSecondary};
    font-weight: ${weight.semibold};
  }
`

const actionsStyle = css`
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    width: 100%;
  }
`

const searchBoxStyle = css`
  width: clamp(12rem, 10rem + 8vw, 17.5rem);

  @media (max-width: 768px) {
    width: 100%;
  }
`

const ctaStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, ${color.primary}, ${color.primaryDark});
  color: #fff;
  border: none;
  border-radius: ${radius.pill};
  font-family: ${font.satoshi};
  font-size: clamp(0.75rem, 0.6875rem + 0.25vw, 0.8125rem);
  font-weight: ${weight.semibold};
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 12px rgba(79, 132, 72, 0.2);
  text-decoration: none;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 20px rgba(79, 132, 72, 0.3);
  }
`

const buildFichas = (svc: ServicePatientDetail): readonly FichaStatus[] => [
  { name: "Composicao familiar", filled: svc.familyMembers.length > 0, route: `/family-composition/${svc.patientId}` },
  { name: "Acesso a beneficios eventuais", filled: svc.socialIdentity != null, route: null },
  { name: "Condicoes de saude da familia", filled: svc.healthStatus != null, route: null },
  { name: "Convivencia familiar e comunitaria", filled: svc.communitySupportNetwork != null, route: null },
  { name: "Condicoes educacionais da familia", filled: svc.educationalStatus != null, route: null },
  { name: "Situacoes de violencia e violacao de direitos", filled: svc.violationReports.length > 0, route: null },
  { name: "Condicoes de trabalho e rendimento da familia", filled: svc.workAndIncome != null, route: null },
  { name: "Especificidades sociais, etnicas ou culturais", filled: svc.socioeconomicSituation != null, route: null },
  { name: "Forma de ingresso e motivo do primeiro atendimento", filled: svc.intakeInfo != null, route: null },
  { name: "Condicoes habitacionais da familia", filled: svc.housingCondition != null, route: null },
]

const mapToViewDetail = (svc: ServicePatientDetail): PatientDetail => ({
  patientId: svc.patientId,
  personId: svc.personId,
  personalData: svc.personalData ? {
    firstName: svc.personalData.firstName,
    lastName: svc.personalData.lastName,
    motherName: svc.personalData.motherName ?? "",
    nationality: "",
    sex: "",
    birthDate: svc.personalData.birthDate ?? "",
    phone: svc.personalData.phone ?? null,
    socialName: null,
  } : null,
  civilDocuments: svc.civilDocuments ? {
    cpf: svc.civilDocuments.cpf ?? null,
    nis: null,
  } : null,
  address: svc.address ? {
    street: svc.address.street ?? null,
    city: svc.address.city ?? null,
    state: svc.address.state ?? null,
    cep: svc.address.cep ?? null,
  } : null,
  diagnoses: svc.diagnoses.map((d) => ({
    icdCode: d.icdCode ?? "",
    description: d.description,
    date: "",
  })),
  familyMembers: svc.familyMembers.map((m) => ({
    personId: m.memberId,
    relationship: m.relationship,
    birthDate: "",
  })),
})

export const SocialCarePage = () => {
  const [state, dispatch] = useReducer(socialCareReducer, initialState)

  useEffect(() => {
    dispatch({ type: "LOAD_START" })
    patientService.search().then((result) => {
      if (result.ok) dispatch({ type: "LOAD_SUCCESS", families: result.value.data })
      else dispatch({ type: "LOAD_FAILURE" })
    })
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && state.panelVisible) dispatch({ type: "CLOSE_PANEL" })
    }
    globalThis.addEventListener("keydown", onKeyDown)
    return () => globalThis.removeEventListener("keydown", onKeyDown)
  }, [state.panelVisible])

  const handleSelect = useCallback((id: string) => {
    dispatch({ type: "SELECT_PATIENT", id })
    patientService.getById(id).then((result) => {
      if (result.ok) {
        const fichas = buildFichas(result.value)
        const detail = mapToViewDetail(result.value)
        dispatch({ type: "DETAIL_SUCCESS", detail, fichas })
      } else {
        dispatch({ type: "DETAIL_FAILURE" })
      }
    })
  }, [])

  const filtered = filterFamilies(state.families, state.searchQuery)
  const hasSearch = state.searchQuery.trim().length > 0
  const isEmpty = !state.loading && state.families.length === 0
  const isSearchEmpty = !state.loading && hasSearch && filtered.length === 0

  return (
    <>
      <div class={bodyOverride} />
      <div class={bgGradientStyle} />
      <div class={bgBlob1Style} />
      <div class={bgBlob2Style} />

      <div class={appStyle}>
        <AppSidebar
          userName="Usuario"
          userInitials="US"
          familyCount={state.families.length}
          activeItem="familias"
        />

        <main class={mainStyle}>
          <div class={headerStyle}>
            <div class={headerTopStyle}>
              <div>
                <h1 class={titleStyle}>Familias</h1>
                <p class={counterStyle}>
                  <strong>{state.families.length}</strong> cadastradas
                </p>
              </div>
              <div class={actionsStyle}>
                <div class={searchBoxStyle}>
                  <SearchInput
                    query={state.searchQuery}
                    onSearch={(q) => dispatch({ type: "SET_SEARCH", query: q })}
                    onClear={() => dispatch({ type: "SET_SEARCH", query: "" })}
                  />
                </div>
                <a href="/patient-registration" class={ctaStyle} aria-label="Novo cadastro">
                  <span aria-hidden="true">+</span>
                  Novo Cadastro
                </a>
              </div>
            </div>
          </div>

          {state.loading && <SkeletonList count={6} />}

          {isEmpty && (
            <EmptyState
              icon={"\u25C9"}
              title="Nenhuma familia cadastrada"
              description="Comece adicionando o primeiro cadastro usando o botao acima."
            />
          )}

          {isSearchEmpty && (
            <EmptyState
              icon={"\u2315"}
              title="Nenhum resultado"
              description="Nenhuma familia encontrada para o termo buscado. Tente outro nome ou CPF."
            />
          )}

          {!state.loading && !isEmpty && !isSearchEmpty && (
            <FamilyList
              families={filtered}
              selectedId={state.selectedPatientId}
              onSelect={handleSelect}
              panelOpen={state.panelVisible}
            />
          )}

          <DetailPanel
            visible={state.panelVisible}
            view={state.panelView}
            detail={state.patientDetail}
            fichas={state.fichas}
            onClose={() => dispatch({ type: "CLOSE_PANEL" })}
            onShowFichas={() => dispatch({ type: "SHOW_FICHAS" })}
            onShowDados={() => dispatch({ type: "SHOW_DADOS" })}
          />
        </main>
      </div>
    </>
  )
}
