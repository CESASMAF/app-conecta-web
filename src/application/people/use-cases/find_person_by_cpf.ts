// =============================================================================
// FindPersonByCpf — Validates CPF then proxies lookup to People Context
// =============================================================================

import type { Result } from "../../../domain/shared/result.ts";
import { CPF, type CPFError } from "../../../domain/kernel/cpf.ts";
import type { UseCase, ProxyError } from "../../shared/types.ts";
import type { PeopleProxy } from "../ports/people-proxy.ts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FindPersonByCpfInput = Readonly<{
  cpf: string;
}>;

export type Person = Readonly<{
  id: string;
  fullName: string;
  cpf?: string;
  birthDate?: string;
}>;

export type FindPersonByCpfError = CPFError | ProxyError | "NOT_FOUND";

// ---------------------------------------------------------------------------
// Deps
// ---------------------------------------------------------------------------

type FindPersonByCpfDeps = Readonly<{
  peopleProxy: PeopleProxy;
}>;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export const findPersonByCpf = (
  deps: FindPersonByCpfDeps,
): UseCase<FindPersonByCpfInput, Person, FindPersonByCpfError> =>
  async (input) => {
    // 1. Validate CPF
    const cpfResult = CPF(input.cpf);
    if (!cpfResult.ok) return cpfResult;

    // 2. Proxy to People Context
    const path = `/api/v1/people/by-cpf/${cpfResult.value as string}`;
    // Cast: proxy returns unknown, but we trust the People Context API shape
    return deps.peopleProxy.get(path) as Promise<Result<Person, ProxyError>>;
  };
