// Tradução das mensagens do Ory Kratos — PURA (sem Solid, sem I/O), aplicada no servidor.
//
// O Kratos devolve cada mensagem com um `id` NUMÉRICO estável além do texto em inglês. O id é
// o contrato; o texto muda entre versões e não deve ser casado por string. Fonte dos códigos:
// `text/id.go` do Kratos v1.3.1 — a versão que roda no infra (idp.system.yaml).
//
// Sem isto a tela mostra "The recovery code is invalid or has already been used. Please try
// again." para uma assistente social. As telas de auth são as únicas do produto em que o texto
// não passa pelo nosso vocabulário — é o Kratos falando direto com o usuário.
//
// Fallback: id desconhecido mantém o texto original. Preferimos inglês a mensagem engolida —
// uma tela muda quando o Kratos ganha um caso novo, e falha silenciosa é o pior desfecho.
import type { KratosMessage } from './login-flow'

export const MENSAGENS_KRATOS: Readonly<Record<number, string>> = {
  // --- informativas (1060000 = recovery, 1080000 = verification) ---
  1060001: 'Recuperação concluída. Defina sua nova senha.',
  1060002: 'Se o e-mail estiver cadastrado, enviamos as instruções de recuperação.',
  1060003: 'Se o e-mail estiver cadastrado, enviamos um código de recuperação.',
  1080001: 'Enviamos um e-mail para confirmar seu endereço.',
  1080002: 'E-mail confirmado com sucesso.',
  1080003: 'Enviamos um código para confirmar seu e-mail.',

  // --- validação genérica (4000000) ---
  4000001: 'Não foi possível validar os dados informados.',
  4000002: 'Preencha todos os campos obrigatórios.',
  4000003: 'O valor informado é curto demais.',
  4000004: 'O formato informado não é válido.',
  4000005: 'A senha não atende à política de segurança.',
  4000006: 'E-mail ou senha incorretos.',
  4000007: 'Já existe uma conta com esses dados.',
  4000008: 'Código de autenticação incorreto.',
  4000009: 'Informe seu e-mail institucional.',
  4000010: 'Este e-mail ainda não foi confirmado.',
  4000017: 'O valor informado é longo demais.',

  // --- login (4010000) ---
  4010001: 'A sessão de login expirou. Comece novamente.',
  4010008: 'Código de acesso inválido ou já utilizado. Peça um novo.',

  // --- recuperação de senha (4060000) ---
  4060004: 'Este link de recuperação é inválido ou já foi utilizado. Peça um novo.',
  4060005: 'O pedido de recuperação expirou. Comece novamente.',
  4060006: 'Código de recuperação inválido ou já utilizado. Confira o código do e-mail mais recente.',

  // --- verificação de e-mail (4070000) ---
  4070001: 'Este link de confirmação é inválido ou já foi utilizado.',
  4070005: 'O pedido de confirmação expirou. Comece novamente.',
}

export function traduzirMensagem(m: KratosMessage): KratosMessage {
  const texto = MENSAGENS_KRATOS[m.id]
  return texto ? { ...m, text: texto } : m
}

export function traduzirMensagens(ms: readonly KratosMessage[]): readonly KratosMessage[] {
  return ms.map(traduzirMensagem)
}
