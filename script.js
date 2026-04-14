/* ==========================================
   🌿 CLASIFI-ECO - LÓGICA JAVASCRIPT
   Sistema de Clasificación de Residuos con IA
   ========================================== */

// ==========================================
// 🔧 CONFIGURACIÓN GLOBAL
// ==========================================
const CONFIG = {
    API_URL: "https://predict-69de5e15fbeb60f22304-dproatj77a-vp.a.run.app",
    API_KEY: "ul_6511bc5f0958c9abdeab8b133ed6827792decbc8",
    MAX_LOGS: 100,
    CHART_UPDATE_INTERVAL: 2000,
    AUTO_ROTATE_ODS_INTERVAL: 6000
};

// ==========================================
// 📦 ESTADO GLOBAL DEL SISTEMA
// ==========================================
const AppState = {
    isConnected: false,
    wasteCount: 0,
    startTime: null,
    chartUpdateInterval: null,
    classificationsByHour: Array(24).fill(0),
    materialData: {},
    detectionHistory: [],
    totalResponseTime: 0,
    lastDetection: null
};

// Referencias a gráficos de Chart.js
let Charts = {
    hourly: null,
    material: null,
    efficiency: null
};

// ==========================================
// 🛠️ FUNCIONES AUXILIARES
// ==========================================

/**
 * Verifica si un elemento existe en el DOM
 */
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Elemento '${id}' no encontrado`);
    }
    return element;
}

/**
 * Establece texto en un elemento
 */
function setText(id, text) {
    const element = getElement(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Obtiene timestamp formateado
 */
function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
}

/**
 * Genera etiquetas de horas para gráficos
 */
function generateHourLabels() {
    const labels = [];
    for (let i = 0; i < 24; i++) {
        labels.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return labels;
}

// ==========================================
// 📋 SISTEMA DE LOGS
// ==========================================

/**
 * Agrega un mensaje a la consola interna
 */
function logAction(message) {
    const logsWindow = getElement('logs-window');
    if (!logsWindow) return;

    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `<span class="log-time">[${getTimestamp()}]</span> ${message}`;
    
    logsWindow.appendChild(logEntry);
    
    const logs = logsWindow.querySelectorAll('.log-entry');
    if (logs.length > CONFIG.MAX_LOGS) {
        logs[0].remove();
    }
    
    logsWindow.scrollTop = logsWindow.scrollHeight;
    console.log(`[Clasifi-Eco] ${message}`);
}

// ==========================================
// 🔄 NAVEGACIÓN ENTRE VISTAS (SPA)
// ==========================================

/**
 * Cambia entre las diferentes vistas
 */
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    const targetView = getElement(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    const buttons = document.querySelectorAll('.nav-btn');
    const viewMap = { 'info': 0, 'dashboard': 1, 'console': 2, 'statistics': 3 };
    
    if (viewMap[viewName] !== undefined && buttons[viewMap[viewName]]) {
        buttons[viewMap[viewName]].classList.add('active');
    }

    if (viewName === 'statistics' && !Charts.hourly) {
        setTimeout(initCharts, 100);
    }

    const titles = {
        'info': 'ℹ️ Información del Proyecto',
        'dashboard': '🎛️ Panel de Control',
        'console': '💻 Consola de Control',
        'statistics': '📊 Estadísticas en Tiempo Real'
    };
    const titleEl = getElement('page-title');
    if (titleEl && titles[viewName]) {
        titleEl.innerText = titles[viewName];
    }

    logAction(`📍 Vista cambiada a: ${viewName}`);
}

// ==========================================
// 🎯 CARRUSEL ODS 12
// ==========================================

const odsTexts = [
    "El ODS 12 promueve consumo y producción responsables.",
    "La clasificación de residuos es clave para el tratamiento.",
    "Fomentamos hábitos sostenibles en la universidad.",
    "Contribuimos a reducir la generación de desechos."
];

let odsIndex = 0;

function odsSlide(direction) {
    odsIndex += direction;
    if (odsIndex >= odsTexts.length) odsIndex = 0;
    if (odsIndex < 0) odsIndex = odsTexts.length - 1;
    
    const textEl = getElement('ods-text');
    if (textEl) {
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.textContent = odsTexts[odsIndex];
            textEl.style.opacity = '1';
        }, 300);
    }
}

setInterval(() => odsSlide(1), CONFIG.AUTO_ROTATE_ODS_INTERVAL);

// ==========================================
// 📊 INICIALIZACIÓN DE GRÁFICOS (Chart.js)
// ==========================================

function initCharts() {
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no cargado");
        return;
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';

    // Gráfico 1: Líneas
    const hourlyCtx = document.getElementById('hourlyChart');
    if (hourlyCtx) {
        Charts.hourly = new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: generateHourLabels(),
                datasets: [{
                    label: 'Clasificaciones',
                    data: AppState.classificationsByHour,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // Gráfico 2: Dona
    const materialCtx = document.getElementById('materialChart');
    if (materialCtx) {
        Charts.material = new Chart(materialCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(AppState.materialData),
                datasets: [{
                    data: Object.values(AppState.materialData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'right' }
                }
            }
        });
    }

    // Gráfico 3: Barras
    const efficiencyCtx = document.getElementById('efficiencyChart');
    if (efficiencyCtx) {
        Charts.efficiency = new Chart(efficiencyCtx, {
            type: 'bar',
            data: {
                labels: ['PET', 'Aluminio', 'Cartón', 'HDPE', 'Vidrio', 'Orgánico'],
                datasets: [{
                    label: 'Precisión (%)',
                    data: [95, 92, 88, 90, 85, 98],
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    logAction('📊 Gráficos inicializados');
}

// ==========================================
// 🔌 CONTROL DE CONEXIÓN
// ==========================================

function toggleConnection(status) {
    AppState.isConnected = status;
    const statusEl = getElement('global-status');
    const btnConnect = getElement('btn-connect');
    const btnDisconnect = getElement('btn-disconnect');

    if (AppState.isConnected) {
        if (statusEl) {
            statusEl.classList.add('status-connected');
            statusEl.querySelector('.status-text').innerText = "En Línea";
        }
        if (btnConnect) btnConnect.disabled = true;
        if (btnDisconnect) btnDisconnect.disabled = false;
        
        AppState.startTime = Date.now();
        logAction("✅ Conexión establecida");

        if (!Charts.hourly) initCharts();
        AppState.chartUpdateInterval = setInterval(updateRealtimeMetrics, CONFIG.CHART_UPDATE_INTERVAL);
    } else {
        if (statusEl) {
            statusEl.classList.remove('status-connected');
            statusEl.querySelector('.status-text').innerText = "Desconectado";
        }
        if (btnConnect) btnConnect.disabled = false;
        if (btnDisconnect) btnDisconnect.disabled = true;
        
        logAction("❌ Conexión cerrada");
        AppState.startTime = null;

        if (AppState.chartUpdateInterval) clearInterval(AppState.chartUpdateInterval);
    }
}

// ==========================================
// 🌐 API - ENVIAR IMAGEN
// ==========================================

async function enviarImagen(file) {
    if (!AppState.isConnected) {
        alert("⚠️ Primero conecta el sistema");
        logAction("❌ Error: Sin conexión");
        return;
    }

    if (!file || !file.type.startsWith('image/')) {
        alert("⚠️ Selecciona una imagen válida");
        logAction("❌ Error: Archivo inválido");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const startTime = Date.now();
    logAction(`📤 Enviando: ${file.name}`);

    try {
        const response = await fetch(`${CONFIG.API_URL}/predict`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${CONFIG.API_KEY}`
            },
            body: formData
        });

        const responseTime = (Date.now() - startTime) / 1000;

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            throw new Error("Respuesta inválida");
        }

        if (!data || typeof data.clase === 'undefined') {
            throw new Error("Falta campo 'clase'");
        }

        AppState.totalResponseTime += responseTime;
        procesarResultado(data, responseTime);

    } catch (error) {
        console.error("Error:", error);
        
        if (error.message.includes('Failed to fetch')) {
            logAction("❌ Error de red (CORS/API caída)");
            alert("❌ Error de conexión con la API");
        } else {
            logAction(`❌ Error: ${error.message}`);
            alert(`❌ Error: ${error.message}`);
        }
    }
}

// ==========================================
// 🎯 PROCESAR RESULTADO
// ==========================================

function procesarResultado(data, responseTime) {
    const clase = data.clase || "Desconocido";
    const confianza = ((data.confianza || 0) * 100).toFixed(1);
    
    logAction(`✅ ${clase} (${confianza}%) en ${responseTime.toFixed(2)}s`);

    setText("ai-result", `${clase} (${confianza}%)`);

    const detectionBox = getElement("detection-box");
    if (detectionBox) {
        detectionBox.innerHTML = `<strong>${clase}</strong><br><small>${confianza}%</small>`;
        
        const claseLower = clase.toLowerCase();
        if (claseLower.includes("plastico") || claseLower.includes("pet")) {
            detectionBox.style.background = "rgba(59, 130, 246, 0.2)";
        } else if (claseLower.includes("organico")) {
            detectionBox.style.background = "rgba(16, 185, 129, 0.2)";
        } else if (claseLower.includes("papel") || claseLower.includes("carton")) {
            detectionBox.style.background = "rgba(245, 158, 11, 0.2)";
        } else if (claseLower.includes("vidrio")) {
            detectionBox.style.background = "rgba(239, 68, 68, 0.2)";
        } else {
            detectionBox.style.background = "rgba(255, 255, 255, 0.1)";
        }
    }

    AppState.wasteCount++;
    setText("metric-count", AppState.wasteCount);
    
    const avgTime = (AppState.totalResponseTime / AppState.wasteCount).toFixed(2);
    setText("metric-time", `${avgTime}s`);
    setText("metric-recycle", `${confianza}%`);

    updateRealtimeMetrics();

    const horaActual = new Date().getHours();
    AppState.classificationsByHour[horaActual]++;

    if (Charts.hourly) {
        Charts.hourly.data.datasets[0].data = AppState.classificationsByHour;
        Charts.hourly.update('none');
    }

    if (!AppState.materialData[clase]) AppState.materialData[clase] = 0;
    AppState.materialData[clase]++;

    if (Charts.material) {
        Charts.material.data.labels = Object.keys(AppState.materialData);
        Charts.material.data.datasets[0].data = Object.values(AppState.materialData);
        Charts.material.update('none');
    }

    AppState.detectionHistory.push({
        clase,
        confianza: parseFloat(confianza),
        timestamp: new Date(),
        responseTime
    });

    AppState.lastDetection = { clase, confianza, timestamp: Date.now() };
    logAction(`♻️ Clasificado: ${clase}`);
}

// ==========================================
// 📸 SUBIR IMAGEN
// ==========================================

function subirImagen() {
    const fileInput = getElement("fileInput");

    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
        alert("⚠️ Selecciona una imagen primero");
        logAction("⚠️ Intento sin imagen");
        return;
    }

    enviarImagen(fileInput.files[0]);
}

// ==========================================
// ⚡ MÉTRICAS EN TIEMPO REAL
// ==========================================

function updateRealtimeMetrics() {
    const rateCurrent = getElement('rate-current');
    if (rateCurrent && AppState.startTime) {
        const elapsedMinutes = (Date.now() - AppState.startTime) / 60000;
        const rate = elapsedMinutes > 0 ? (AppState.wasteCount / elapsedMinutes).toFixed(1) : 0;
        rateCurrent.textContent = `${rate}/min`;
    }

    const aiAccuracy = getElement('ai-accuracy');
    if (aiAccuracy && AppState.detectionHistory.length > 0) {
        const avgConfidence = AppState.detectionHistory.reduce((sum, d) => sum + d.confianza, 0) / AppState.detectionHistory.length;
        aiAccuracy.textContent = `${avgConfidence.toFixed(1)}%`;
    }

    const totalRecycled = getElement('total-recycled');
    if (totalRecycled) {
        totalRecycled.textContent = `${(AppState.wasteCount * 0.05).toFixed(2)} kg`;
    }

    const uptimeEl = getElement('uptime');
    if (uptimeEl && AppState.startTime) {
        const elapsed = Math.floor((Date.now() - AppState.startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        uptimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// ==========================================
// 🧹 LIMPIEZA
// ==========================================

window.addEventListener('beforeunload', () => {
    if (AppState.chartUpdateInterval) clearInterval(AppState.chartUpdateInterval);
    if (Charts.hourly) Charts.hourly.destroy();
    if (Charts.material) Charts.material.destroy();
    if (Charts.efficiency) Charts.efficiency.destroy();
});

// ==========================================
// 🚀 INICIALIZACIÓN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    logAction("🌿 Clasifi-Eco iniciado");
    logAction("📡 Esperando conexión...");
    
    const statusEl = getElement('global-status');
    if (statusEl) {
        statusEl.classList.remove('status-connected');
        statusEl.querySelector('.status-text').innerText = "Desconectado";
    }
    
    const btnDisconnect = getElement('btn-disconnect');
    if (btnDisconnect) btnDisconnect.disabled = true;
    
    logAction("✅ Sistema listo");
});
