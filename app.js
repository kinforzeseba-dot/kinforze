let professionals = [
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

const accessCodes = {
  kf104: "Jenhery Valdebenito",
  kf287: "Bayron Toro",
  kf531: "Analis Gutierrez",
  kf864: "Jeslein Jamett",
};

const benefits = [
  {
    brand: "Starbucks",
    mark: "S",
    tone: "starbucks",
    title: "Bebida caliente o fria",
    threshold: 7,
    description:
      "Al completar 7 pacientes en el mes, puedes acceder a una bebida para recargar energia entre jornadas.",
  },
  {
    brand: "Monster",
    mark: "M",
    tone: "monster",
    title: "Bebida energetica",
    threshold: 5,
    description:
      "Al completar 5 pacientes en el mes, desbloqueas una bebida energetica para acompanar tus dias de alta demanda.",
  },
  {
    brand: "Matiz",
    mark: "M",
    tone: "matiz",
    title: "Manicure esmaltado permanente",
    threshold: 10,
    womenOnly: true,
    description:
      "Al completar 10 pacientes mensuales, accedes a un servicio de manicure con esmaltado permanente. Beneficio valido solo para mujeres.",
  },
];

const scholarships = [
  {
    title: "Metodo EDT",
    description:
      "Una beca para fortalecer tu razonamiento clinico y tomar mejores decisiones frente a cada paciente.",
    threshold: "40+ pacientes mensuales",
    referencePrice: "$450.000 CLP",
    requirements: ["Mas de 8 meses activo en Kinforze", "Mas de 40 pacientes atendidos al mes"],
  },
  {
    title: "Diplomado en ecografia musculoesqueletica",
    description:
      "Una ruta para sumar precision diagnostica, mirar con mas detalle y elevar tu seguridad terapeutica.",
    threshold: "20+ pacientes mensuales",
    requirements: ["Mas de 8 meses activo en Kinforze", "Mas de 20 pacientes atendidos al mes"],
  },
];

const professionalList = document.querySelector("#professionalList");
const scholarshipGrid = document.querySelector("#scholarshipGrid");
const benefitsGrid = document.querySelector("#benefitsGrid");
const accessScreen = document.querySelector("#accessScreen");
const accessForm = document.querySelector("#accessForm");
const accessCodeInput = document.querySelector("#accessCode");
const accessError = document.querySelector("#accessError");
const logoutButton = document.querySelector("#logoutButton");
const closeSessionButton = document.querySelector("#closeSessionButton");
const mobileCloseSessionButton = document.querySelector("#mobileCloseSessionButton");
const refreshDataButton = document.querySelector("#refreshDataButton");
const dataStatus = document.querySelector("#dataStatus");
const welcomeTitle = document.querySelector("#welcomeTitle");
const config = window.KINFORZE_CONFIG || {};
let currentProfessional = null;
let currentAccessCode = "";

function getSavedAccessCode() {
  try {
    return window.sessionStorage?.getItem("kinforzeAccessCode") || "";
  } catch (error) {
    return "";
  }
}

function saveAccessCode(code) {
  try {
    window.sessionStorage?.setItem("kinforzeAccessCode", code);
  } catch (error) {
    // El portal sigue funcionando aunque el navegador bloquee sessionStorage.
  }
}

function clearSavedAccessCode() {
  try {
    window.sessionStorage?.removeItem("kinforzeAccessCode");
  } catch (error) {
    // El cierre manual basta cuando el navegador no permite guardar sesion.
  }
}

function parseCsv(csvText) {
  const rows = [];
  let currentRow = [];
  let currentValue = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      currentValue += '"';
      index += 1;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      currentRow.push(currentValue.trim());
      currentValue = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index += 1;
      currentRow.push(currentValue.trim());
      if (currentRow.some(Boolean)) rows.push(currentRow);
      currentRow = [];
      currentValue = "";
    } else {
      currentValue += character;
    }
  }

  currentRow.push(currentValue.trim());
  if (currentRow.some(Boolean)) rows.push(currentRow);

  return rows;
}

function normalizeHeader(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function csvRowsToObjects(csvText) {
  const rows = parseCsv(csvText);
  const headers = rows.shift()?.map(normalizeHeader) || [];

  return rows.map((row) =>
    headers.reduce((result, header, index) => {
      result[header] = row[index] || "";
      return result;
    }, {}),
  );
}

async function loadCsv(url) {
  if (!url) return [];

  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}cache=${Date.now()}`);
  if (!response.ok) throw new Error("No se pudo cargar la planilla");

  return csvRowsToObjects(await response.text());
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s*\|\s*$/g, "")
    .trim();
}

function mapProfessional(row) {
  return {
    name: cleanText(row.nombre || row.name),
    specialty: cleanText(row.especialidad || row.specialty),
    monthlyPatients: Number(
      row.pacientesmensuales ||
        row.pacientesmensual ||
        row.pacientes ||
        row.pacientesatendidos ||
        row.pacientesdelmes ||
        row.monthlypatients ||
        0,
    ),
    activeTime: cleanText(row.tiempoactivo || row.antiguedad || row.mesesactivo || row.activetime),
  };
}

function iconForProfessional(professional) {
  const name = professional.name.toLowerCase();
  return name.includes("analis") || name.includes("jeslein") ? "female" : "male";
}

function isFemaleProfessional(professional) {
  if (!professional) return false;
  return iconForProfessional(professional) === "female";
}

function benefitIcon(tone) {
  const icons = {
    starbucks: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 24h28v15a14 14 0 0 1-14 14 14 14 0 0 1-14-14V24Z" />
        <path d="M46 29h4a7 7 0 0 1 0 14h-4" />
        <path d="M16 54h34" />
        <path d="M24 17c-2-4 2-6 0-10" />
        <path d="M34 17c-2-4 2-6 0-10" />
        <path d="M44 17c-2-4 2-6 0-10" />
      </svg>
    `,
    monster: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M23 7h18l4 7v43H19V14l4-7Z" />
        <path d="M20 15h24" />
        <path d="M24 51h16" />
        <path d="M34 22l-8 17h9l-4 12 10-20h-9l2-9Z" />
        <path d="M25 24h4" />
        <path d="M36 24h4" />
      </svg>
    `,
    matiz: `
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M18 54V30c0-4 6-4 6 0v13" />
        <path d="M24 43V22c0-4 6-4 6 0v20" />
        <path d="M30 42V18c0-4 6-4 6 0v24" />
        <path d="M36 43V22c0-4 6-4 6 0v22" />
        <path d="M42 44V30c0-4 6-4 6 0v13c0 12-7 17-15 17h-3c-7 0-12-4-12-6" />
        <path d="M19 52c-5-5-7-9-8-15-1-4 4-6 7-2l5 7" />
        <path d="M25 9h5" />
        <path d="M31 6h5" />
        <path d="M38 9h5" />
      </svg>
    `,
  };

  return icons[tone] || icons.starbucks;
}

function normalizeName(value) {
  return normalizeHeader(value).replace(/[^a-z0-9]/g, "");
}

function findProfessionalByName(name) {
  const target = normalizeName(name);
  return professionals.find((professional) => normalizeName(professional.name) === target);
}

async function loadSheetData() {
  try {
    const sheetProfessionals = (await loadCsv(config.professionalsCsvUrl))
      .map(mapProfessional)
      .filter((professional) => professional.name && professional.specialty);

    if (sheetProfessionals.length) {
      professionals = sheetProfessionals;
      dataStatus.textContent = `Actualizado desde Google Sheets: ${new Date().toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      dataStatus.textContent = "La planilla no entrego filas validas. Revisa los encabezados.";
    }
  } catch (error) {
    dataStatus.textContent = "No se pudo leer Google Sheets. Se muestran datos locales.";
    console.warn("No se pudo cargar la planilla de profesionales. Se usaran datos locales.");
  }
}

function highestMonthlyPatients() {
  return currentProfessional?.monthlyPatients || 0;
}

function renderProfessionals() {
  const visibleProfessionals = currentProfessional ? [currentProfessional] : [];
  const cards = visibleProfessionals
    .map((professional) => {
      const gender = iconForProfessional(professional);

      return `
        <article class="professional-card">
          <div class="person">
            <span class="professional-dot ${gender}" aria-hidden="true"></span>
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
      `;
    })
    .join("");

  professionalList.innerHTML =
    cards || `<article class="professional-card empty-card">Ingresa con tu clave para ver tu avance personal.</article>`;
}

function renderStats() {
  const monthlyPatients = currentProfessional?.monthlyPatients || 0;
  const unlockedBenefits = benefits.filter(
    (benefit) =>
      monthlyPatients >= benefit.threshold &&
      (!benefit.womenOnly || isFemaleProfessional(currentProfessional)),
  ).length;

  document.querySelector("#professionalCount").textContent = currentProfessional ? "1" : "0";
  document.querySelector("#professionalLabel").textContent =
    currentProfessional?.specialty || "Acceso personal";
  document.querySelector("#monthlyPatients").textContent = monthlyPatients;
  document.querySelector("#benefitCount").textContent = unlockedBenefits;
  welcomeTitle.textContent = currentProfessional
    ? `${currentProfessional.name}, este es tu avance Kinforze.`
    : "Beneficios que reconocen tu energia clinica.";
}

function renderBenefits() {
  const patientTotal = highestMonthlyPatients();

  benefitsGrid.innerHTML = benefits
    .map((benefit) => {
      const restricted = benefit.womenOnly && !isFemaleProfessional(currentProfessional);
      const unlocked = patientTotal >= benefit.threshold && !restricted;
      const progress = Math.min(100, Math.round((patientTotal / benefit.threshold) * 100));

      return `
        <article class="reward-card ${benefit.tone} ${restricted ? "restricted" : ""}">
          <div class="reward-top">
            <div class="reward-logo" aria-label="${benefit.brand}">
              ${benefitIcon(benefit.tone)}
            </div>
            <span>${benefit.brand}</span>
          </div>
          <div>
            <h3>${benefit.title}</h3>
            <p>${benefit.description}</p>
            ${benefit.womenOnly ? `<span class="benefit-tag">Valido solo para mujeres</span>` : ""}
          </div>
          <div class="reward-progress">
            <div class="progress-head">
              <span>Progreso de logro</span>
              <strong>${progress}%</strong>
            </div>
            <div class="benefit-progress"><span style="width: ${progress}%"></span></div>
            <div class="progress-scale">
              <small>${patientTotal} de ${benefit.threshold} pacientes</small>
              <small>100%</small>
            </div>
          </div>
          <div class="reward-bottom">
            <div>
              <strong>${benefit.threshold}</strong>
              <span>pacientes en un mes</span>
            </div>
            <span class="reward-status ${unlocked ? "unlocked" : ""}">
              ${restricted ? "No aplicable" : unlocked ? "Disponible" : `${progress}% avance`}
            </span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderScholarships() {
  const patientTotal = highestMonthlyPatients();
  scholarshipGrid.innerHTML = scholarships
    .map(
      (scholarship) => {
        const threshold = Number(scholarship.threshold.match(/\d+/)?.[0] || 0);
        const progress = Math.min(100, Math.round((patientTotal / threshold) * 100));
        const unlocked = patientTotal >= threshold;

        return `
        <article class="scholarship-card">
          <div>
            <p class="eyebrow">Beca</p>
            <h3>${scholarship.title}</h3>
          </div>
          <p>${scholarship.description}</p>
          ${
            scholarship.referencePrice
              ? `<div class="reference-price"><span>Precio referencial</span><strong>${scholarship.referencePrice}</strong></div>`
              : ""
          }
          <ul class="requirement-list">
            ${scholarship.requirements.map((requirement) => `<li>${requirement}</li>`).join("")}
          </ul>
          <div class="scholarship-progress">
            <div class="progress-head">
              <span>Tu avance</span>
              <strong>${progress}%</strong>
            </div>
            <div class="benefit-progress"><span style="width: ${progress}%"></span></div>
            <div class="progress-scale">
              <small>${patientTotal} de ${threshold} pacientes</small>
              <small>100%</small>
            </div>
          </div>
          <div class="threshold">${unlocked ? "Beca disponible" : scholarship.threshold}</div>
        </article>
      `;
      },
    )
    .join("");
}

function renderAll() {
  renderStats();
  renderBenefits();
  renderProfessionals();
  renderScholarships();
}

function showPortal(professional) {
  currentProfessional = professional;
  document.body.classList.remove("access-locked");
  document.body.classList.add("access-granted");
  renderAll();
}

function handleAccess(code) {
  const professionalName = accessCodes[code.trim().toLowerCase()];
  const professional = professionalName ? findProfessionalByName(professionalName) : null;

  if (!professional) {
    accessError.textContent = "Clave no encontrada. Revisa que este escrita igual.";
    accessCodeInput.focus();
    return;
  }

  currentAccessCode = code.trim().toLowerCase();
  saveAccessCode(currentAccessCode);
  accessError.textContent = "";
  showPortal(professional);
}

accessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  handleAccess(accessCodeInput.value);
});

function returnToAccess(message = "") {
  clearSavedAccessCode();
  currentAccessCode = "";
  currentProfessional = null;
  document.body.classList.add("access-locked");
  document.body.classList.remove("access-granted");
  accessCodeInput.value = "";
  accessError.textContent = message;
  accessCodeInput.focus();
}

logoutButton.addEventListener("click", () => {
  returnToAccess();
});

closeSessionButton.addEventListener("click", () => {
  returnToAccess("Sesion cerrada correctamente.");
});

mobileCloseSessionButton.addEventListener("click", () => {
  returnToAccess("Sesion cerrada correctamente.");
});

async function refreshSheetData() {
  if (!currentProfessional && !currentAccessCode) return;

  refreshDataButton.disabled = true;
  refreshDataButton.textContent = "Actualizando...";
  dataStatus.textContent = "Leyendo Google Sheets...";

  const professionalName = currentAccessCode
    ? accessCodes[currentAccessCode]
    : currentProfessional?.name;

  await loadSheetData();

  const professional = professionalName ? findProfessionalByName(professionalName) : null;
  if (professional) {
    showPortal(professional);
  } else {
    renderAll();
    dataStatus.textContent = "No encontre este profesional en la planilla.";
  }

  refreshDataButton.disabled = false;
  refreshDataButton.textContent = "Actualizar datos";
}

refreshDataButton.addEventListener("click", refreshSheetData);

async function init() {
  await loadSheetData();
  const savedCode = getSavedAccessCode();

  if (savedCode && accessCodes[savedCode]) {
    const professional = findProfessionalByName(accessCodes[savedCode]);
    if (professional) {
      currentAccessCode = savedCode;
      showPortal(professional);
      return;
    }
  }

  document.body.classList.add("access-locked");
  renderAll();
}

init();
