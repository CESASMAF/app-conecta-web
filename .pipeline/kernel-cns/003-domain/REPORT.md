# REPORT - kernel/cns (Domain Modeler)

## Summary

CNS (Cartao Nacional de Saude) Value Object implemented as a compound VO with smart constructor, formatting, and full checksum validation for both definitivo (PIS-based) and provisorio algorithms.

## Files Created

- src/domain/kernel/cns.ts - implementation
- tests/domain/kernel/cns_test.ts - 18 tests
- .pipeline/kernel-cns/001-contracts/cns.ts - contract

## Public API

### Types

- CNS = Readonly<{ number: string; cpf: CPF; qrCode: string | undefined }>
- CNSError = CNS-001 | CNS-002 | CNS-003 | CNS-005

### Functions

- CNS(input) => Result<CNS, CNSError> - Smart constructor with normalization and checksum
- formatCNS(cns) => string - Formats as XXX XXXX XXXX XXXX

## Error Union

- CNS-001: Number empty after trim
- CNS-002: Not exactly 15 digits after sanitization
- CNS-003: First digit not in {1, 2, 7, 8, 9}
- CNS-005: Checksum validation failed

## Cross-Validation Note

CVD-002 (CNS.cpf must match CivilDocuments.cpf) is NOT enforced in this constructor.

## Test Coverage

18/18 tests passing

## Dependencies

- src/domain/shared/result.ts
- src/domain/kernel/cpf.ts

## Pipeline

Agents: domain-modeler | Review rounds: 0
