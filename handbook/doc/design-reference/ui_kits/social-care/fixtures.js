/* Synthetic fixtures for the social-care kit. No real PII — illustrative only. */
(function () {
  window.ScData = {
    patients: [
      { id: "p1", name: "Maria das Graças Souza", cpf: "12345678900", status: "active", age: 47, risks: ["overcrowding", "dropout"] },
      { id: "p2", name: "José Carlos Pereira", cpf: "98765432100", status: "waitlisted", age: 52, risks: [] },
      { id: "p3", name: "Ana Beatriz Lima", cpf: "45678912300", status: "active", age: 9, risks: ["prenatal"] },
      { id: "p4", name: "Raimundo Nonato da Silva", cpf: "32165498700", status: "discharged", age: 63, risks: [] },
      { id: "p5", name: "Francisca Oliveira", cpf: "15975348600", status: "active", age: 34, risks: ["violation"] },
      { id: "p6", name: "Paciente [LGPD]", cpf: "", status: "withdrawn", age: null, risks: [], anonymized: true },
    ],
    record: {
      id: "p1",
      name: "Maria das Graças Souza",
      status: "active",
      socialName: "Maria",
      birthDate: "15031978",
      sex: "Feminino",
      cpf: "12345678900",
      nis: "12345678901",
      cns: "700000000000000",
      address: "Rua das Flores, 123 · Boa Vista–RR",
      cep: "69301150",
      diagnoses: [{ code: "E75.2", label: "Gangliosidose GM2" }],
      analytics: [
        { label: "Densidade habitacional", value: 2.5, format: "decimal", unit: "hab/cômodo", icon: "home", tone: "warning", toneLabel: "Risco de sobrelotação" },
        { label: "Renda per capita", value: 33333, format: "currency", icon: "payments", tone: "warning", toneLabel: "Abaixo de ½ SM" },
        { label: "Índice de vulnerabilidade", value: "Alta", icon: "warning", tone: "danger", toneLabel: "Prioridade" },
        { label: "Perfil etário", value: "1 / 2 / 0 / 2 / 1", icon: "groups", tone: "neutral", toneLabel: "0-6 / 7-14 / 15-18 / 19-59 / 60+" },
      ],
      family: [
        { id: "m1", name: "José Souza", relationship: "Pai", age: 52, primary: true, caregiver: true, pending: 0 },
        { id: "m2", name: "Ana Souza", relationship: "Filha", age: 9, primary: false, caregiver: false, pending: 2 },
        { id: "m3", name: "Carlos Souza", relationship: "Filho", age: 14, primary: false, caregiver: false, pending: 0 },
        { id: "m4", name: "Dona Lúcia", relationship: "Avó", age: 71, primary: false, caregiver: false, pending: 0 },
      ],
      audit: [
        { title: "Condição habitacional atualizada", actor: "Téc. Carla", datetime: "10/06/2026 14:30", iso: "2026-06-10T14:30", icon: "edit", tone: "info", diff: [{ field: "Nº de dormitórios", before: "1", after: "2" }, { field: "Água encanada", before: "Não", after: "Sim" }] },
        { title: "Atendimento registrado", actor: "Téc. Carla", datetime: "08/06/2026 09:15", iso: "2026-06-08T09:15", icon: "medical_services", tone: "default" },
        { title: "Paciente admitido", actor: "Adm. Roberto", datetime: "01/06/2026 11:00", iso: "2026-06-01T11:00", icon: "login", tone: "success" },
        { title: "Prontuário criado", actor: "Téc. Carla", datetime: "28/05/2026 16:40", iso: "2026-05-28T16:40", icon: "note_add", tone: "neutral", last: true },
      ],
    },
    dischargeReasons: [
      { value: "caseObjectiveAchieved", label: "Objetivo do caso alcançado" },
      { value: "transferredToAnotherService", label: "Transferido para outro serviço" },
      { value: "patientRequestedDischarge", label: "Solicitação do paciente" },
      { value: "lossOfContact", label: "Perda de contato" },
      { value: "relocation", label: "Mudança de cidade" },
      { value: "death", label: "Óbito" },
      { value: "other", label: "Outro" },
    ],
    parentesco: [
      { value: "pai", label: "Pai" }, { value: "mae", label: "Mãe" },
      { value: "filho", label: "Filho(a)" }, { value: "irmao", label: "Irmão(ã)" },
      { value: "avo", label: "Avô/Avó" }, { value: "outro", label: "Outro" },
    ],
  };
})();
