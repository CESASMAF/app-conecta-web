// ViewModel da Avaliação (puro) — validação + montagem das 4 seções planas e pré-preenchimento.
import { test, expect, describe } from 'bun:test'
import {
  SECTIONS,
  emptyHousing,
  housingFromData,
  validateHousing,
  toHousingInput,
  type HousingForm,
  emptySocio,
  socioFromData,
  validateSocio,
  socioHasErrors,
  toSocioInput,
  toCommunityInput,
  emptyCommunity,
  toSummaryInput,
  emptySummary,
  hasErrors,
  emptyWork,
  emptyIncome,
  validateWork,
  workHasErrors,
  toWorkInput,
  emptyEdu,
  emptyEduProfile,
  emptyProgramOcc,
  validateEdu,
  eduHasErrors,
  toEduInput,
  emptyHealth,
  emptyDeficiency,
  emptyGestating,
  validateHealth,
  healthHasErrors,
  toHealthInput,
} from '~/modules/patients/client/detail/assessment.view-model'

const validHousing = (): HousingForm => ({
  ...emptyHousing(),
  type: 'OWNED',
  wallMaterial: 'MASONRY',
  waterSupply: 'PUBLIC_NETWORK',
  electricityAccess: 'METERED_CONNECTION',
  sewageDisposal: 'PUBLIC_SEWER',
  wasteCollection: 'DIRECT_COLLECTION',
  accessibilityLevel: 'FULLY_ACCESSIBLE',
  numberOfRooms: '4',
  numberOfBedrooms: '2',
  numberOfBathrooms: '1',
})

describe('avaliação · metadados', () => {
  test('7 seções, todas editáveis (tier "now")', () => {
    expect(SECTIONS).toHaveLength(7)
    expect(SECTIONS.every((s) => s.tier === 'now')).toBe(true)
    expect(SECTIONS.map((s) => s.key)).toContain('workAndIncome')
  })
})

describe('avaliação · moradia', () => {
  test('vazio → 7 selects obrigatórios; números default válidos', () => {
    const e = validateHousing(emptyHousing())
    expect(e.type).toBe('register.field.required')
    expect(e.accessibilityLevel).toBe('register.field.required')
    expect(e.numberOfRooms).toBeUndefined()
  })

  test('válido → sem erros; número negativo/inválido → erro de número', () => {
    expect(hasErrors(validateHousing(validHousing()))).toBe(false)
    expect(validateHousing({ ...validHousing(), numberOfRooms: '-1' }).numberOfRooms).toBe('assessment.field.number')
    expect(validateHousing({ ...validHousing(), numberOfBedrooms: 'x' }).numberOfBedrooms).toBe('assessment.field.number')
  })

  test('toHousingInput converte números e mantém enums; round-trip de dados', () => {
    const body = toHousingInput(validHousing())
    expect(body.numberOfRooms).toBe(4)
    expect(body.type).toBe('OWNED')
    expect(body.hasPipedWater).toBe(false)
    // pré-preenchimento a partir do agregado
    const data = { ...body }
    const form = housingFromData(data)
    expect(form.numberOfRooms).toBe('4')
    expect(form.wallMaterial).toBe('MASONRY')
  })
})

describe('avaliação · socioeconômico', () => {
  test('renda inválida → erro; fonte vazia → obrigatório; válido → sem erros', () => {
    const base = { ...emptySocio(), totalFamilyIncome: '1000', incomePerCapita: '250', mainSourceOfIncome: 'Trabalho' }
    expect(socioHasErrors(validateSocio(base))).toBe(false)
    expect(validateSocio({ ...base, incomePerCapita: '-5' }).incomePerCapita).toBe('assessment.field.number')
    expect(validateSocio({ ...base, mainSourceOfIncome: '' }).mainSourceOfIncome).toBe('register.field.required')
  })

  test('benefício incompleto → erros por linha; toSocioInput omite benefitTypeId vazio', () => {
    const withBenefit = {
      ...emptySocio(),
      totalFamilyIncome: '1000',
      incomePerCapita: '250',
      mainSourceOfIncome: 'Trabalho',
      socialBenefits: [{ benefitName: '', amount: '-1', beneficiaryId: '', benefitTypeId: '' }],
    }
    const errs = validateSocio(withBenefit)
    expect(socioHasErrors(errs)).toBe(true)
    expect(errs.benefits[0]?.benefitName).toBe('register.field.required')
    expect(errs.benefits[0]?.amount).toBe('assessment.field.number')
    expect(errs.benefits[0]?.beneficiaryId).toBe('register.field.required')

    const body = toSocioInput({
      ...withBenefit,
      socialBenefits: [{ benefitName: 'Bolsa', amount: '100', beneficiaryId: 'person-1', benefitTypeId: '' }],
    })
    expect(body.socialBenefits[0]).toEqual({ benefitName: 'Bolsa', amount: 100, beneficiaryId: 'person-1' })
    expect(body.totalFamilyIncome).toBe(1000)

    const roundTrip = socioFromData({ totalFamilyIncome: 1000, incomePerCapita: 250, mainSourceOfIncome: 'Trabalho', receivesSocialBenefit: true, hasUnemployed: false, socialBenefits: [{ benefitName: 'Bolsa', amount: 100, beneficiaryId: 'person-1' }] })
    expect(roundTrip.socialBenefits[0]!.amount).toBe('100')
    expect(roundTrip.socialBenefits[0]!.benefitTypeId).toBe('')
  })
})

describe('avaliação · rede de apoio e resumo', () => {
  test('toCommunityInput faz trim de conflitos', () => {
    const body = toCommunityInput({ ...emptyCommunity(), hasRelativeSupport: true, familyConflicts: '  tensão  ' })
    expect(body.familyConflicts).toBe('tensão')
    expect(body.hasRelativeSupport).toBe(true)
  })

  test('toSummaryInput filtra dependências vazias e faz trim', () => {
    const body = toSummaryInput({ ...emptySummary(), requiresConstantCare: true, functionalDependencies: [' locomoção ', '', '  '] })
    expect(body.functionalDependencies).toEqual(['locomoção'])
    expect(body.requiresConstantCare).toBe(true)
  })
})

describe('avaliação · trabalho e renda (por membro)', () => {
  test('linha de renda exige membro/ocupação e valor válido; toWorkInput parseia', () => {
    const f = { ...emptyWork(), individualIncomes: [{ ...emptyIncome(), monthlyAmount: '-1' }] }
    const e = validateWork(f)
    expect(workHasErrors(e)).toBe(true)
    expect(e.incomes[0]?.memberId).toBe('register.field.required')
    expect(e.incomes[0]?.occupationId).toBe('register.field.required')
    expect(e.incomes[0]?.monthlyAmount).toBe('assessment.field.number')

    const ok = { ...emptyWork(), hasRetiredMembers: true, individualIncomes: [{ memberId: 'm-1', occupationId: 'occ-1', hasWorkCard: true, monthlyAmount: '1200' }] }
    expect(workHasErrors(validateWork(ok))).toBe(false)
    const body = toWorkInput(ok)
    expect(body.individualIncomes[0]).toEqual({ memberId: 'm-1', occupationId: 'occ-1', hasWorkCard: true, monthlyAmount: 1200 })
    expect(body.hasRetiredMembers).toBe(true)
  })
})

describe('avaliação · educação (por membro)', () => {
  test('perfil exige membro/escolaridade; ocorrência exige membro/data/efeito; válido → sem erros', () => {
    const bad = {
      ...emptyEdu(),
      memberProfiles: [emptyEduProfile()],
      programOccurrences: [emptyProgramOcc()],
    }
    const e = validateEdu(bad)
    expect(eduHasErrors(e)).toBe(true)
    expect(e.profiles[0]?.educationLevelId).toBe('register.field.required')
    expect(e.occurrences[0]?.date).toBe('register.field.required')

    const ok = {
      memberProfiles: [{ memberId: 'm-1', canReadWrite: true, attendsSchool: true, educationLevelId: 'edu-1' }],
      programOccurrences: [{ memberId: 'm-1', date: '2025-03-01', effectId: 'eff-1', isSuspensionRequested: false }],
    }
    expect(eduHasErrors(validateEdu(ok))).toBe(false)
    expect(toEduInput(ok).programOccurrences[0]!.date).toBe('2025-03-01')
  })
})

describe('avaliação · saúde (por membro)', () => {
  test('deficiência exige membro/tipo; gestação valida 0–12; toHealthInput omite cuidador vazio e filtra needs', () => {
    const bad = {
      ...emptyHealth(),
      deficiencies: [emptyDeficiency()],
      gestatingMembers: [{ ...emptyGestating(), monthsGestation: '13' }],
    }
    const e = validateHealth(bad)
    expect(healthHasErrors(e)).toBe(true)
    expect(e.deficiencies[0]?.deficiencyTypeId).toBe('register.field.required')
    expect(e.gestating[0]?.monthsGestation).toBe('assessment.field.number')

    const ok = {
      foodInsecurity: true,
      deficiencies: [{ memberId: 'm-1', deficiencyTypeId: 'def-1', needsConstantCare: true, responsibleCaregiverName: '  ' }],
      gestatingMembers: [{ memberId: 'm-2', monthsGestation: '5', startedPrenatalCare: true }],
      constantCareNeeds: [' fralda ', ''],
    }
    expect(healthHasErrors(validateHealth(ok))).toBe(false)
    const body = toHealthInput(ok)
    expect('responsibleCaregiverName' in body.deficiencies[0]!).toBe(false)
    expect(body.gestatingMembers[0]!.monthsGestation).toBe(5)
    expect(body.constantCareNeeds).toEqual(['fralda'])
  })
})
