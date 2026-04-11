import { useReducer, useEffect, useState } from "hono/jsx/dom"
import type { FC } from "hono/jsx/dom"
import { css } from "hono/css"
import { familyReducer, canSave } from "../../viewmodels/family-composition/reducer.ts"
import { initialState, type FamilyMemberModel } from "../../viewmodels/family-composition/types.ts"
import { patientService } from "../../services/patient-service.ts"
import { lookupService } from "../../services/lookup-service.ts"
import { familyService } from "../../services/family-service.ts"
import { FamilyNavBar } from "../components/family/family-nav-bar.tsx"
import { FamilyHeader } from "../components/family/family-header.tsx"
import { FamilyTable } from "../components/family/family-table.tsx"
import { AddMemberModal } from "../components/family/add-member-modal.tsx"
import { ConfirmDialog } from "../components/family/confirm-dialog.tsx"
import { SpecificitySection } from "../components/family/specificity-section.tsx"
import { AgeProfilePanel } from "../components/family/age-profile-panel.tsx"
import { Spinner } from "../components/ui/spinner.tsx"
import { space } from "../../styles/tokens.ts"
import { pageContainer } from "../../styles/base.ts"

interface FamilyPageProps {
  readonly patientId: string
}

type ModalState =
  | Readonly<{ open: false }>
  | Readonly<{ open: true; editIndex: number | null }>

type ConfirmState =
  | Readonly<{ open: false }>
  | Readonly<{ open: true; personId: string; name: string }>

const contentStyle = css`
  margin-top: ${space[4]};
`

export const FamilyPage: FC<FamilyPageProps> = ({ patientId }) => {
  const [state, dispatch] = useReducer(familyReducer, initialState)
  const [modal, setModal] = useState<ModalState>({ open: false })
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false })

  useEffect(() => {
    dispatch({ type: "LOAD_START" })
    const load = async () => {
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
    } else {
      dispatch({ type: "ADD_MEMBER", member })
      familyService.addMember(patientId, member)
    }
    setModal({ open: false })
  }

  const handleRemove = (personId: string): void => {
    dispatch({ type: "REMOVE_MEMBER", personId })
    familyService.removeMember(patientId, personId)
    setConfirm({ open: false })
  }

  if (state.loading) return <div class={pageContainer}><Spinner /></div>

  const lastName = state.members[0]?.name.split(" ").slice(-1)[0] ?? ""

  return (
    <div class={pageContainer}>
      <FamilyNavBar lastName={lastName} />
      <FamilyHeader onAdd={() => setModal({ open: true, editIndex: null })} />
      <div class={contentStyle}>
        <FamilyTable
          members={state.members}
          onEdit={(i) => setModal({ open: true, editIndex: i })}
          onRemove={(id) => { const m = state.members.find((x) => x.personId === id); setConfirm({ open: true, personId: id, name: m?.name ?? "" }) }}
          onSetCaregiver={(id) => { dispatch({ type: "SET_CAREGIVER", personId: id }); familyService.assignPrimaryCaregiver(patientId, { memberId: id }) }}
        />
        <SpecificitySection
          items={state.lookups.specificities}
          selectedId={state.selectedSpecificityId}
          onSelect={(id) => dispatch({ type: "SET_SPECIFICITY", id })}
        />
        <AgeProfilePanel ageProfile={state.ageProfile} />
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
          title="Remover membro"
          message={`Tem certeza que deseja remover ${confirm.name} da composicao familiar?`}
          confirmLabel="Remover"
          onConfirm={() => handleRemove(confirm.personId)}
          onCancel={() => setConfirm({ open: false })}
        />
      )}
    </div>
  )
}
