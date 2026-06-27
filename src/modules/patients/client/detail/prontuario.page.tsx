// Prontuário do paciente — casca de ABAS (Resumo·Avaliação·Atendimentos·Proteção·Histórico).
// Inc 3: cabeçalho com ciclo de vida (transições cabíveis) + aba RESUMO com ações de família/identidade.
// Demais abas = placeholder honesto (ADR-0011 — sem dado fabricado), chegam nos incrementos seguintes.
import { createSignal, For, Show } from 'solid-js'
import { A } from '@solidjs/router'
import { usePatientOverviewBinding } from './patient-overview.binding'
import { ResumoTab } from './tabs/resumo.tab'
import { AvaliacaoTab } from './tabs/avaliacao.tab'
import { AtendimentosTab } from './tabs/atendimentos.tab'
import { ProtecaoTab } from './tabs/protecao.tab'
import { HistoricoTab } from './tabs/historico.tab'
import { LifecycleControl } from './components/lifecycle-control.component'
import { tp } from '~/shared/i18n/patients'
import * as s from './prontuario.css'

const TABS = [
  { id: 'resumo', label: 'Resumo' },
  { id: 'avaliacao', label: 'Avaliação' },
  { id: 'atendimentos', label: 'Atendimentos' },
  { id: 'protecao', label: 'Proteção' },
  { id: 'historico', label: 'Histórico' },
] as const
type TabId = (typeof TABS)[number]['id']

export function ProntuarioPage() {
  const b = usePatientOverviewBinding()
  const [tab, setTab] = createSignal<TabId>('resumo')

  return (
    <Show when={!b.pending()} fallback={<div class={s.card}>Carregando…</div>}>
      <Show
        when={!b.notFound()}
        fallback={
          <section class={s.wrap}>
            <div class={s.card} role="alert">
              <p>O paciente que você tentou abrir não existe ou foi removido.</p>
              <A class={s.back} href="/patients">
                Voltar à lista de pacientes
              </A>
            </div>
          </section>
        }
      >
        <Show
          when={b.data()}
          fallback={
            <section class={s.wrap}>
              <div class={s.card} role="alert">
                <p>Não foi possível carregar o paciente. Tente novamente.</p>
                <A class={s.back} href="/patients">
                  Voltar à lista
                </A>
              </div>
            </section>
          }
        >
          {(d) => (
            <section class={s.wrap}>
              <A class={s.back} href="/patients">
                ← Pacientes
              </A>
              <header class={s.header}>
                <h1 class={s.title}>{d().fullName || 'Paciente'}</h1>
                <span class={s.badge}>{d().statusLabel}</span>
              </header>

              <LifecycleControl overview={d()} b={b} />
              <Show when={b.actionErrorTag()}>
                {(tag) => (
                  <div class={s.errorBanner} role="alert">
                    {tp(tag())}
                  </div>
                )}
              </Show>

              <nav class={s.tabs} role="tablist" aria-label="Seções do prontuário">
                <For each={TABS}>
                  {(t) => (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab() === t.id}
                      class={tab() === t.id ? s.tabActive : s.tab}
                      onClick={() => setTab(t.id)}
                    >
                      {t.label}
                    </button>
                  )}
                </For>
              </nav>

              <div class={s.panel} role="tabpanel">
                <Show when={tab() === 'resumo'}>
                  <ResumoTab overview={d()} b={b} />
                </Show>
                <Show when={tab() === 'avaliacao'}>
                  <AvaliacaoTab overview={d()} />
                </Show>
                <Show when={tab() === 'atendimentos'}>
                  <AtendimentosTab />
                </Show>
                <Show when={tab() === 'protecao'}>
                  <ProtecaoTab overview={d()} />
                </Show>
                <Show when={tab() === 'historico'}>
                  <HistoricoTab />
                </Show>
              </div>
            </section>
          )}
        </Show>
      </Show>
    </Show>
  )
}
