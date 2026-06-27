// Aba RESUMO (US1 + US3): identidade social + núcleo familiar, com as ações de gestão. O ciclo de vida
// vive no cabeçalho do prontuário (sempre visível). Tudo a partir do overview view-ready já composto.
import { SocialIdentitySection } from '../components/social-identity-section.component'
import { FamilySection } from '../components/family-section.component'
import type { PatientOverview } from '~/shared/domain/patient-overview'
import type { PatientOverviewBinding } from '../patient-overview.binding'

export function ResumoTab(props: { overview: PatientOverview; b: PatientOverviewBinding }) {
  return (
    <>
      <SocialIdentitySection overview={props.overview} b={props.b} />
      <FamilySection overview={props.overview} b={props.b} />
    </>
  )
}
