// ViewModel do Cuidado/Proteção/Histórico (puro) — validações, montagem e helpers de exibição.
import { test, expect, describe } from 'bun:test'
import {
  formatDate,
  emptyAppointment,
  validateAppointment,
  toAppointmentInput,
  emptyIntake,
  emptyProgram,
  validateIntake,
  intakeHasErrors,
  toIntakeInput,
  emptyPlacement,
  emptyRegistry,
  validatePlacement,
  placementHasErrors,
  toPlacementInput,
  emptyViolation,
  validateViolation,
  toViolationInput,
  emptyReferral,
  validateReferral,
  toReferralInput,
  auditEventLabel,
} from '~/modules/patients/client/detail/care.view-model'

describe('care · helpers', () => {
  test('formatDate ISO/datetime → dd/mm/aaaa; vazio → ""', () => {
    expect(formatDate('2025-03-09')).toBe('09/03/2025')
    expect(formatDate('2025-03-09T10:32:00Z')).toBe('09/03/2025')
    expect(formatDate('')).toBe('')
    expect(formatDate(null)).toBe('')
  })
  test('auditEventLabel mapeia conhecidos e tolera sufixo Event; fallback ao código', () => {
    expect(auditEventLabel('PatientCreatedEvent')).toBe('Paciente criado')
    expect(auditEventLabel('PatientAdmitted')).toBe('Admitido')
    expect(auditEventLabel('AlgoDesconhecido')).toBe('AlgoDesconhecido')
  })
})

describe('care · atendimento', () => {
  test('exige resumo OU plano; toInput omite vazios', () => {
    expect(validateAppointment(emptyAppointment())).toBe('care.appointment.narrative')
    expect(validateAppointment({ ...emptyAppointment(), summary: 'ok' })).toBeNull()
    const body = toAppointmentInput({ type: ' clínico ', date: '2025-01-02', summary: ' resumo ', actionPlan: '' })
    expect(body).toEqual({ type: 'clínico', date: '2025-01-02', summary: 'resumo' })
    expect('actionPlan' in body).toBe(false)
  })
})

describe('care · ingresso', () => {
  test('exige tipo+motivo; programa exige programId; toInput monta', () => {
    const e = validateIntake({ ...emptyIntake(), linkedSocialPrograms: [emptyProgram()] })
    expect(intakeHasErrors(e)).toBe(true)
    expect(e.ingressTypeId).toBe('register.field.required')
    expect(e.programs[0]).toBe('register.field.required')

    const ok = { ingressTypeId: 'it-1', originName: '', originContact: '', serviceReason: 'CRAS', linkedSocialPrograms: [{ programId: 'pg-1', observation: ' obs ' }] }
    expect(intakeHasErrors(validateIntake(ok))).toBe(false)
    const body = toIntakeInput(ok)
    expect(body.linkedSocialPrograms[0]).toEqual({ programId: 'pg-1', observation: 'obs' })
    expect('originName' in body).toBe(false)
  })
})

describe('care · acolhimento', () => {
  test('registro exige membro/início/motivo; toInput aninha collective/checklist', () => {
    const e = validatePlacement({ ...emptyPlacement(), registries: [emptyRegistry()] })
    expect(placementHasErrors(e)).toBe(true)
    expect(e.registries[0]?.memberId).toBe('register.field.required')

    const body = toPlacementInput({
      registries: [{ memberId: 'm-1', startDate: '2025-01-01', endDate: '', reason: ' fuga ' }],
      homeLossReport: '',
      thirdPartyGuardReport: ' guarda ',
      adultInPrison: true,
      adolescentInInternment: false,
    })
    expect(body.registries[0]).toEqual({ memberId: 'm-1', startDate: '2025-01-01', reason: 'fuga' })
    expect(body.collectiveSituations).toEqual({ thirdPartyGuardReport: 'guarda' })
    expect(body.separationChecklist).toEqual({ adultInPrison: true, adolescentInInternment: false })
  })
})

describe('care · violação e encaminhamento', () => {
  test('violação exige vítima/tipo/descrição; toInput usa código do enum', () => {
    expect(validateViolation(emptyViolation()).victimId).toBe('register.field.required')
    const body = toViolationInput({ victimId: 'p-1', violationTypeId: 'vt-1', incidentDate: '', descriptionOfFact: ' fato ', actionsTaken: '' }, 'NEGLIGENCE')
    expect(body).toEqual({ victimId: 'p-1', violationType: 'NEGLIGENCE', violationTypeId: 'vt-1', descriptionOfFact: 'fato' })
  })
  test('encaminhamento exige pessoa/serviço/motivo; toInput omite data vazia', () => {
    expect(validateReferral(emptyReferral()).destinationService).toBe('register.field.required')
    const body = toReferralInput({ referredPersonId: 'p-1', destinationService: ' CRAS ', reason: ' apoio ', date: '' })
    expect(body).toEqual({ referredPersonId: 'p-1', destinationService: 'CRAS', reason: 'apoio' })
  })
})
