import { useReducer, useEffect, useCallback } from "hono/jsx/dom"
import { css } from "hono/css"
import { socialCareReducer, filterFamilies } from "../../viewmodels/social-care/reducer.ts"
import { initialState } from "../../viewmodels/social-care/types.ts"
import type { PatientDetail, FichaStatus } from "../../viewmodels/social-care/types.ts"
import { patientService, type PatientDetail as ServicePatientDetail } from "../../services/patient-service.ts"
import { color, space } from "../../styles/tokens.ts"
import { TopBar } from "../components/patient/top-bar.tsx"
import { SearchInput } from "../components/ui/search-input.tsx"
import { FamilyList } from "../components/patient/family-list.tsx"
import { DetailPanel } from "../components/patient/detail-panel.tsx"
import { NewRegistrationFab } from "../components/patient/new-registration-fab.tsx"

const pageStyle = css`
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 48px;
  background: ${color.background};
`

const searchWrapperStyle = css`
  max-width: 420px;
  padding: ${space[2]} 0;
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

  return (
    <main class={pageStyle}>
      <TopBar activeTab={state.activeTab} familyCount={state.families.length} onTabChange={(tab) => dispatch({ type: "SET_TAB", tab })} />
      <div class={searchWrapperStyle}>
        <SearchInput query={state.searchQuery} onSearch={(q) => dispatch({ type: "SET_SEARCH", query: q })} onClear={() => dispatch({ type: "SET_SEARCH", query: "" })} />
      </div>
      <FamilyList families={filtered} selectedId={state.selectedPatientId} onSelect={handleSelect} />
      <DetailPanel visible={state.panelVisible} view={state.panelView} detail={state.patientDetail} fichas={state.fichas} onClose={() => dispatch({ type: "CLOSE_PANEL" })} onShowFichas={() => dispatch({ type: "SHOW_FICHAS" })} onShowDados={() => dispatch({ type: "SHOW_DADOS" })} />
      <NewRegistrationFab />
    </main>
  )
}
