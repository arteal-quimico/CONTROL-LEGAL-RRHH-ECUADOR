/* ==========================================================================
   XURI Control JS - Application Logic & State Management
   ========================================================================== */

// Initial State structures
let state = {
    requirements: [],
    workers: []
};

// Pre-defined default requirements based on the audit
const DEFAULT_REQUIREMENTS = [
    {
        id: "req-sut",
        name: "Contrato Registrado en SUT",
        desc: "Registro obligatorio del contrato en el Sistema Unificado de Trabajo del Ministerio del Trabajo.",
        priority: "CRÍTICA"
    },
    {
        id: "req-iess",
        name: "Afiliación e Aportes al IESS",
        desc: "Afiliación activa desde el primer día y comprobante de aportes mensuales sin mora.",
        priority: "CRÍTICA"
    },
    {
        id: "req-rit",
        name: "Aceptación de Reglamento Interno",
        desc: "Firma individual de socialización y aceptación del Reglamento Interno de Trabajo (RIT).",
        priority: "CRÍTICA"
    },
    {
        id: "req-paritario",
        name: "Actas de Comité Paritario / EPP",
        desc: "Registro de actas mensuales de seguridad laboral y constancia de entrega de Equipo de Protección Personal (EPP).",
        priority: "CRÍTICA"
    },
    {
        id: "req-medico",
        name: "Examen Médico Ocupacional",
        desc: "Ficha médica y certificado de aptitud emitidos en los exámenes ocupacionales anuales.",
        priority: "ALTA"
    }
];

// Pre-defined sample workers for immediate visual testing
const SAMPLE_WORKERS = [
    {
        id: "work-1",
        name: "Carlos Andrés Mendoza Ruiz",
        idCard: "1204567890",
        cargo: "Operario de Bodega / Picking",
        dateIngreso: "2024-03-12",
        status: "En Proceso",
        checklist: {
            "req-sut": { physical: true, digital: true, status: "OK", observation: "Contrato SUT físico firmado y PDF cargado." },
            "req-iess": { physical: true, digital: true, status: "OK", observation: "Aportes al día. Afiliado desde marzo 2024." },
            "req-rit": { physical: true, digital: false, status: "En Proceso", observation: "Firma física recolectada, falta escanear a carpeta digital." },
            "req-paritario": { physical: false, digital: false, status: "Pendiente", observation: "Falta entregar el nuevo par de botas y casco." },
            "req-medico": { physical: true, digital: true, status: "OK", observation: "Examen anual apto sin restricciones." }
        }
    },
    {
        id: "work-2",
        name: "Laura Sofía Cárdenas Delgado",
        idCard: "0921473852",
        cargo: "Asistente de Recursos Humanos",
        dateIngreso: "2025-01-15",
        status: "OK",
        checklist: {
            "req-sut": { physical: true, digital: true, status: "OK", observation: "SUT cargado correctamente." },
            "req-iess": { physical: true, digital: true, status: "OK", observation: "Aportaciones al IESS al día." },
            "req-rit": { physical: true, digital: true, status: "OK", observation: "Socialización del RIT completada." },
            "req-paritario": { physical: true, digital: true, status: "OK", observation: "Administrativa, no requiere EPP industrial. Acta firmada." },
            "req-medico": { physical: true, digital: true, status: "OK", observation: "Chequeo médico inicial archivado." }
        }
    },
    {
        id: "work-3",
        name: "José Vicente Ortega Álava",
        idCard: "1205948371",
        cargo: "Fotógrafo / Diseñador de Catálogo",
        dateIngreso: "2024-08-01",
        status: "En Proceso",
        checklist: {
            "req-sut": { physical: true, digital: true, status: "OK", observation: "Contrato registrado SUT." },
            "req-iess": { physical: true, digital: true, status: "OK", observation: "Afiliación activa." },
            "req-rit": { physical: false, digital: false, status: "Pendiente", observation: "Pendiente hacer firmar socialización del reglamento." },
            "req-paritario": { physical: true, digital: false, status: "En Proceso", observation: "Firma física de actas de seguridad en archivo." },
            "req-medico": { physical: false, digital: false, status: "Pendiente", observation: "Programar cita médica ocupacional por reingreso." }
        }
    },
    {
        id: "work-4",
        name: "Ana Lucía Ortiz Palacios",
        idCard: "0706594823",
        cargo: "Jefa de Bodega y Despacho",
        dateIngreso: "2023-11-20",
        status: "En Proceso",
        checklist: {
            "req-sut": { physical: true, digital: true, status: "OK", observation: "En orden." },
            "req-iess": { physical: true, digital: true, status: "OK", observation: "Aportaciones sin novedades." },
            "req-rit": { physical: true, digital: true, status: "OK", observation: "Firmado." },
            "req-paritario": { physical: true, digital: false, status: "En Proceso", observation: "Falta cargar actas digitalizadas." },
            "req-medico": { physical: true, digital: true, status: "OK", observation: "Examen médico ok." }
        }
    },
    {
        id: "work-5",
        name: "Juan Gabriel Espinoza Mera",
        idCard: "0912457896",
        cargo: "Ayudante de Despacho / Bodega",
        dateIngreso: "2026-02-10",
        status: "Pendiente",
        checklist: {
            "req-sut": { physical: false, digital: false, status: "Pendiente", observation: "Ingreso reciente. Pendiente subir contrato SUT." },
            "req-iess": { physical: true, digital: false, status: "En Proceso", observation: "Afiliado IESS. Falta descargar e imprimir comprobante." },
            "req-rit": { physical: false, digital: false, status: "Pendiente", observation: "No ha firmado el RIT." },
            "req-paritario": { physical: false, digital: false, status: "Pendiente", observation: "Falta acta de inducción y dotación de EPP." },
            "req-medico": { physical: false, digital: false, status: "Pendiente", observation: "No se ha realizado el examen ocupacional inicial." }
        }
    }
];

// Active tabs mapping
const TAB_DETAILS = {
    dashboard: { title: "Panel de Resumen", sub: "Indicadores y alertas clave en tiempo real" },
    workers: { title: "Lista de Trabajadores", sub: "Control y edición de expedientes particulares" },
    requirements: { title: "Configurar Requisitos", sub: "Administración de documentos requeridos a nivel general" },
    batch: { title: "Carga Masiva en Lote", sub: "Importación rápida de trabajadores y requisitos desde Excel o CSV" },
    backup: { title: "Copias de Seguridad", sub: "Importación, exportación y manual de control" }
};

// Selected Worker for Matrix Modal
let selectedWorkerId = null;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    checkAccessAuth();
    initTheme();
    loadState();
    setupNavigation();
    setupEventListeners();
    initFirebase();
    renderAll();
});

function checkAccessAuth() {
    const isAuth = sessionStorage.getItem("xuri_auth") === "true" || localStorage.getItem("xuri_auth_persistent") === "true";
    const overlay = document.getElementById("loginLockScreen");
    if (isAuth) {
        overlay.classList.add("hidden");
    } else {
        overlay.classList.remove("hidden");
    }
}

// Theme Initialization (Dark Mode by default)
function initTheme() {
    const savedTheme = localStorage.getItem("xuri_theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        updateThemeBtnUI("light");
    } else {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
        updateThemeBtnUI("dark");
    }
}

function toggleTheme() {
    if (document.body.classList.contains("dark-theme")) {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
        localStorage.setItem("xuri_theme", "light");
        updateThemeBtnUI("light");
    } else {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
        localStorage.setItem("xuri_theme", "dark");
        updateThemeBtnUI("dark");
    }
}

function updateThemeBtnUI(theme) {
    const text = document.querySelector(".theme-text");
    if (theme === "light") {
        text.textContent = "Modo Claro";
    } else {
        text.textContent = "Modo Oscuro";
    }
}

// Load state from localStorage or populate with defaults
function loadState() {
    const savedData = localStorage.getItem("xuri_compliance_data");
    if (savedData) {
        try {
            state = JSON.parse(savedData);
            // Validation check to make sure structure is right
            if (!state.requirements || !state.workers) {
                throw new Error("Estructura inválida");
            }
        } catch (e) {
            console.error("Error parsing localStorage data, resetting to defaults", e);
            resetToDefaults();
        }
    } else {
        resetToDefaults();
    }
}

function resetToDefaults() {
    state.requirements = JSON.parse(JSON.stringify(DEFAULT_REQUIREMENTS));
    state.workers = JSON.parse(JSON.stringify(SAMPLE_WORKERS));
    saveState();
}

function saveState() {
    localStorage.setItem("xuri_compliance_data", JSON.stringify(state));
    
    // Sincronización en la nube si Firebase está activo
    const fbActive = localStorage.getItem("xuri_firebase_active") === "true";
    if (fbActive && fbDocRef) {
        fbDocRef.set(state).catch(e => {
            console.error("Error al guardar en Firestore", e);
            showToast("Error al guardar cambios en la nube.", "warning");
        });
    }
}

// Navigation Tabs
function setupNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const currentTitle = document.getElementById("currentTabTitle");
    const currentSub = document.getElementById("currentTabSub");

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const tabId = item.getAttribute("data-tab");
            
            // Toggle active class on sidebar items
            navItems.forEach(n => n.classList.remove("active"));
            item.classList.add("active");
            
            // Toggle active class on panels
            tabPanels.forEach(p => p.classList.remove("active"));
            document.getElementById(`tab-${tabId}`).classList.add("active");
            
            // Update Title/Subtitle
            if (TAB_DETAILS[tabId]) {
                currentTitle.textContent = TAB_DETAILS[tabId].title;
                currentSub.textContent = TAB_DETAILS[tabId].sub;
            }
            
            // Re-render the specific panel data to reflect changes
            renderAll();
        });
    });
}

// Set up UI triggers
function setupEventListeners() {
    // Listeners de Login Lock
    const loginForm = document.getElementById("loginForm");
    const togglePassBtn = document.getElementById("toggleLoginPasswordBtn");
    const passInput = document.getElementById("loginPasswordInput");
    const errMessage = document.getElementById("loginErrorMessage");
    const rememberMe = document.getElementById("loginRememberMe");
    const lockOverlay = document.getElementById("loginLockScreen");

    if (togglePassBtn) {
        togglePassBtn.addEventListener("click", () => {
            if (passInput.type === "password") {
                passInput.type = "text";
                togglePassBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
            } else {
                passInput.type = "password";
                togglePassBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const password = passInput.value;
            
            if (password === "XURI2026") {
                sessionStorage.setItem("xuri_auth", "true");
                if (rememberMe.checked) {
                    localStorage.setItem("xuri_auth_persistent", "true");
                } else {
                    localStorage.removeItem("xuri_auth_persistent");
                }
                lockOverlay.classList.add("hidden");
                errMessage.classList.add("hidden");
                showToast("Acceso autorizado. ¡Bienvenido!");
            } else {
                errMessage.classList.remove("hidden");
                passInput.value = "";
                passInput.focus();
            }
        });
    }

    // Theme toggle
    document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);
    
    // Botón de imprimir reporte en la cabecera
    document.getElementById("printReportBtn").addEventListener("click", generatePrintReport);
    
    // Quick Add Button Header
    document.getElementById("quickAddWorkerBtn").addEventListener("click", () => {
        openAddWorkerModal();
    });

    // Worker Form Submit
    document.getElementById("workerForm").addEventListener("submit", handleWorkerFormSubmit);

    // Search and Filters
    document.getElementById("workerSearchInput").addEventListener("input", renderWorkersList);
    document.getElementById("filterStatusSelect").addEventListener("change", renderWorkersList);
    document.getElementById("filterComplianceSelect").addEventListener("change", renderWorkersList);

    // Requirement Form Submit
    document.getElementById("requirementForm").addEventListener("submit", handleRequirementFormSubmit);
    document.getElementById("cancelReqEditBtn").addEventListener("click", clearReqForm);

    // Matrix Modal Save
    document.getElementById("saveMatrixBtn").addEventListener("click", saveMatrixChecklist);

    // Backup triggers
    document.getElementById("exportDataBtn").addEventListener("click", exportData);
    
    const fileInput = document.getElementById("importFileInput");
    const importBtn = document.getElementById("importDataBtn");
    
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length > 0) {
            document.querySelector(".file-upload-label span").textContent = fileInput.files[0].name;
            importBtn.removeAttribute("disabled");
            importBtn.classList.remove("btn-outline");
            importBtn.classList.add("btn-primary");
        } else {
            document.querySelector(".file-upload-label span").textContent = "Seleccionar archivo .json";
            importBtn.setAttribute("disabled", "true");
            importBtn.classList.add("btn-outline");
            importBtn.classList.remove("btn-primary");
        }
    });

    importBtn.addEventListener("click", importData);

    // Listeners de Firebase
    const fbCheckbox = document.getElementById("firebaseActiveCheckbox");
    const fbSettings = document.getElementById("firebaseSettingsArea");
    
    fbCheckbox.addEventListener("change", (e) => {
        if (e.target.checked) {
            fbSettings.classList.remove("hidden");
        } else {
            fbSettings.classList.add("hidden");
            if (localStorage.getItem("xuri_firebase_active") === "true") {
                if (confirm("¿Desactivar sincronización en la nube y volver al almacenamiento local de esta PC?")) {
                    localStorage.setItem("xuri_firebase_active", "false");
                    if (fbUnsubscribe) fbUnsubscribe();
                    fbDocRef = null;
                    loadState();
                    renderAll();
                    showToast("Sincronización desactivada. Usando almacenamiento local.");
                } else {
                    fbCheckbox.checked = true;
                    fbSettings.classList.remove("hidden");
                }
            }
        }
    });

    document.getElementById("saveFirebaseConfigBtn").addEventListener("click", saveAndConnectFirebase);

    // Listeners de Carga Masiva
    const excelInput = document.getElementById("batchWorkersExcelInput");
    const processExcelBtn = document.getElementById("processBatchExcelBtn");
    
    excelInput.addEventListener("change", () => {
        if (excelInput.files.length > 0) {
            document.getElementById("excelUploadFileName").textContent = excelInput.files[0].name;
            processExcelBtn.removeAttribute("disabled");
        } else {
            document.getElementById("excelUploadFileName").textContent = "Seleccionar archivo Excel (.xlsx, .xls, .csv)";
            processExcelBtn.setAttribute("disabled", "true");
        }
    });

    processExcelBtn.addEventListener("click", handleBatchExcelWorkers);

    document.getElementById("processBatchWorkersBtn").addEventListener("click", handleBatchWorkers);
    document.getElementById("clearBatchWorkersBtn").addEventListener("click", () => {
        document.getElementById("batchWorkersTextArea").value = "";
    });
    
    document.getElementById("processBatchReqsBtn").addEventListener("click", handleBatchReqs);
    document.getElementById("clearBatchReqsBtn").addEventListener("click", () => {
        document.getElementById("batchReqsTextArea").value = "";
    });

    // Delegación de eventos para la Tabla de Trabajadores
    document.getElementById("workersTableBody").addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        
        const workerId = btn.getAttribute("data-worker-id");
        if (!workerId) return;
        
        if (btn.classList.contains("btn-edit")) {
            openEditWorkerModal(workerId);
        } else if (btn.classList.contains("btn-delete")) {
            deleteWorker(workerId);
        } else if (btn.classList.contains("btn-expediente")) {
            openMatrixModal(workerId);
        }
    });

    // Delegación de eventos para la Cuadrícula de Requisitos
    document.getElementById("requirementsGrid").addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        
        const reqId = btn.getAttribute("data-req-id");
        if (!reqId) return;
        
        if (btn.classList.contains("btn-edit-req")) {
            editRequirement(reqId);
        } else if (btn.classList.contains("btn-delete-req")) {
            deleteRequirement(reqId);
        }
    });
}

// Render everything based on state
function renderAll() {
    renderDashboard();
    renderWorkersList();
    renderRequirements();
}

/* ==========================================================================
   Dashboard Logic
   ========================================================================== */
function calculateWorkerComplianceScore(worker) {
    if (state.requirements.length === 0) return 100;
    
    let totalChecks = state.requirements.length * 2; // Physical + Digital
    let completedChecks = 0;
    
    state.requirements.forEach(req => {
        const item = worker.checklist[req.id];
        if (item) {
            if (item.physical) completedChecks++;
            if (item.digital) completedChecks++;
        }
    });
    
    return Math.round((completedChecks / totalChecks) * 100);
}

function renderDashboard() {
    const totalWorkers = state.workers.length;
    let complianceSum = 0;
    let workersOkCount = 0;
    let workersProgressCount = 0;
    let criticalAlerts = [];
    
    // Requirement aggregation for Physical vs Digital bars
    const reqStats = {};
    state.requirements.forEach(r => {
        reqStats[r.id] = { physicalCount: 0, digitalCount: 0, totalCount: 0 };
    });

    state.workers.forEach(w => {
        const score = calculateWorkerComplianceScore(w);
        complianceSum += score;
        
        if (score === 100) {
            workersOkCount++;
        } else if (score > 0) {
            workersProgressCount++;
        }
        
        // Count specific requirements
        state.requirements.forEach(r => {
            const check = w.checklist[r.id];
            if (check) {
                if (check.physical) reqStats[r.id].physicalCount++;
                if (check.digital) reqStats[r.id].digitalCount++;
                
                // Collect alerts if critical requirements are pending
                if (r.priority === "CRÍTICA" && check.status === "Pendiente") {
                    criticalAlerts.push({
                        workerName: w.name,
                        reqName: r.name,
                        workerId: w.id,
                        type: "critical",
                        msg: `Falta obligatoria de ${r.name} en el expediente.`
                    });
                } else if (r.priority === "ALTA" && check.status === "Pendiente") {
                    criticalAlerts.push({
                        workerName: w.name,
                        reqName: r.name,
                        workerId: w.id,
                        type: "warning",
                        msg: `Pendiente examen u obligación de ${r.name}.`
                    });
                }
            } else {
                // If checking doesn't exist, it's missing (pending)
                if (r.priority === "CRÍTICA") {
                    criticalAlerts.push({
                        workerName: w.name,
                        reqName: r.name,
                        workerId: w.id,
                        type: "critical",
                        msg: `Expediente incompleto: falta ${r.name}.`
                    });
                }
            }
        });
    });

    const averageCompliance = totalWorkers > 0 ? Math.round(complianceSum / totalWorkers) : 0;
    
    // Render numerical stats
    document.getElementById("statTotalWorkers").textContent = totalWorkers;
    document.getElementById("statWorkersOk").textContent = workersOkCount;
    document.getElementById("statWorkersProgress").textContent = workersProgressCount;
    document.getElementById("statCompliancePct").textContent = `${averageCompliance}%`;

    // Render Donut chart stroke-dasharray
    const donutSegment = document.getElementById("donutSegment");
    const circumference = 2 * Math.PI * 16; // 2 * pi * r = 100.53
    const offset = circumference - (averageCompliance / 100) * circumference;
    donutSegment.setAttribute("stroke-dasharray", `${circumference} ${circumference}`);
    donutSegment.style.strokeDashoffset = offset;

    // Render bars per requirement
    const barsContainer = document.getElementById("dashboardReqBars");
    barsContainer.innerHTML = "";
    
    if (state.requirements.length === 0) {
        barsContainer.innerHTML = `<p class="text-secondary text-center">No hay requisitos configurados. Agrégalos en el panel de Requisitos.</p>`;
    } else {
        state.requirements.forEach(r => {
            const stat = reqStats[r.id] || { physicalCount: 0, digitalCount: 0 };
            const physPct = totalWorkers > 0 ? Math.round((stat.physicalCount / totalWorkers) * 100) : 0;
            const digPct = totalWorkers > 0 ? Math.round((stat.digitalCount / totalWorkers) * 100) : 0;
            const overallPct = Math.round((physPct + digPct) / 2);

            const barElement = document.createElement("div");
            barElement.className = "req-bar-item";
            barElement.innerHTML = `
                <div class="req-bar-header">
                    <span class="req-bar-title">${r.name}</span>
                    <span class="req-bar-pct">Promedio: ${overallPct}%</span>
                </div>
                <div class="req-bar-track-dual">
                    <div class="req-bar-physical" style="width: ${physPct * 0.5}%" title="Físico: ${physPct}%"></div>
                    <div class="req-bar-digital" style="width: ${digPct * 0.5}%" title="Digital: ${digPct}%"></div>
                </div>
                <div class="req-bar-legend">
                    <span><span class="legend-color phys"></span>Físico (${physPct}%)</span>
                    <span><span class="legend-color dig"></span>Digital (${digPct}%)</span>
                </div>
            `;
            barsContainer.appendChild(barElement);
        });
    }

    // Render alerts
    const alertsList = document.getElementById("dashboardAlertsList");
    const alertCountBadge = document.getElementById("alertCount");
    alertsList.innerHTML = "";
    
    alertCountBadge.textContent = criticalAlerts.length;
    
    if (criticalAlerts.length === 0) {
        alertsList.innerHTML = `
            <div class="table-empty-state" style="padding: 20px;">
                <i class="fa-solid fa-circle-check text-success" style="font-size: 32px; margin-bottom: 8px;"></i>
                <h4>¡Todo al día!</h4>
                <p style="font-size: 12px;">No se registran alertas de requisitos críticos pendientes.</p>
            </div>
        `;
    } else {
        criticalAlerts.forEach(alert => {
            const alertElement = document.createElement("div");
            alertElement.className = `alert-item ${alert.type === 'critical' ? 'alert-critical' : 'alert-warning'}`;
            alertElement.innerHTML = `
                <i class="fa-solid ${alert.type === 'critical' ? 'fa-circle-exclamation text-pending' : 'fa-triangle-exclamation text-warning'} alert-icon"></i>
                <div class="alert-content">
                    <h4>${alert.workerName}</h4>
                    <p>${alert.msg}</p>
                </div>
            `;
            // Add click to open matrix modal
            alertElement.style.cursor = "pointer";
            alertElement.addEventListener("click", () => {
                openMatrixModal(alert.workerId);
            });
            alertsList.appendChild(alertElement);
        });
    }
}

/* ==========================================================================
   Workers Section Logic
   ========================================================================== */
function renderWorkersList() {
    const tableBody = document.getElementById("workersTableBody");
    const emptyState = document.getElementById("workersEmptyState");
    const table = document.querySelector(".table-responsive");
    
    tableBody.innerHTML = "";
    
    // Search values
    const query = document.getElementById("workerSearchInput").value.toLowerCase().trim();
    const statusFilter = document.getElementById("filterStatusSelect").value;
    const complianceFilter = document.getElementById("filterComplianceSelect").value;

    let filteredWorkers = state.workers.filter(w => {
        // Search matches
        const matchesSearch = w.name.toLowerCase().includes(query) || w.idCard.includes(query) || (w.cargo && w.cargo.toLowerCase().includes(query));
        
        // Status matches
        const matchesStatus = statusFilter === "all" || w.status === statusFilter;
        
        // Compliance matches
        const score = calculateWorkerComplianceScore(w);
        let matchesCompliance = true;
        if (complianceFilter === "incomplete") {
            matchesCompliance = score < 100;
        } else if (complianceFilter === "complete") {
            matchesCompliance = score === 100;
        }
        
        return matchesSearch && matchesStatus && matchesCompliance;
    });

    if (filteredWorkers.length === 0) {
        table.classList.add("hidden");
        emptyState.classList.remove("hidden");
    } else {
        table.classList.remove("hidden");
        emptyState.classList.add("hidden");
        
        // Sort workers alphabetically
        filteredWorkers.sort((a, b) => a.name.localeCompare(b.name));

        filteredWorkers.forEach(w => {
            const score = calculateWorkerComplianceScore(w);
            
            // Calculate details of physical and digital checkmarks
            let physicalOkCount = 0;
            let digitalOkCount = 0;
            state.requirements.forEach(r => {
                const check = w.checklist[r.id];
                if (check) {
                    if (check.physical) physicalOkCount++;
                    if (check.digital) digitalOkCount++;
                }
            });
            
            const totalReqs = state.requirements.length;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div class="worker-profile">
                        <div class="worker-avatar">${w.name.charAt(0).toUpperCase()}</div>
                        <div class="worker-meta">
                            <span class="worker-name">${w.name}</span>
                            <span class="worker-title">${w.cargo || 'Sin Cargo'}</span>
                        </div>
                    </div>
                </td>
                <td><code style="font-size: 13px;">${w.idCard}</code></td>
                <td>
                    <div class="table-progress">
                        <div class="table-progress-track">
                            <div class="table-progress-bar" style="width: ${score}%"></div>
                        </div>
                        <span class="table-progress-text">${score}%</span>
                    </div>
                </td>
                <td class="text-center">
                    <span class="table-progress-text">${physicalOkCount}/${totalReqs}</span>
                </td>
                <td class="text-center">
                    <span class="table-progress-text">${digitalOkCount}/${totalReqs}</span>
                </td>
                <td>
                    <span class="badge ${w.status === 'OK' ? 'badge-ok' : w.status === 'En Proceso' ? 'badge-progress' : 'badge-pending'}">
                        ${w.status}
                    </span>
                </td>
                <td class="actions-cell">
                    <button class="btn btn-outline btn-sm btn-expediente" data-worker-id="${w.id}" title="Control de Expediente">
                        <i class="fa-solid fa-folder-open text-info"></i> Expediente
                    </button>
                    <button class="btn btn-outline btn-sm btn-edit" data-worker-id="${w.id}" title="Editar Datos">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm btn-delete" data-worker-id="${w.id}" title="Eliminar Trabajador">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }
}

// Add/Edit Worker Modal Trigger
function openAddWorkerModal() {
    document.getElementById("workerModalTitle").textContent = "Registrar Nuevo Trabajador";
    document.getElementById("workerIdInput").value = "";
    document.getElementById("workerForm").reset();
    
    // Cambiar texto de botón de envío
    document.querySelector("#workerForm button[type='submit']").innerHTML = '<i class="fa-solid fa-user-plus"></i> Registrar Trabajador';
    
    document.getElementById("workerModal").classList.add("active");
}

function openEditWorkerModal(workerId) {
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    document.getElementById("workerModalTitle").textContent = "Editar Datos del Trabajador";
    document.getElementById("workerIdInput").value = worker.id;
    document.getElementById("workerNameInput").value = worker.name;
    document.getElementById("workerIdCardInput").value = worker.idCard;
    document.getElementById("workerCargoInput").value = worker.cargo || "";
    document.getElementById("workerDateInput").value = worker.dateIngreso || "";
    document.getElementById("workerStatusSelect").value = worker.status;
    
    // Cambiar texto de botón de envío
    document.querySelector("#workerForm button[type='submit']").innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Guardar Cambios';
    
    document.getElementById("workerModal").classList.add("active");
}

function closeWorkerModal() {
    document.getElementById("workerModal").classList.remove("active");
}

function handleWorkerFormSubmit(e) {
    e.preventDefault();
    
    const workerId = document.getElementById("workerIdInput").value;
    const name = document.getElementById("workerNameInput").value.trim();
    const idCard = document.getElementById("workerIdCardInput").value.trim();
    const cargo = document.getElementById("workerCargoInput").value.trim();
    const dateIngreso = document.getElementById("workerDateInput").value;
    const status = document.getElementById("workerStatusSelect").value;

    // Basic Ecuadorian ID validation check (10 digits)
    if (idCard.length !== 10 || isNaN(idCard)) {
        showToast("La cédula debe contener exactamente 10 dígitos numéricos.", "warning");
        return;
    }

    if (workerId) {
        // Edit existing worker
        const workerIndex = state.workers.findIndex(w => w.id === workerId);
        if (workerIndex > -1) {
            state.workers[workerIndex].name = name;
            state.workers[workerIndex].idCard = idCard;
            state.workers[workerIndex].cargo = cargo;
            state.workers[workerIndex].dateIngreso = dateIngreso;
            state.workers[workerIndex].status = status;
            
            showToast("Trabajador actualizado correctamente.");
        }
    } else {
        // Check for duplicate ID card
        if (state.workers.some(w => w.idCard === idCard)) {
            showToast("Esta cédula ya se encuentra registrada.", "warning");
            return;
        }

        // Add new worker
        const newId = `work-${Date.now()}`;
        const newWorker = {
            id: newId,
            name: name,
            idCard: idCard,
            cargo: cargo,
            dateIngreso: dateIngreso,
            status: status,
            checklist: {}
        };
        
        // Initialize checklist mapping for existing requirements
        state.requirements.forEach(req => {
            newWorker.checklist[req.id] = {
                physical: false,
                digital: false,
                status: "Pendiente",
                observation: ""
            };
        });
        
        state.workers.push(newWorker);
        showToast("Trabajador registrado exitosamente.");
    }
    
    saveState();
    closeWorkerModal();
    renderAll();
}

function deleteWorker(workerId) {
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    if (confirm(`¿Está seguro de que desea eliminar a ${worker.name}? Esta acción no se puede deshacer.`)) {
        state.workers = state.workers.filter(w => w.id !== workerId);
        saveState();
        showToast("Trabajador eliminado de la base de datos.", "warning");
        renderAll();
    }
}

/* ==========================================================================
   Matrix Checklist Modal Logic
   ========================================================================== */
function openMatrixModal(workerId) {
    const worker = state.workers.find(w => w.id === workerId);
    if (!worker) return;

    selectedWorkerId = workerId;
    
    // Header details
    document.getElementById("matrixWorkerName").textContent = worker.name;
    document.getElementById("matrixWorkerSub").textContent = `CI: ${worker.idCard} | Cargo: ${worker.cargo || 'Sin especificar'}`;
    
    const statusSelect = document.getElementById("matrixWorkerStatus");
    statusSelect.value = worker.status;

    // Render requirements checklist matrix
    renderMatrixChecklist(worker);

    document.getElementById("matrixModal").classList.add("active");
}

function closeMatrixModal() {
    document.getElementById("matrixModal").classList.remove("active");
    selectedWorkerId = null;
}

function renderMatrixChecklist(worker) {
    const container = document.getElementById("matrixRequirementsList");
    container.innerHTML = "";
    
    const score = calculateWorkerComplianceScore(worker);
    document.getElementById("matrixCompliancePct").textContent = `${score}%`;
    document.getElementById("matrixComplianceBar").style.width = `${score}%`;

    if (state.requirements.length === 0) {
        container.innerHTML = `<p class="text-secondary text-center" style="padding:20px;">No hay requisitos configurados.</p>`;
        return;
    }

    state.requirements.forEach(req => {
        // Get or initialize checkbox value
        if (!worker.checklist[req.id]) {
            worker.checklist[req.id] = { physical: false, digital: false, status: "Pendiente", observation: "" };
        }
        const check = worker.checklist[req.id];

        const row = document.createElement("div");
        row.className = "matrix-row";
        row.innerHTML = `
            <div class="col-req">
                <span class="req-card-title">${req.name}</span>
                <span class="req-priority-tag ${req.priority === 'CRÍTICA' ? 'badge-pending' : req.priority === 'ALTA' ? 'badge-progress' : 'badge-info'}">
                    ${req.priority}
                </span>
            </div>
            <div class="col-check text-center">
                <i class="fa-solid fa-file-lines matrix-checkbox ${check.physical ? 'active-phys' : ''}" 
                   data-req-id="${req.id}" data-type="physical" title="Archivo Físico (Entregado)"></i>
            </div>
            <div class="col-check text-center">
                <i class="fa-solid fa-cloud-arrow-up matrix-checkbox ${check.digital ? 'active-dig' : ''}" 
                   data-req-id="${req.id}" data-type="digital" title="Archivo Digitalizado (Cargado)"></i>
            </div>
            <div class="col-status">
                <select class="form-select inline-select matrix-status-select" data-req-id="${req.id}">
                    <option value="Pendiente" ${check.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                    <option value="En Proceso" ${check.status === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                    <option value="OK" ${check.status === 'OK' ? 'selected' : ''}>OK</option>
                </select>
            </div>
            <div class="col-obs">
                <input type="text" class="form-control matrix-obs-input" data-req-id="${req.id}" 
                       value="${check.observation || ''}" placeholder="Ej. Entregado 05/Jul | Pendiente firma...">
            </div>
        `;
        container.appendChild(row);
    });

    // Add event listeners inside checklist grid
    const checkboxes = container.querySelectorAll(".matrix-checkbox");
    checkboxes.forEach(cb => {
        cb.addEventListener("click", () => {
            const reqId = cb.getAttribute("data-req-id");
            const type = cb.getAttribute("data-type");
            const check = worker.checklist[reqId];
            
            if (type === "physical") {
                check.physical = !check.physical;
                cb.classList.toggle("active-phys");
            } else {
                check.digital = !check.digital;
                cb.classList.toggle("active-dig");
            }
            
            // Auto update general status based on checkmarks
            const statusSelect = container.querySelector(`select[data-req-id="${reqId}"]`);
            if (check.physical && check.digital) {
                check.status = "OK";
                statusSelect.value = "OK";
            } else if (check.physical || check.digital) {
                check.status = "En Proceso";
                statusSelect.value = "En Proceso";
            } else {
                check.status = "Pendiente";
                statusSelect.value = "Pendiente";
            }
            
            // Recalculate score and refresh compliance bar dynamically
            const liveScore = calculateWorkerComplianceScore(worker);
            document.getElementById("matrixCompliancePct").textContent = `${liveScore}%`;
            document.getElementById("matrixComplianceBar").style.width = `${liveScore}%`;
        });
    });

    // Listeners for manual status dropdown adjustments
    const statusSelects = container.querySelectorAll(".matrix-status-select");
    statusSelects.forEach(sel => {
        sel.addEventListener("change", (e) => {
            const reqId = sel.getAttribute("data-req-id");
            worker.checklist[reqId].status = e.target.value;
            
            // If they mark status as OK, and haven't clicked checkmarks, auto check them (helpful speed shortcut)
            if (e.target.value === "OK") {
                worker.checklist[reqId].physical = true;
                worker.checklist[reqId].digital = true;
                const pIcon = container.querySelector(`.matrix-checkbox[data-req-id="${reqId}"][data-type="physical"]`);
                const dIcon = container.querySelector(`.matrix-checkbox[data-req-id="${reqId}"][data-type="digital"]`);
                pIcon.classList.add("active-phys");
                dIcon.classList.add("active-dig");
            }
            
            const liveScore = calculateWorkerComplianceScore(worker);
            document.getElementById("matrixCompliancePct").textContent = `${liveScore}%`;
            document.getElementById("matrixComplianceBar").style.width = `${liveScore}%`;
        });
    });
}

function saveMatrixChecklist() {
    if (!selectedWorkerId) return;
    
    const worker = state.workers.find(w => w.id === selectedWorkerId);
    if (!worker) return;
    
    // Save general status
    const generalStatus = document.getElementById("matrixWorkerStatus").value;
    worker.status = generalStatus;

    // Capture values from text inputs
    const container = document.getElementById("matrixRequirementsList");
    const obsInputs = container.querySelectorAll(".matrix-obs-input");
    
    obsInputs.forEach(input => {
        const reqId = input.getAttribute("data-req-id");
        worker.checklist[reqId].observation = input.value.trim();
    });

    // Save final status based on total checklist completion
    const finalScore = calculateWorkerComplianceScore(worker);
    if (finalScore === 100) {
        worker.status = "OK";
    }

    saveState();
    closeMatrixModal();
    renderAll();
    showToast(`Expediente de ${worker.name} guardado correctamente.`);
}

/* ==========================================================================
   Requirements Section Logic
   ========================================================================== */
function renderRequirements() {
    const grid = document.getElementById("requirementsGrid");
    grid.innerHTML = "";
    
    if (state.requirements.length === 0) {
        grid.innerHTML = `
            <div class="table-empty-state" style="padding: 20px;">
                <i class="fa-solid fa-folder-open empty-icon"></i>
                <h4>No hay requisitos creados</h4>
                <p>Usa el formulario lateral para agregar los documentos del control.</p>
            </div>
        `;
        return;
    }

    state.requirements.forEach(req => {
        const card = document.createElement("div");
        card.className = "req-detail-card";
        card.innerHTML = `
            <div class="req-card-main">
                <div class="req-card-title-row">
                    <span class="req-card-title">${req.name}</span>
                    <span class="badge ${req.priority === 'CRÍTICA' ? 'badge-pending' : req.priority === 'ALTA' ? 'badge-progress' : 'badge-info'}">
                        ${req.priority}
                    </span>
                </div>
                <p class="req-card-desc">${req.desc || 'Sin descripción o base legal adicional.'}</p>
            </div>
            <div class="actions-cell">
                <button class="btn btn-outline btn-sm btn-edit-req" data-req-id="${req.id}" title="Editar Requisito">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-delete-req" data-req-id="${req.id}" title="Eliminar Requisito">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function handleRequirementFormSubmit(e) {
    e.preventDefault();
    
    const reqId = document.getElementById("reqIdInput").value;
    const name = document.getElementById("reqNameInput").value.trim();
    const desc = document.getElementById("reqDescInput").value.trim();
    const priority = document.querySelector('input[name="reqPriority"]:checked').value;

    if (reqId) {
        // Edit requirement details
        const index = state.requirements.findIndex(r => r.id === reqId);
        if (index > -1) {
            state.requirements[index].name = name;
            state.requirements[index].desc = desc;
            state.requirements[index].priority = priority;
            
            showToast("Requisito normativo actualizado.");
        }
    } else {
        // Create new requirement
        const newReqId = `req-${Date.now()}`;
        const newReq = { id: newReqId, name, desc, priority };
        state.requirements.push(newReq);
        
        // Add new checklist items to all existing workers in database
        state.workers.forEach(w => {
            w.checklist[newReqId] = {
                physical: false,
                digital: false,
                status: "Pendiente",
                observation: ""
            };
        });
        
        showToast("Requisito agregado y asignado a todos los trabajadores.");
    }
    
    saveState();
    clearReqForm();
    renderAll();
}

function editRequirement(reqId) {
    const req = state.requirements.find(r => r.id === reqId);
    if (!req) return;

    document.getElementById("reqFormTitle").textContent = "Editar Requisito";
    document.getElementById("reqIdInput").value = req.id;
    document.getElementById("reqNameInput").value = req.name;
    document.getElementById("reqDescInput").value = req.desc || "";
    
    const priorityInput = document.querySelector(`input[name="reqPriority"][value="${req.priority}"]`);
    if (priorityInput) priorityInput.checked = true;
    
    document.getElementById("cancelReqEditBtn").textContent = "Cancelar Edición";
}

function deleteRequirement(reqId) {
    const req = state.requirements.find(r => r.id === reqId);
    if (!req) return;

    if (confirm(`¿Está seguro de que desea eliminar el requisito "${req.name}"? Esto borrará el registro de control de este documento para TODOS los trabajadores.`)) {
        // Filter requirements
        state.requirements = state.requirements.filter(r => r.id !== reqId);
        
        // Remove from worker checklists
        state.workers.forEach(w => {
            if (w.checklist[reqId]) {
                delete w.checklist[reqId];
            }
        });
        
        saveState();
        clearReqForm();
        renderAll();
        showToast("Requisito legal eliminado del sistema.", "warning");
    }
}

function clearReqForm() {
    document.getElementById("reqFormTitle").textContent = "Agregar Nuevo Requisito";
    document.getElementById("reqIdInput").value = "";
    document.getElementById("requirementForm").reset();
    document.getElementById("cancelReqEditBtn").textContent = "Limpiar Formulario";
}

/* ==========================================================================
   Backup Operations
   ========================================================================== */
function exportData() {
    const dataStr = JSON.stringify(state, null, 4);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const tempLink = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    tempLink.href = url;
    tempLink.download = `xuri_control_respaldo_${date}.json`;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
    
    showToast("Copia de seguridad descargada con éxito.");
}

function importData() {
    const fileInput = document.getElementById("importFileInput");
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!importedData.requirements || !importedData.workers) {
                showToast("Archivo de respaldo inválido. Falta lista de trabajadores o requisitos.", "warning");
                return;
            }
            
            if (confirm("¿Confirmas la importación de datos? Esto REEMPLAZARÁ toda la información cargada actualmente en este computador.")) {
                state = importedData;
                saveState();
                renderAll();
                
                // Clear file input UI
                fileInput.value = "";
                document.querySelector(".file-upload-label span").textContent = "Seleccionar archivo .json";
                const importBtn = document.getElementById("importDataBtn");
                importBtn.setAttribute("disabled", "true");
                importBtn.classList.add("btn-outline");
                importBtn.classList.remove("btn-primary");
                
                showToast("Base de datos importada exitosamente.");
            }
        } catch (err) {
            console.error("Error importing file", err);
            showToast("Error al procesar el archivo. Asegúrese de que sea un JSON válido.", "warning");
        }
    };
    
    reader.readAsText(file);
}

/* ==========================================================================
   Global Toast Notifications
   ========================================================================== */
function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    const toastMsg = document.getElementById("toastMessage");
    const toastIcon = toast.querySelector(".toast-icon");
    
    toastMsg.textContent = message;
    
    // Set custom icon & border color base on notice type
    if (type === "warning") {
        toast.style.borderColor = "var(--status-pending)";
        toastIcon.className = "fa-solid fa-circle-exclamation toast-icon text-pending";
        toastIcon.style.color = "var(--status-pending)";
    } else {
        toast.style.borderColor = "var(--accent)";
        toastIcon.className = "fa-solid fa-circle-info toast-icon text-info";
        toastIcon.style.color = "var(--accent)";
    }
    
    toast.classList.remove("hidden");
    
    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

/* ==========================================================================
   Carga Masiva (Batch Load) - Lógica de Importación
   ========================================================================== */
function handleBatchWorkers() {
    const text = document.getElementById("batchWorkersTextArea").value;
    if (!text.trim()) {
        showToast("El cuadro de texto está vacío.", "warning");
        return;
    }
    
    const lines = text.split("\n");
    let addedCount = 0;
    let skippedCount = 0;
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        // Separador por tabs (Excel) o por comas
        let cells = [];
        if (line.includes("\t")) {
            cells = line.split("\t");
        } else {
            cells = line.split(",");
        }
        
        const name = cells[0] ? cells[0].trim() : "";
        const idCard = cells[1] ? cells[1].trim().replace(/\D/g, "") : ""; // Solo números
        const cargo = cells[2] ? cells[2].trim() : "";
        const dateStr = cells[3] ? cells[3].trim() : "";
        
        // Validación básica
        if (!name || idCard.length !== 10) {
            skippedCount++;
            return;
        }
        
        // Verificar duplicados de cédula
        if (state.workers.some(w => w.idCard === idCard)) {
            skippedCount++;
            return;
        }
        
        // Formatear fecha
        let dateIngreso = "";
        if (dateStr) {
            if (dateStr.includes("/")) {
                const parts = dateStr.split("/");
                if (parts.length === 3) {
                    let day = parts[0].padStart(2, "0");
                    let month = parts[1].padStart(2, "0");
                    let year = parts[2].trim();
                    if (year.length === 2) year = "20" + year;
                    dateIngreso = `${year}-${month}-${day}`;
                }
            } else if (dateStr.includes("-")) {
                dateIngreso = dateStr;
            }
        }
        if (!dateIngreso) {
            dateIngreso = new Date().toISOString().slice(0, 10);
        }
        
        const newId = `work-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newWorker = {
            id: newId,
            name: name,
            idCard: idCard,
            cargo: cargo || "Operario",
            dateIngreso: dateIngreso,
            status: "Pendiente",
            checklist: {}
        };
        
        // Inicializar requisitos para este trabajador
        state.requirements.forEach(req => {
            newWorker.checklist[req.id] = {
                physical: false,
                digital: false,
                status: "Pendiente",
                observation: ""
            };
        });
        
        state.workers.push(newWorker);
        addedCount++;
    });
    
    if (addedCount > 0) {
        saveState();
        renderAll();
        document.getElementById("batchWorkersTextArea").value = "";
        showToast(`Se cargaron ${addedCount} trabajadores. (Omitidos: ${skippedCount})`);
    } else {
        showToast("No se encontraron filas válidas para procesar. Verifica el formato.", "warning");
    }
}

function handleBatchReqs() {
    const text = document.getElementById("batchReqsTextArea").value;
    if (!text.trim()) {
        showToast("El cuadro de texto está vacío.", "warning");
        return;
    }
    
    const lines = text.split("\n");
    let addedCount = 0;
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        const parts = line.split(",");
        const name = parts[0] ? parts[0].trim() : "";
        let priority = parts[1] ? parts[1].trim().toUpperCase() : "MEDIA";
        
        if (!["CRÍTICA", "ALTA", "MEDIA"].includes(priority)) {
            priority = "MEDIA";
        }
        
        if (!name) return;
        
        // Evitar duplicados de nombre de requisito
        if (state.requirements.some(r => r.name.toLowerCase() === name.toLowerCase())) {
            return;
        }
        
        const newReqId = `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const newReq = {
            id: newReqId,
            name: name,
            desc: "Agregado mediante carga masiva rápida.",
            priority: priority
        };
        
        state.requirements.push(newReq);
        
        // Asignar a todos los trabajadores registrados
        state.workers.forEach(w => {
            w.checklist[newReqId] = {
                physical: false,
                digital: false,
                status: "Pendiente",
                observation: ""
            };
        });
        
        addedCount++;
    });
    
    if (addedCount > 0) {
        saveState();
        renderAll();
        document.getElementById("batchReqsTextArea").value = "";
        showToast(`Se agregaron ${addedCount} nuevos requisitos normativos.`);
    } else {
        showToast("No se encontraron requisitos nuevos o válidos.", "warning");
    }
}

/* ==========================================================================
   Reporte General de Impresión - PDF / Impresora
   ========================================================================== */
function generatePrintReport() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        showToast("Bloqueador de ventanas emergentes activo. Permite ventanas emergentes para ver el reporte.", "warning");
        return;
    }
    
    const date = new Date().toLocaleDateString("es-EC", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
    
    const sortedWorkers = [...state.workers].sort((a, b) => a.name.localeCompare(b.name));
    
    // Cabeceras de requisitos
    let headersHTML = "";
    state.requirements.forEach(req => {
        headersHTML += `<th style="font-size: 9px; text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${req.name}<br><small style="font-weight:normal;color:#64748b;">(${req.priority})</small></th>`;
    });
    
    // Filas de trabajadores
    let rowsHTML = "";
    sortedWorkers.forEach(w => {
        const score = calculateWorkerComplianceScore(w);
        let cellsHTML = "";
        
        state.requirements.forEach(req => {
            const check = w.checklist[req.id] || { physical: false, digital: false, status: "Pendiente" };
            let statusText = "";
            let color = "#ef4444";
            
            if (check.physical && check.digital) {
                statusText = "FÍS: OK | DIG: OK";
                color = "#10b981";
            } else if (check.physical || check.digital) {
                statusText = `FÍS: ${check.physical ? "OK" : "❌"}<br>DIG: ${check.digital ? "OK" : "❌"}`;
                color = "#f59e0b";
            } else {
                statusText = "FALTA EXPEDIENTE";
                color = "#ef4444";
            }
            
            cellsHTML += `
                <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-size: 8.5px; font-weight: bold; color: ${color}; line-height:1.2;">
                    ${statusText}
                </td>
            `;
        });
        
        rowsHTML += `
            <tr style="page-break-inside: avoid;">
                <td style="border: 1px solid #cbd5e1; padding: 8px; font-weight: bold; font-size: 11px;">${w.name}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 10px; font-family: monospace; text-align:center;">${w.idCard}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; font-size: 10px;">${w.cargo || "Operario"}</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; font-weight: 800; font-size: 11px; color: ${score === 100 ? "#10b981" : score > 0 ? "#f59e0b" : "#ef4444"}; background: #fafafa;">
                    ${score}%
                </td>
                ${cellsHTML}
            </tr>
        `;
    });
    
    // Estadísticas
    const totalWorkers = state.workers.length;
    let complianceSum = 0;
    let okCount = 0;
    state.workers.forEach(w => {
        const score = calculateWorkerComplianceScore(w);
        complianceSum += score;
        if (score === 100) okCount++;
    });
    const avgCompliance = totalWorkers > 0 ? Math.round(complianceSum / totalWorkers) : 0;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte General de Cumplimiento - XURI S.A.</title>
            <style>
                body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 20px; line-height: 1.4; background: #ffffff; }
                .header-table { width: 100%; margin-bottom: 20px; border-bottom: 3px double #0ea5e9; padding-bottom: 15px; }
                .title-area h1 { margin: 0; font-size: 24px; font-weight: 800; color: #0ea5e9; text-transform: uppercase; }
                .title-area p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: bold; }
                .stats-grid { display: flex; gap: 15px; margin-bottom: 25px; }
                .stat-box { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; flex-grow: 1; text-align: center; background: #f8fafc; }
                .stat-box h4 { margin: 0 0 6px 0; font-size: 9px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
                .stat-box span { font-size: 18px; font-weight: 800; color: #0f172a; }
                .main-table { width: 100%; border-collapse: collapse; margin-bottom: 45px; }
                .main-table th { background-color: #f1f5f9; color: #0f172a; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-transform: uppercase; font-size: 9px; }
                .signatures { display: flex; justify-content: space-between; margin-top: 60px; page-break-inside: avoid; }
                .sig-box { width: 45%; border-top: 1px solid #94a3b8; text-align: center; padding-top: 10px; font-size: 11px; }
                @media print {
                    body { padding: 0; }
                    .stat-box { background: #ffffff !important; }
                    @page { margin: 1cm; }
                }
            </style>
        </head>
        <body>
            <table class="header-table">
                <tr>
                    <td class="title-area">
                        <h1>XURI S.A.</h1>
                        <p>Reporte de Auditoría y Cumplimiento Laboral Normativo</p>
                    </td>
                    <td style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.3;">
                        <strong>Generado:</strong> ${date}<br>
                        <strong>Sede Principal:</strong> La Troncal, Cañar<br>
                        <strong>Auditores:</strong> Equipo XURI
                    </td>
                </tr>
            </table>

            <div class="stats-grid">
                <div class="stat-box">
                    <h4>Trabajadores Auditados</h4>
                    <span>${totalWorkers}</span>
                </div>
                <div class="stat-box">
                    <h4>Cumplimiento General</h4>
                    <span style="color: #0ea5e9;">${avgCompliance}%</span>
                </div>
                <div class="stat-box">
                    <h4>Expedientes al Día (100%)</h4>
                    <span style="color: #10b981;">${okCount}</span>
                </div>
                <div class="stat-box">
                    <h4>Expedientes Faltantes</h4>
                    <span style="color: #ef4444;">${totalWorkers - okCount}</span>
                </div>
            </div>

            <table class="main-table">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 18%;">Trabajador</th>
                        <th style="width: 10%;">Cédula</th>
                        <th style="width: 12%;">Cargo</th>
                        <th style="width: 8%;">Cumplimiento</th>
                        ${headersHTML}
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>

            <div class="signatures">
                <div class="sig-box">
                    <strong>Firma del Operador (Asistente)</strong>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 10px;">Responsable de Validación Documental</p>
                </div>
                <div class="sig-box">
                    <strong>Firma del Fiscalizador (Dueño)</strong>
                    <p style="margin: 4px 0 0 0; color: #64748b; font-size: 10px;">Auditores Externos / Gerencia XURI</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 500);
                }
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

/* ==========================================================================
   Sincronización en Tiempo Real - Firebase Integration
   ========================================================================== */
let fbDocRef = null;
let fbUnsubscribe = null;

function initFirebase() {
    const fbActive = localStorage.getItem("xuri_firebase_active") === "true";
    if (!fbActive) return;

    const configStr = localStorage.getItem("xuri_firebase_config");
    if (!configStr) return;

    try {
        const config = JSON.parse(configStr);
        
        // Rellenar la UI de configuración
        document.getElementById("firebaseActiveCheckbox").checked = true;
        document.getElementById("firebaseSettingsArea").classList.remove("hidden");
        document.getElementById("fbApiKey").value = config.apiKey || "";
        document.getElementById("fbProjectId").value = config.projectId || "";
        document.getElementById("fbAppId").value = config.appId || "";

        // Cargar librerías y conectar
        loadFirebaseScripts(() => {
            connectFirebase(config);
        });
    } catch (e) {
        console.error("Error al restaurar conexión Firebase", e);
    }
}

function loadFirebaseScripts(callback) {
    if (window.firebase) {
        callback();
        return;
    }

    const appScript = document.createElement("script");
    appScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js";
    appScript.onload = () => {
        const dbScript = document.createElement("script");
        dbScript.src = "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js";
        dbScript.onload = callback;
        document.head.appendChild(dbScript);
    };
    document.head.appendChild(appScript);
}

function connectFirebase(config) {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        
        const db = firebase.firestore();
        fbDocRef = db.collection("xuri_control").doc("compliance_data");
        
        // Activar la escucha en tiempo real
        fbUnsubscribe = fbDocRef.onSnapshot(doc => {
            if (doc.exists) {
                const cloudData = doc.data();
                if (cloudData && cloudData.requirements && cloudData.workers) {
                    state = cloudData;
                    renderAll();
                }
            } else {
                // Subir el estado actual a la nube si está vacío
                fbDocRef.set(state);
            }
        }, err => {
            console.error("Error en tiempo real Firebase", err);
            showToast("Error de conexión a la nube de Firebase. Revisa las reglas de seguridad.", "warning");
        });
        
    } catch (e) {
        console.error("Error inicializando Firebase SDK", e);
        showToast("Error de configuración de Firebase.", "warning");
    }
}

function saveAndConnectFirebase() {
    const apiKey = document.getElementById("fbApiKey").value.trim();
    const projectId = document.getElementById("fbProjectId").value.trim();
    const appId = document.getElementById("fbAppId").value.trim();
    
    if (!apiKey || !projectId || !appId) {
        showToast("Debes ingresar la API Key, Project ID y App ID.", "warning");
        return;
    }
    
    // Auth domain y storage bucket generados por convención a partir del Project ID
    const config = {
        apiKey: apiKey,
        authDomain: `${projectId}.firebaseapp.com`,
        projectId: projectId,
        storageBucket: `${projectId}.appspot.com`,
        appId: appId
    };
    
    // Guardar en el almacenamiento local
    localStorage.setItem("xuri_firebase_config", JSON.stringify(config));
    localStorage.setItem("xuri_firebase_active", "true");
    
    showToast("Configuración guardada. Conectando con Firebase...");
    
    // Conectar
    if (fbUnsubscribe) fbUnsubscribe();
    loadFirebaseScripts(() => {
        connectFirebase(config);
    });
}

function handleBatchExcelWorkers() {
    const fileInput = document.getElementById("batchWorkersExcelInput");
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Obtener filas como matrices
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (rows.length <= 1) {
                showToast("El archivo de Excel no contiene suficientes datos.", "warning");
                return;
            }
            
            // Buscar los índices de las columnas según los encabezados
            const headers = rows[0].map(h => String(h).toLowerCase().trim());
            
            let nameIdx = headers.findIndex(h => h.includes("nom") || h.includes("worker") || h.includes("empleado") || h.includes("trabajador"));
            let idCardIdx = headers.findIndex(h => h.includes("ced") || h.includes("id") || h.includes("ident") || h.includes("nui"));
            let cargoIdx = headers.findIndex(h => h.includes("carg") || h.includes("puesto") || h.includes("rol") || h.includes("funcion"));
            let dateIdx = headers.findIndex(h => h.includes("fec") || h.includes("ing") || h.includes("entr") || h.includes("date"));
            
            // Índices por defecto si no se encuentran por nombre de cabecera
            if (nameIdx === -1) nameIdx = 0;
            if (idCardIdx === -1) idCardIdx = 1;
            if (cargoIdx === -1) cargoIdx = 2;
            if (dateIdx === -1) dateIdx = 3;
            
            let addedCount = 0;
            let skippedCount = 0;
            
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i];
                if (!cells || cells.length === 0) continue;
                
                const name = cells[nameIdx] ? String(cells[nameIdx]).trim() : "";
                let idCard = cells[idCardIdx] ? String(cells[idCardIdx]).trim().replace(/\D/g, "") : "";
                const cargo = cells[cargoIdx] ? String(cells[cargoIdx]).trim() : "";
                const dateVal = cells[dateIdx];
                
                if (!name || idCard.length !== 10) {
                    skippedCount++;
                    continue;
                }
                
                if (state.workers.some(w => w.idCard === idCard)) {
                    skippedCount++;
                    continue;
                }
                
                let dateIngreso = "";
                if (dateVal) {
                    if (typeof dateVal === "number") {
                        // Número de fecha serializado de Excel
                        const dateObj = new Date((dateVal - 25569) * 86400 * 1000);
                        dateIngreso = dateObj.toISOString().slice(0, 10);
                    } else {
                        const dateStr = String(dateVal).trim();
                        if (dateStr.includes("/")) {
                            const parts = dateStr.split("/");
                            if (parts.length === 3) {
                                let day = parts[0].padStart(2, "0");
                                let month = parts[1].padStart(2, "0");
                                let year = parts[2].trim();
                                if (year.length === 2) year = "20" + year;
                                dateIngreso = `${year}-${month}-${day}`;
                            }
                        } else if (dateStr.includes("-")) {
                            dateIngreso = dateStr;
                        }
                    }
                }
                if (!dateIngreso) {
                    dateIngreso = new Date().toISOString().slice(0, 10);
                }
                
                const newId = `work-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                const newWorker = {
                    id: newId,
                    name: name,
                    idCard: idCard,
                    cargo: cargo || "Operario",
                    dateIngreso: dateIngreso,
                    status: "Pendiente",
                    checklist: {}
                };
                
                // Inicializar requisitos para este trabajador
                state.requirements.forEach(req => {
                    newWorker.checklist[req.id] = {
                        physical: false,
                        digital: false,
                        status: "Pendiente",
                        observation: ""
                    };
                });
                
                state.workers.push(newWorker);
                addedCount++;
            }
            
            if (addedCount > 0) {
                saveState();
                renderAll();
                
                // Limpiar la UI
                fileInput.value = "";
                document.getElementById("excelUploadFileName").textContent = "Seleccionar archivo Excel (.xlsx, .xls, .csv)";
                document.getElementById("processBatchExcelBtn").setAttribute("disabled", "true");
                
                showToast(`Se cargaron ${addedCount} trabajadores desde Excel. (Omitidos: ${skippedCount})`);
            } else {
                showToast("No se pudo cargar ningún trabajador. Revisa el formato de los datos.", "warning");
            }
        } catch (err) {
            console.error("Error al leer archivo Excel", err);
            showToast("Error al decodificar el archivo de Excel.", "warning");
        }
    };
    
    reader.readAsArrayBuffer(file);
}

