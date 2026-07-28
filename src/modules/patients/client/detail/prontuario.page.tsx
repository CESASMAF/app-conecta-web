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
import { patientStatusVariant } from '../data/patient-status'
import { tp } from '~/shared/i18n/patients'
import { avatar, chipStatus } from '../../../../shared/ui/kit.css'
import { initials } from '../../../../shared/ui/initials'
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

              <div class={s.record}>
                <aside class={s.pcard}>
                  <div class={s.pcardTop}>
                    <span class={avatar.lg} aria-hidden="true">
                      {initials(d().fullName || 'Paciente')}
                    </span>
                    <h1 class={s.pcardName}>{d().fullName || 'Paciente'}</h1>
                    <span class={s.preftag}>Pessoa de referência</span>
                  </div>
                  <div class={s.pcardSec}>
                    <span class={chipStatus[patientStatusVariant(d().status)]}>{d().statusLabel}</span>
                    <span class={s.pcardMeta}>
                      {d().family.members.length} no núcleo familiar
                    </span>
                    <Show when={d().socialIdentity}>
                      {(si) => <span class={chipStatus.tec}>{si().typeLabel}</span>}
                    </Show>
                    <Show when={d().partial}>
                      <span class={s.pcardMeta}>Alguns dados podem estar incompletos.</span>
                    </Show>
                  </div>
                </aside>

                <div class={s.rmain}>
                  <LifecycleControl overview={d()} b={b} />
                  <Show when={b.actionErrorTag()}>
                    {(tag) => (
                      <div class={s.errorBanner} role="alert">
                        {tp(tag())}
                      </div>
                    )}
                  </Show>

                  <nav class={s.rtabs2} role="tablist" aria-label="Seções do prontuário">
                    <For each={TABS}>
                      {(t) => (
                        <button
                          type="button"
                          role="tab"
                          aria-selected={tab() === t.id}
                          class={tab() === t.id ? s.rtab2Active : s.rtab2}
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
                </div>
              </div>
            </section>
          )}
        </Show>
      </Show>
    </Show>
  )
}
