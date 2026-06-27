// Composição view-ready do paciente (skill bff-compose-view): junta cabeçalho + situação + transições
// disponíveis + núcleo familiar + identidade social numa só resposta, RESOLVENDO os códigos de domínio
// em rótulos NO SERVIDOR. Fan-out no social-care (agregado de leitura) + catálogos de domínio.
// Paciente é origem PRIMÁRIA (falha → erro); catálogos são SECUNDÁRIOS (falha → degrada com `partial`).
import type { AppDeps } from '~/server/deps'
import { ok, isOk, isErr, type Result } from '~/shared/http/result'
import type { AppError } from '~/shared/http/app-error'
import type { PatientStatus } from '~/shared/domain/patient'
import type { DomainCatalogItem } from '~/shared/domain/domain-catalog'
import type { AvailableTransition, FamilyMemberView, PatientOverview } from '~/shared/domain/patient-overview'
// Tipos da view-ready vivem em shared/domain (consumidos pelo client). Re-export p/ compatibilidade.
export type { LifecycleAction, AvailableTransition, FamilyMemberView, PatientOverview } from '~/shared/domain/patient-overview'

const STATUS_LABEL: Record<PatientStatus, string> = {
  ACTIVE: 'Em atendimento',
  WAITLISTED: 'Em fila de espera',
  ADMITTED: 'Admitido',
  DISCHARGED: 'Desligado',
  WITHDRAWN: 'Retirado da fila',
}

// Transições cabíveis à situação atual (data-model da 003). A UI só renderiza o que vem daqui.
function transitionsFor(status: PatientStatus): readonly AvailableTransition[] {
  switch (status) {
    case 'WAITLISTED':
      return [
        { action: 'admit', label: 'Admitir', requiresReason: false },
        { action: 'withdraw', label: 'Retirar da fila', requiresReason: true },
      ]
    case 'ACTIVE':
      return [{ action: 'discharge', label: 'Dar alta', requiresReason: true }]
    case 'DISCHARGED':
      return [{ action: 'readmit', label: 'Readmitir', requiresReason: false }]
    default:
      return []
  }
}

const labelOf = (items: readonly DomainCatalogItem[], id: string): string =>
  items.find((i) => i.id === id)?.descricao ?? id // fallback: o próprio id se o catálogo não resolver

export async function composePatientOverview(
  deps: AppDeps,
  token: string,
  patientId: string,
): Promise<Result<PatientOverview, AppError>> {
  const [detailR, relR, identR] = await Promise.all([
    deps.socialCare.getPatientDetail(token, patientId),
    deps.socialCare.listDomain(token, 'dominio_parentesco'),
    deps.socialCare.listDomain(token, 'dominio_tipo_identidade'),
  ])
  if (isErr(detailR)) return detailR
  const d = detailR.value
  // Nomes dos membros vêm do people-context (origem SECUNDÁRIA): fan-out em paralelo; falha → nome vazio
  // + `partial` (a tela mostra o parentesco e não quebra). Catálogos também são secundários.
  const memberPersons = await Promise.all(d.familyMembers.map((m) => deps.peopleContext.getPerson(token, m.personId)))
  const namesPartial = memberPersons.some(isErr)
  const nameAt = (i: number): string => {
    const r = memberPersons[i]
    return r && isOk(r) ? r.value.fullName : ''
  }
  const partial = isErr(relR) || isErr(identR) || namesPartial
  const rel = isErr(relR) ? [] : relR.value
  const ident = isErr(identR) ? [] : identR.value
  const members: readonly FamilyMemberView[] = d.familyMembers.map((m, i) => ({
    memberPersonId: m.personId,
    fullName: nameAt(i),
    relationshipLabel: labelOf(rel, m.relationshipId),
    isResiding: m.residesWithPatient,
    isPrimaryCaregiver: m.isPrimaryCaregiver,
  }))
  const primaryCaregiverId = d.familyMembers.find((m) => m.isPrimaryCaregiver)?.personId ?? null
  const socialIdentity = d.socialIdentity
    ? {
        typeId: d.socialIdentity.typeId,
        typeLabel: labelOf(ident, d.socialIdentity.typeId),
        description: d.socialIdentity.otherDescription,
      }
    : null
  return ok({
    patientId: d.patientId,
    personId: d.personId,
    fullName: d.fullName,
    status: d.status,
    statusLabel: STATUS_LABEL[d.status],
    availableTransitions: transitionsFor(d.status),
    socialIdentity,
    family: { members, primaryCaregiverId },
    partial,
  })
}
