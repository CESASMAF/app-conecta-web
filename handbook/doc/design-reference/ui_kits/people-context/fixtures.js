/* web_02 · People Context — synthetic fixtures (no real PII).
   CPF values are display-masked; the kit never holds raw documents. */
(function () {
  function uid(p) { return p + "-" + Math.random().toString(16).slice(2, 10); }

  const ROLE_POOL = [
    { system: "social-care", role: "patient" },
    { system: "social-care", role: "professional" },
    { system: "social-care", role: "family-member" },
    { system: "timesheet", role: "employee" },
    { system: "therapies", role: "therapist" },
    { system: "queue-manager", role: "professional" },
  ];

  // Five hand-authored, representative people (edge-cases), then a generated tail.
  const seed = [
    {
      id: "p-001", fullName: "Maria das Graças Souza", cpfMasked: "***.456.789-**",
      birthDate: "1985-03-20", email: "maria.souza@example.org", active: true,
      idpUserId: "9f3a2b1c-7d8e-4a5f-9c0b-1e2d3c4b5a6f", loginState: "linked", createdAt: "2026-06-01",
      roles: [
        { id: uid("r"), system: "social-care", role: "patient", active: true, assignedAt: "2026-06-05" },
        { id: uid("r"), system: "timesheet", role: "employee", active: false, assignedAt: "2026-05-01" },
      ],
    },
    {
      id: "p-002", fullName: "José Raimundo Lima", cpfMasked: null,
      birthDate: "1979-11-02", email: null, active: true,
      idpUserId: null, loginState: "none", createdAt: "2026-06-03", roles: [],
    },
    {
      id: "p-003", fullName: "Ana Beatriz Carvalho de Albuquerque Nogueira",
      cpfMasked: "***.982.247-**", birthDate: "1991-03-12", email: "ana.carvalho@example.org",
      active: true, idpUserId: null, loginState: "failed", createdAt: "2026-06-12",
      roles: [{ id: uid("r"), system: "social-care", role: "professional", active: true, assignedAt: "2026-06-10" }],
    },
    {
      id: "p-004", fullName: "Antônio Carlos Ferreira", cpfMasked: "***.221.870-**",
      birthDate: "1968-07-09", email: "antonio.ferreira@example.org", active: false,
      idpUserId: "2b7c9d1e-4f5a-6b8c-0d1e-2f3a4b5c6d7e", loginState: "linked", createdAt: "2025-12-18",
      roles: [
        { id: uid("r"), system: "social-care", role: "patient", active: false, assignedAt: "2025-12-20" },
        { id: uid("r"), system: "therapies", role: "patient", active: false, assignedAt: "2026-01-04" },
      ],
    },
    {
      id: "p-005", fullName: "Francisca Pereira dos Santos", cpfMasked: "***.118.402-**",
      birthDate: "1996-01-25", email: "francisca.santos@example.org", active: true,
      idpUserId: "5d2e8f1a-9b3c-4d6e-8f0a-1b2c3d4e5f60", loginState: "linked", createdAt: "2026-04-22",
      roles: [
        { id: uid("r"), system: "social-care", role: "patient", active: true, assignedAt: "2026-04-25" },
        { id: uid("r"), system: "social-care", role: "family-member", active: true, assignedAt: "2026-05-02" },
        { id: uid("r"), system: "therapies", role: "therapist", active: true, assignedAt: "2026-05-10" },
        { id: uid("r"), system: "queue-manager", role: "professional", active: true, assignedAt: "2026-05-18" },
      ],
    },
  ];

  const FIRST = ["João", "Luiz", "Pedro", "Marcos", "Rafael", "Carla", "Juliana", "Beatriz", "Larissa", "Camila", "Roberto", "Vanessa", "Gabriel", "Mateus", "Sofia"];
  const LAST = ["Oliveira", "Almeida", "Rodrigues", "Barbosa", "Gomes", "Ribeiro", "Martins", "Araújo", "Cardoso", "Teixeira", "Moreira", "Correia"];
  const tail = [];
  for (let i = 6; i <= 22; i++) {
    const fn = FIRST[i % FIRST.length] + " " + LAST[(i * 3) % LAST.length] + " " + LAST[(i * 7) % LAST.length];
    const hasCpf = i % 4 !== 0;
    const linked = i % 3 !== 0;
    const active = i % 9 !== 0;
    const rn = i % 3;
    const roles = [];
    for (let k = 0; k < rn; k++) {
      const rp = ROLE_POOL[(i + k) % ROLE_POOL.length];
      roles.push({ id: uid("r"), system: rp.system, role: rp.role, active: k % 2 === 0, assignedAt: "2026-0" + ((i % 6) + 1) + "-1" + (k + 2) });
    }
    tail.push({
      id: "p-0" + (i < 10 ? "0" + i : i),
      fullName: fn,
      cpfMasked: hasCpf ? "***." + (100 + i) + "." + (200 + i * 3) + "-**" : null,
      birthDate: "19" + (60 + (i % 39)) + "-0" + ((i % 9) + 1) + "-1" + (i % 9),
      email: i % 5 === 0 ? null : fn.split(" ")[0].toLowerCase() + "." + fn.split(" ")[1].toLowerCase() + "@example.org",
      active,
      idpUserId: linked ? uid("idp") + "-" + uid("x") : null,
      loginState: linked ? "linked" : "none",
      createdAt: "2026-0" + ((i % 6) + 1) + "-1" + (i % 8),
      roles,
    });
  }

  const all = seed.concat(tail);

  window.PeopleData = {
    people: all,
    totalCount: 150,
    pageSize: 12,
    systems: [
      { value: "social-care", label: "Social Care" },
      { value: "queue-manager", label: "Fila" },
      { value: "therapies", label: "Terapias" },
      { value: "timesheet", label: "Ponto" },
    ],
    roles: [
      { value: "patient", label: "Paciente" },
      { value: "professional", label: "Profissional" },
      { value: "family-member", label: "Membro da família" },
      { value: "employee", label: "Funcionário" },
      { value: "therapist", label: "Terapeuta" },
    ],
    // Logged-in actor: a social-care admin (scoped), not superadmin.
    viewer: { role: "admin", adminSystems: ["social-care", "therapies"], isSuperadmin: false, isWorker: false },
    fmtDate: function (iso) {
      if (!iso) return "—";
      const p = String(iso).split("-");
      if (p.length !== 3) return iso;
      return p[2] + "/" + p[1] + "/" + p[0];
    },
  };
})();
