// Registration Wizard — Pure Validation Functions
// Each step validator returns a ReadonlyMap of field → error message

import type { WizardState } from "./types.ts";

export function validateStep(
  step: number,
  state: WizardState,
): ReadonlyMap<string, string> {
  switch (step) {
    case 0:
      return validateStep0(state);
    case 1:
      return validateStep1(state);
    case 2:
      return validateStep2(state);
    case 3:
      return validateStep3(state);
    case 4:
      return validateStep4();
    case 5:
      return validateStep5();
    case 6:
      return validateStep6(state);
    default:
      return new Map();
  }
}

export function validateStep0(state: WizardState): ReadonlyMap<string, string> {
  const errors = new Map<string, string>();
  if (!state.fields.firstName.trim()) {
    errors.set("firstName", "Nome obrigatório");
  }
  if (!state.fields.lastName.trim()) {
    errors.set("lastName", "Sobrenome obrigatório");
  }
  if (!state.fields.motherName.trim()) {
    errors.set("motherName", "Nome da mãe obrigatório");
  }
  if (!state.fields.nationality.trim()) {
    errors.set("nationality", "Nacionalidade obrigatória");
  }
  // Accept either sex (BFF-aligned) or gender (deprecated alias)
  const sexValue = state.fields.sex || state.fields.gender;
  if (!sexValue.trim()) errors.set("gender", "Sexo obrigatório");

  // birthDate format validation in Step 0 (if provided via fields.birthDate)
  // Required check remains in Step 1 for backward compat
  const birthDateInFields = state.fields.birthDate.trim();
  if (birthDateInFields) {
    const digits = birthDateInFields.replace(/\D/g, "");
    if (digits.length !== 8) {
      errors.set("birthDate", "Data deve ter 8 dígitos (DD/MM/AAAA)");
    } else {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
      if (isNaN(parsed.getTime()) || parsed.getDate() !== Number(day)) {
        errors.set("birthDate", "Data inválida");
      } else if (parsed > new Date()) {
        errors.set("birthDate", "Data não pode ser futura");
      }
    }
  }

  return errors;
}

export function validateStep1(state: WizardState): ReadonlyMap<string, string> {
  const errors = new Map<string, string>();
  // CPF é opcional, mas se preenchido deve ter 11 dígitos
  const cpfDigits = state.documents.cpf.replace(/\D/g, "");
  if (cpfDigits && cpfDigits.length !== 11) {
    errors.set("cpf", "CPF deve ter 11 dígitos");
  }

  if (!state.documents.birthDate.trim()) {
    errors.set("birthDate", "Data de nascimento obrigatória");
  } else {
    const digits = state.documents.birthDate.replace(/\D/g, "");
    if (digits.length !== 8) {
      errors.set("birthDate", "Data deve ter 8 dígitos (DD/MM/AAAA)");
    } else {
      const day = digits.slice(0, 2);
      const month = digits.slice(2, 4);
      const year = digits.slice(4, 8);
      const parsed = new Date(`${year}-${month}-${day}T00:00:00`);
      if (isNaN(parsed.getTime()) || parsed.getDate() !== Number(day)) {
        errors.set("birthDate", "Data inválida");
      } else if (parsed > new Date()) {
        errors.set("birthDate", "Data não pode ser futura");
      }
    }
  }

  // RG all-or-nothing: if any RG field is filled, all must be filled
  const rgFields = [
    state.documents.rgNumber,
    state.documents.rgUf,
    state.documents.rgAgency,
    state.documents.rgDate,
  ];
  const rgFilled = rgFields.filter((f) => f.trim().length > 0);
  if (rgFilled.length > 0 && rgFilled.length < rgFields.length) {
    if (!state.documents.rgNumber.trim()) {
      errors.set("rgNumber", "Número do RG obrigatório");
    }
    if (!state.documents.rgUf.trim()) {
      errors.set("rgUf", "UF do RG obrigatória");
    }
    if (!state.documents.rgAgency.trim()) {
      errors.set("rgAgency", "Órgão emissor obrigatório");
    }
    if (!state.documents.rgDate.trim()) {
      errors.set("rgDate", "Data de emissão obrigatória");
    }
  }

  // Ao menos um documento civil deve ser informado (CPF, NIS ou RG) — CD-001
  const hasRg = rgFilled.length === rgFields.length;
  if (!cpfDigits && !state.documents.nis.trim() && !hasRg) {
    errors.set("cpf", "Informe ao menos um documento (CPF, NIS ou RG)");
  }

  return errors;
}

export function validateStep2(state: WizardState): ReadonlyMap<string, string> {
  const errors = new Map<string, string>();
  const addr = state.address;

  // Gate: locationType must be selected (if using new flow), OR residenceLocation must be filled (legacy flow)
  if (addr.locationType === null && !addr.residenceLocation.trim()) {
    errors.set("locationType", "Selecione o tipo de localização");
  }

  // locationType-aware validation
  if (addr.locationType === "URBANO") {
    if (!addr.housingSituation.trim()) {
      errors.set("housingSituation", "Situação de moradia obrigatória");
    }
    if (!addr.state.trim()) errors.set("state", "Estado obrigatório");
    if (!addr.city.trim()) errors.set("city", "Cidade obrigatória");
  } else if (addr.locationType === "RURAL") {
    if (!addr.state.trim()) errors.set("state", "Estado obrigatório");
    if (!addr.city.trim()) errors.set("city", "Cidade obrigatória");
  } else if (addr.locationType === "RUA") {
    if (!addr.state.trim()) errors.set("state", "Estado obrigatório");
    if (!addr.city.trim()) errors.set("city", "Cidade obrigatória");
  } else {
    // Legacy flow (locationType is null but residenceLocation was filled)
    if (addr.residenceLocation.trim()) {
      if (!addr.housingSituation.trim()) {
        errors.set("housingSituation", "Situação de moradia obrigatória");
      }
      if (!addr.state.trim()) errors.set("state", "Estado obrigatório");
      if (!addr.city.trim()) errors.set("city", "Cidade obrigatória");
    }
  }

  return errors;
}

export function validateStep3(state: WizardState): ReadonlyMap<string, string> {
  const errors = new Map<string, string>();
  if (state.diagnoses.length === 0) {
    errors.set("diagnoses", "Ao menos 1 diagnóstico é obrigatório");
    return errors;
  }
  for (let i = 0; i < state.diagnoses.length; i++) {
    const d = state.diagnoses[i];
    if (!d) continue;
    if (!d.code.trim()) {
      errors.set(`diagnosis_${i}_code`, "Código CID obrigatório");
    }
    if (!d.date.trim()) {
      errors.set(`diagnosis_${i}_date`, "Data do diagnóstico obrigatória");
    }
    if (!d.description.trim()) {
      errors.set(`diagnosis_${i}_description`, "Descrição obrigatória");
    }
  }
  return errors;
}

export function validateStep4(): ReadonlyMap<string, string> {
  return new Map();
}

export function validateStep5(): ReadonlyMap<string, string> {
  return new Map();
}

export function validateStep6(state: WizardState): ReadonlyMap<string, string> {
  const errors = new Map<string, string>();
  if (!state.intake.ingressType.trim()) {
    errors.set("ingressType", "Tipo de ingresso obrigatório");
  }
  if (!state.intake.serviceReason.trim()) {
    errors.set("serviceReason", "Motivo do atendimento obrigatório");
  }
  return errors;
}
