// =============================================================================
// RegisterPerson — Validates input then proxies creation to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { CPF, type CPFError } from "../../../domain/kernel/cpf.ts";
import { err } from "../../../domain/shared/result.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RegisterPersonInput = Readonly<{
  fullName: string;
  cpf?: string;
  birthDate: string;
  actorId: string;
}>;

export type RegisterPersonOutput = Readonly<{
  id: string;
}>;

export type RegisterPersonError =
  | CPFError
  | ProxyError
  | "EMPTY_FULL_NAME"
  | "FULL_NAME_TOO_LONG"
  | "INVALID_BIRTH_DATE"
  | "FUTURE_BIRTH_DATE"
  | "EMPTY_ACTOR_ID";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type RegisterPersonDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const registerPerson = (
  deps: RegisterPersonDeps,
): UseCase<RegisterPersonInput, RegisterPersonOutput, RegisterPersonError> =>
  async (input) => {
    // 1. Validate fullName
    const trimmedName = input.fullName.trim();
    if (trimmedName.length === 0) return err("EMPTY_FULL_NAME");
    if (trimmedName.length > 200) return err("FULL_NAME_TOO_LONG");

    // 2. Validate CPF if provided
    if (input.cpf !== undefined) {
      const cpfResult = CPF(input.cpf);
      if (!cpfResult.ok) return cpfResult;
    }

    // 3. Validate birthDate
    const birthDate = new Date(input.birthDate);
    if (isNaN(birthDate.getTime())) return err("INVALID_BIRTH_DATE");
    if (birthDate > new Date()) return err("FUTURE_BIRTH_DATE");

    // 4. Validate actorId
    if (input.actorId.trim().length === 0) return err("EMPTY_ACTOR_ID");

    // 5. Proxy to People Context
    const body = {
      fullName: trimmedName,
      cpf: input.cpf,
      birthDate: input.birthDate,
    };

    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.post(
      "/api/v1/people",
      body,
      input.actorId,
    ) as Promise<Result<RegisterPersonOutput, ProxyError>>;
  };
