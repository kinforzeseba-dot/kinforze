const professionals = [
  {
    name: "Jenhery Valdebenito",
    specialty: "Kinesiologia musculoesqueletica",
    monthlyPatients: 0,
    activeTime: "8 meses en Kinforze",
  },
  {
    name: "Bayron Toro",
    specialty: "Kinesiologia musculoesqueletica",
    monthlyPatients: 0,
    activeTime: "1 ano y 2 meses en Kinforze",
  },
  {
    name: "Analis Gutierrez",
    specialty: "Kinesiologia musculoesqueletica",
    monthlyPatients: 0,
    activeTime: "1 ano y 1 mes en Kinforze",
  },
  {
    name: "Jeslein Jamett",
    specialty: "Nutricionista",
    monthlyPatients: 0,
    activeTime: "9 meses en Kinforze",
  },
];

const scholarships = [
  {
    title: "Metodo EDT",
    description: "Una beca para fortalecer tu razonamiento clinico y tomar mejores decisiones frente a cada paciente.",
    threshold: "30+ pacientes mensuales",
    requirements: ["Mas de 8 meses activo en Kinforze", "Mas de 30 pacientes atendidos al mes"],
  },
  {
    title: "Ecografia musculoesqueletica",
    description: "Una ruta para sumar precision diagnostica, mirar con mas detalle y elevar tu seguridad terapeutica.",
    threshold: "15+ pacientes mensuales",
    requirements: ["Mas de 8 meses activo en Kinforze", "Mas de 15 pacientes atendidos al mes"],
  },
  {
    title: "Electrolisis percutanea",
    description: "Formacion avanzada para ampliar tus herramientas de intervencion y responder mejor a casos complejos.",
    threshold: "35+ pacientes mensuales",
    requirements: ["Mas de 8 meses activo en Kinforze", "Mas de 35 pacientes atendidos al mes"],
  },
];

const studyMaterials = [
  { name: "Guia base Metodo EDT", type: "Documento PDF", size: "Material inicial" },
  { name: "Checklist Ecografia musculoesqueletica", type: "Documento clinico", size: "Material inicial" },
  { name: "Protocolo Electrolisis percutanea", type: "Apunte de estudio", size: "Material inicial" },
];

const professionalList = document.querySelector("#professionalList");
const scholarshipGrid = document.querySelector("#scholarshipGrid");
const documentList = document.querySelector("#documentList");
const searchInput = document.querySelector("#searchInput");
const materialInput = document.querySelector("#materialInput");

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatFileSize(bytes) {
  if (!bytes) return "Material cargado";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filteredProfessionals() {
  const query = searchInput.value.trim().toLowerCase();

  return professionals.filter((professional) =>
    [professional.name, professional.specialty].join(" ").toLowerCase().includes(query),
  );
}

function renderProfessionals() {
  const cards = filteredProfessionals()
    .map(
      (professional) => `
        <article class="professional-card">
          <div class="person">
            <div class="avatar">${initials(professional.name)}</div>
            <div>
              <strong>${professional.name}</strong>
              <span>${professional.activeTime}</span>
            </div>
          </div>
          <div class="professional-meta">
            <strong>${professional.specialty}</strong>
            <span>Especialidad</span>
          </div>
          <div class="patient-count">
            <strong>${professional.monthlyPatients}</strong>
            <span>pacientes mensuales</span>
          </div>
        </article>
      `,
    )
    .join("");

  professionalList.innerHTML =
    cards || `<article class="professional-card">No hay profesionales para esta busqueda.</article>`;
}

function renderStats() {
  const totalPatients = professionals.reduce(
    (sum, professional) => sum + professional.monthlyPatients,
    0,
  );

  document.querySelector("#professionalCount").textContent = professionals.length;
  document.querySelector("#monthlyPatients").textContent = totalPatients;
}

function renderScholarships() {
  scholarshipGrid.innerHTML = scholarships
    .map(
      (scholarship) => `
        <article class="scholarship-card">
          <div>
            <p class="eyebrow">Beca</p>
            <h3>${scholarship.title}</h3>
          </div>
          <p>${scholarship.description}</p>
          <ul class="requirement-list">
            ${scholarship.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}
          </ul>
          <div class="threshold">${scholarship.threshold}</div>
        </article>
      `,
    )
    .join("");
}

function renderDocuments() {
  documentList.innerHTML = studyMaterials
    .map(
      (material, index) => `
        <article class="document-item">
          <div>
            <strong>${material.name}</strong>
            <span>${material.type} · ${material.size}</span>
          </div>
          <a class="download-button" href="#" data-index="${index}">Descargar</a>
        </article>
      `,
    )
    .join("");
}

searchInput.addEventListener("input", renderProfessionals);

materialInput.addEventListener("change", (event) => {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    studyMaterials.unshift({
      name: file.name,
      type: file.type || "Archivo de estudio",
      size: formatFileSize(file.size),
    });
  });

  renderDocuments();
  materialInput.value = "";
});

documentList.addEventListener("click", (event) => {
  const link = event.target.closest(".download-button");
  if (!link) return;

  event.preventDefault();
  link.textContent = "Disponible";
  setTimeout(() => {
    link.textContent = "Descargar";
  }, 1100);
});

renderStats();
renderProfessionals();
renderScholarships();
renderDocuments();
