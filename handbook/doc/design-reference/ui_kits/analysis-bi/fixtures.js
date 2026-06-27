/* Synthetic AGGREGATE fixtures only (LGPD: never PII; every cell >= 5 except
   where we demonstrate suppression). Mirrors the analysis-bi envelope shape. */
(function () {
  const BANDS = ["0-4","5-9","10-14","15-19","20-24","25-29","30-34","35-39","40-44","45-49","50-54","55-59","60-64","65-69","70-74","75-79","80+"];
  const pyramid = [];
  BANDS.forEach((b, i) => {
    const base = Math.round(38 * Math.exp(-Math.pow((i - 5) / 4.2, 2)) + 5);
    pyramid.push({ ageBand: b, sex: "MALE", value: base + (i % 3) });
    pyramid.push({ ageBand: b, sex: "FEMALE", value: base + 5 + (i % 4) });
  });
  pyramid.push({ ageBand: "30-34", sex: "UNKNOWN", value: 7 });

  window.KitData = {
    regions: [
      { code: "1401", name: "Norte de Roraima" },
      { code: "1402", name: "Sul de Roraima" },
    ],
    home: [
      { id: "demographics", label: "Demográfico", icon: "groups", value: 1247, unit: "registros", note: "Pirâmide etária e território" },
      { id: "epidemiological", label: "Epidemiológico", icon: "coronavirus", value: 37, unit: "casos novos", note: "Top diagnósticos CID-10" },
      { id: "socioeconomic", label: "Socioeconômico", icon: "savings", value: 412, unit: "beneficiários", note: "Renda e benefícios" },
      { id: "protection", label: "Proteção", icon: "gavel", value: 89, unit: "encaminhamentos", note: "Destinos e violações" },
      { id: "care", label: "Cuidado", icon: "volunteer_activism", value: 503, unit: "atendimentos", note: "Atendimentos e completude" },
    ],
    demographics: {
      meta: { totalRecords: 1247, kThreshold: 5, suppressedGroups: 3, period: "2025-01/2025-12" },
      pyramid,
      breakdown: [
        { mesoregionName: "Norte de Roraima", value: 812, share: 0.65 },
        { mesoregionName: "Sul de Roraima", value: 435, share: 0.35 },
      ],
    },
    epidemiological: {
      meta: { totalRecords: 137, kThreshold: 5, suppressedGroups: 2, period: "2025-01/2025-12" },
      topN: [
        { code: "E75.2", label: "Gangliosidose GM2", value: 37 },
        { code: "Q87.4", label: "Síndrome de Marfan", value: 21 },
        { code: "E70.0", label: "Fenilcetonúria clássica", value: 18 },
        { code: "G71.0", label: "Distrofia muscular", value: 14 },
        { code: "D56.1", label: "Talassemia beta", value: 9 },
      ],
    },
    exportFormats: [
      { name: "CSV", ext: ".csv", ct: "text/csv", hint: "Planilhas em geral", icon: "table_view" },
      { name: "JSON", ext: ".json", ct: "application/json", hint: "Integrações", icon: "data_object" },
      { name: "XML", ext: ".xml", ct: "application/xml", hint: "Sistemas legados", icon: "code" },
      { name: "Parquet", ext: ".parquet", ct: "application/vnd.apache.parquet", hint: "Análise de dados", icon: "dataset" },
      { name: "DBF", ext: ".dbf", ct: "application/dbf", hint: "Para importar no TabWin", icon: "grid_on" },
      { name: "DBC", ext: ".dbc", ct: "application/octet-stream", hint: "Padrão DataSUS (compactado)", icon: "folder_zip" },
      { name: "ODS", ext: ".ods", ct: "application/vnd.oasis.opendocument.spreadsheet", hint: "LibreOffice / Excel", icon: "ssid_chart" },
      { name: "FHIR", ext: ".json", ct: "application/fhir+json", hint: "Interoperabilidade RNDS (R4 BR Core)", icon: "health_and_safety" },
    ],
    datasets: [
      { value: "demographics", label: "Demográfico" },
      { value: "epidemiological", label: "Epidemiológico" },
      { value: "socioeconomic", label: "Socioeconômico" },
      { value: "protection", label: "Proteção" },
      { value: "care", label: "Cuidado" },
    ],
  };
})();
