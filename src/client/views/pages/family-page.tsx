import { useReducer, useEffect, useState } from "hono/jsx/dom"
import type { FC } from "hono/jsx/dom"
import { css, keyframes } from "hono/css"
import { familyReducer, canSave } from "../../viewmodels/family-composition/reducer.ts"
import { initialState, type FamilyMemberModel } from "../../viewmodels/family-composition/types.ts"
import { patientService } from "../../services/patient-service.ts"
import { lookupService } from "../../services/lookup-service.ts"
import { familyService } from "../../services/family-service.ts"
import { color, font, space, alpha } from "../../styles/tokens.ts"
import { AppSidebar } from "../components/patient/app-sidebar.tsx"
import { FamilyHeader } from "../components/family/family-header.tsx"
import { FamilyTable } from "../components/family/family-table.tsx"
import { AddMemberModal } from "../components/family/add-member-modal.tsx"
import { ConfirmDialog } from "../components/family/confirm-dialog.tsx"
import { SpecificitySection } from "../components/family/specificity-section.tsx"
import { AgeProfilePanel } from "../components/family/age-profile-panel.tsx"
import { FamilyNavBar } from "../components/family/family-nav-bar.tsx"
import { FamilyLoadingSkeleton } from "../components/family/family-loading-skeleton.tsx"
import { FamilyEmptyState } from "../components/family/family-empty-state.tsx"
import { FamilyErrorBanner } from "../components/family/family-error-banner.tsx"
import { FamilyToast } from "../components/family/family-toast.tsx"

interface FamilyPageProps {
  readonly patientId: string
}

type ModalState =
  | Readonly<{ open: false }>
  | Readonly<{ open: true; editIndex: number | null }>

type ConfirmState =
  | Readonly<{ open: false }>
  | Readonly<{ open: true; personId: string; name: string }>

type ToastState =
  | Readonly<{ visible: false }>
  | Readonly<{ visible: true; type: "success" | "error"; message: string }>

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
  width: 450px;
  height: 450px;
  border-radius: 50%;
  background: radial-gradient(circle, ${alpha(color.primary, 0.06)} 0%, transparent 70%);
  z-index: 0;
`

const bgBlob2 = css`
  position: fixed;
  bottom: -15%;
  left: 10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(180,160,100,0.04) 0%, transparent 70%);
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
  padding: clamp(1.5rem, 1rem + 2vw, 2.5rem) clamp(1rem, 0.5rem + 2vw, 2rem);
  overflow-y: auto;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: clamp(1rem, 0.5rem + 1vw, 1.5rem) clamp(0.75rem, 0.5rem + 1vw, 1rem);
  }
`

const contentGrid = css`
  display: grid;
  grid-template-columns: 5fr 3fr;
  gap: ${space[4]};
  align-items: start;
  margin-top: ${space[4]};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const rightColumn = css`
  display: flex;
  flex-direction: column;
  gap: ${space[4]};
  position: sticky;
  top: 0;

  @media (max-width: 768px) {
    position: static;
  }
`

export const FamilyPage: FC<FamilyPageProps> = ({ patientId }) => {
  const [state, dispatch] = useReducer(familyReducer, initialState)
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false })
  const [toast, setToast] = useState<ToastState>({ visible: false })

  const showToast = (type: "success" | "error", message: string): void => {
    setToast({ visible: true, type, message })
    setTimeout(() => setToast({ visible: false }), 3000)
  }

  useEffect(() => {
    dispatch({ type: "LOAD_START" })
    const load = async (): Promise<void> => {
      const [patientRes, parentescoRes, specRes] = await Promise.all([
        patientService.getById(patientId),
        lookupService.getTable("parentesco"),
        lookupService.getTable("specificities"),
      ])
      if (!patientRes.ok) { dispatch({ type: "LOAD_FAILURE", error: patientRes.error }); return }
      const members: FamilyMemberModel[] = patientRes.value.familyMembers.map((fm) => ({
        personId: fm.memberId, name: fm.fullName, birthDate: "",
        sex: "", relationshipId: "", relationshipLabel: fm.relationship,
        residesWithPatient: true, hasDisability: false, isPrimaryCaregiver: false,
        isPR: false, requiredDocuments: [],
      }))
      dispatch({
        type: "LOAD_SUCCESS", members,
        lookups: {
          parentesco: parentescoRes.ok ? parentescoRes.value.map((l) => ({ id: l.id, codigo: l.code, descricao: l.description, ativo: l.active })) : [],
          specificities: specRes.ok ? specRes.value.map((l) => ({ id: l.id, codigo: l.code, descricao: l.description, ativo: l.active })) : [],
        },
        specificityId: null,
      })
    }
    load()
  }, [patientId])

  const handleSaveMember = (member: FamilyMemberModel): void => {
    if (modal.open && modal.editIndex !== null) {
      dispatch({ type: "UPDATE_MEMBER", index: modal.editIndex, member })
      showToast("success", "Membro atualizado com sucesso")
    } else {
      dispatch({ type: "ADD_MEMBER", member })
      familyService.addMember(patientId, member)
      showToast("success", "Membro adicionado com sucesso")
    }
    setModal({ open: false })
  }

  const handleRemove = (personId: string): void => {
    dispatch({ type: "REMOVE_MEMBER", personId })
    familyService.removeMember(patientId, personId)
    setConfirm({ open: false })
    showToast("success", "Membro removido da composicao familiar")
  }

  const handleSaveSpecificity = (): void => {
    if (!canSave(state)) return
    dispatch({ type: "SAVE_START" })
    dispatch({ type: "SAVE_SUCCESS" })
    showToast("success", "Especificidade salva com sucesso")
  }

  const lastName = state.members[0]?.name.split(" ").slice(-1)[0] ?? ""

  return (
    <>
      <div class={bodyOverride} />
      <div class={bgGradient} />
      <div class={bgBlob1} />
      <div class={bgBlob2} />
      <div class={appLayout}>
        <AppSidebar userName="Davi Franklin" userInitials="DF" familyCount={42} activeItem="familias" />
        <main class={mainContent}>
          <FamilyNavBar />
          {state.error && <FamilyErrorBanner message={state.error} />}
          <FamilyHeader
            memberCount={state.members.length}
            onAdd={() => setModal({ open: true, editIndex: null })}
          />
          {state.loading ? (
            <FamilyLoadingSkeleton />
          ) : state.members.length === 0 && !state.error ? (
            <FamilyEmptyState onAdd={() => setModal({ open: true, editIndex: null })} />
          ) : (
            <div class={contentGrid}>
              <div>
                <FamilyTable
                  members={state.members}
                  onEdit={(i) => setModal({ open: true, editIndex: i })}
                  onRemove={(id) => { const m = state.members.find((x) => x.personId === id); setConfirm({ open: true, personId: id, name: m?.name ?? "" }) }}
                  onSetCaregiver={(id) => { dispatch({ type: "SET_CAREGIVER", personId: id }); familyService.assignPrimaryCaregiver(patientId, { memberId: id }); showToast("success", "Cuidador principal atualizado") }}
                />
              </div>
              <div class={rightColumn}>
                <SpecificitySection
                  items={state.lookups.specificities}
                  selectedId={state.selectedSpecificityId}
                  canSave={canSave(state)}
                  onSelect={(id) => dispatch({ type: "SET_SPECIFICITY", id })}
                  onSave={handleSaveSpecificity}
                />
                <AgeProfilePanel ageProfile={state.ageProfile} totalMembers={state.members.length} />
              </div>
            </div>
          )}
        </main>
      </div>
      {modal.open && (
        <AddMemberModal
          lookups={state.lookups.parentesco}
          onSave={handleSaveMember}
          onClose={() => setModal({ open: false })}
          editMember={modal.editIndex !== null ? state.members[modal.editIndex] : undefined}
        />
      )}
      {confirm.open && (
        <ConfirmDialog
          name={confirm.name}
          onConfirm={() => handleRemove(confirm.personId)}
          onCancel={() => setConfirm({ open: false })}
        />
      )}
      {toast.visible && (
        <FamilyToast type={toast.type} message={toast.message} />
      )}
    </>
  )
}
