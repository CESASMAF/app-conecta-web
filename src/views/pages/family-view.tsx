import type { FC } from "@hono/hono/jsx";

interface FamilyViewProps {
  readonly patientId: string;
}

export const FamilyView: FC<FamilyViewProps> = ({ patientId }) => (
  <div id="family-app" data-patient-id={patientId}>
    <div style="display:flex;justify-content:center;align-items:center;min-height:80vh;font-family:'Playfair Display',serif;font-style:italic;color:rgba(38,29,17,0.5);">
      Carregando composição familiar...
    </div>
  </div>
);
