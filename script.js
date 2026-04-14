/* ==========================================
   🌿 CLASIFI-ECO - LÓGICA JAVASCRIPT
   ========================================== */

const API_URL = "https://predict-69de5e15fbeb60f22304-dproatj77a-vp.a.run.app";
const API_KEY = "ul_6511bc5f0958c9abdeab8b133ed6827792decbc8";

// --- 1. ESTADO GLOBAL DEL SISTEMA ---
let isConnected = false;
let wasteCount = 0;
let startTime = null;
let chartUpdateInterval = null;

// Datos simulados para los gráficos
let classificationsByHour = Array(24).fill(0).map(() => Math.floor(Math.random() * 20) + 5);
let materialData = {
    'PET': Math.floor(Math.random() * 50) + 20,
    'Aluminio': Math.floor(Math.random() * 40) + 15,
    'Cartón': Math.floor(Math.random() * 35) + 10,
    'HDPE': Math.floor(Math.random() * 30) + 8,
    'Vidrio': Math.floor(Math.random() * 25) + 5,
    'Orgánico': Math.floor(Math.random() * 45) + 18
};

// Referencias a los gráficos de Chart.js
let hourlyChart, materialChart, efficiencyChart;

// ==========================================
// 🔄 2. NAVEGACIÓN ENTRE VISTAS (SPA)
// ==========================================
function switchView(viewName) {
    // Ocultar todas las vistas
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    // Mostrar la vista seleccionada
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
    }

    // Activar botón correspondiente en sidebar
    // Índices: info=0, dashboard=1, console=2, statistics=3
    const buttons = document.querySelectorAll('.nav-btn');
    const viewMap = { 'info': 0, 'dashboard': 1, 'console': 2, 'statistics': 3 };
    
    if (viewMap[viewName] !== undefined && buttons[viewMap[viewName]]) {
        buttons[viewMap[viewName]].classList.add('active');
    }

    // Lazy loading: Iniciar gráficos solo al entrar a Estadísticas
    if (viewName === 'statistics' && !hourlyChart) {
        setTimeout(initCharts, 100);
    }

    // Actualizar título del header
    const titles = {
        'info': 'ℹ️ Información del Proyecto',
        'dashboard': '🎛️ Panel de Control',
        'console': '💻 Consola de Control',
        'statistics': '📊 Estadísticas en Tiempo Real'
    };
    const titleEl = document.getElementById('page-title');
    if (titleEl && titles[viewName]) {
        titleEl.innerText = titles[viewName];
    }
}

// ==========================================
// 🎯 3. CARRUSEL ODS 12 (Para vista Info)
// ==========================================
const odsTexts = [
    "El ODS 12 de la ONU promueve un consumo y producción responsables, enfocándose en reducir el impacto ambiental y social mediante el uso eficiente de recursos, la reducción de residuos y el reciclaje.",
    "La clasificación adecuada de residuos es clave para su tratamiento, prevención de contaminación, ahorro de recursos y protección de la salud pública.",
    "Además de fomentar hábitos sostenibles en la comunidad universitaria y crear conciencia sobre la importancia del reciclaje desde la fuente.",
    "Nuestro proyecto ClasifiEco contribuye directamente a la meta 12.5: reducir considerablemente la generación de desechos mediante actividades de prevención, reducción, reciclado y reutilización."
];
let odsIndex = 0;

function odsSlide(direction) {
    odsIndex += direction;
    if (odsIndex >= odsTexts.length) odsIndex = 0;
    if (odsIndex < 0) odsIndex = odsTexts.length - 1;
    
    const textEl = document.getElementById('ods-text');
    if (textEl) {
        textEl.style.transition = 'opacity 0.3s ease';
        textEl.style.opacity = '0';
        setTimeout(() => {
            textEl.textContent = odsTexts[odsIndex];
            textEl.style.opacity = '1';
        }, 300);
    }
}

// Auto-rotación del carrusel cada 6 segundos
setInterval(() => odsSlide(1), 6000);

// ==========================================
// 📊 4. INICIALIZACIÓN DE GRÁFICOS (Chart.js)
// ==========================================
function initCharts() {
    // Verificar que Chart.js está cargado
    if (typeof Chart === 'undefined') {
        console.error("❌ Chart.js no está cargado. Verifica el CDN en tu HTML.");
        return;
    }

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";

    // --- Gráfico 1: Líneas (Clasificaciones por hora) ---
    const hourlyCtx = document.getElementById('hourlyChart');
    if (hourlyCtx) {
        const gradientBlue = hourlyCtx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradientBlue.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
        gradientBlue.addColorStop(1, 'rgba(59, 130, 246, 0.01)');

        hourlyChart = new Chart(hourlyCtx, {
            type: 'line',
            data: {
                labels: generateHourLabels(),
                datasets: [{
                    label: 'Clasificaciones',
                    data: classificationsByHour,
                    borderColor: '#3b82f6',
                    backgroundColor: gradientBlue,
                    borderWidth: 4,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#60a5fa'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { stepSize: 10 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- Gráfico 2: Dona (Distribución por material) ---
    const materialCtx = document.getElementById('materialChart');
    if (materialCtx) {
        materialChart = new Chart(materialCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(materialData),
                datasets: [{
                    data: Object.values(materialData),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'],
                    borderWidth: 0,
                    hoverOffset: 20
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 16, padding: 20, font: { size: 12, family: "'Segoe UI', sans-serif" }, color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // --- Gráfico 3: Barras (Eficiencia) ---
    const efficiencyCtx = document.getElementById('efficiencyChart');
    if (efficiencyCtx) {
        efficiencyChart = new Chart(efficiencyCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(materialData),
                datasets: [{
                    label: 'Precisión (%)',
                    data: [95, 92, 88, 90, 85, 98],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderRadius: 12,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { callback: v => v + '%', stepSize: 20 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

// ==========================================
// 🔌 7. CONTROL DE CONEXIÓN
// ==========================================
function toggleConnection(status) {
    isConnected = status;
    const statusEl = document.getElementById('global-status');
    const btnConnect = document.getElementById('btn-connect');
    const btnDisconnect = document.getElementById('btn-disconnect');

    if (isConnected) {
        statusEl.classList.add('status-connected');
        statusEl.querySelector('.status-text').innerText = "En Línea";
        btnConnect.disabled = true;
        btnDisconnect.disabled = false;
        startTime = Date.now();
        logAction("✅ Conexión establecida con el sistema");

        if (!hourlyChart) initCharts();
        chartUpdateInterval = setInterval(updateCharts, 2000);
    } else {
        statusEl.classList.remove('status-connected');
        statusEl.querySelector('.status-text').innerText = "Desconectado";
        btnConnect.disabled = false;
        btnDisconnect.disabled = true;
        logAction("❌ Conexión cerrada");
        startTime = null;

        if (chartUpdateInterval) clearInterval(chartUpdateInterval);
    }
}

// ==========================================
// 🤖 8. SIMULACIÓN DE DATOS (DASHBOARD)
// ==========================================

// ==========================================
// 🧹 LIMPIEZA AL CERRAR PÁGINA
// ==========================================
window.addEventListener('beforeunload', () => {
    if (chartUpdateInterval) clearInterval(chartUpdateInterval);
    if (hourlyChart) hourlyChart.destroy();
    if (materialChart) materialChart.destroy();
    if (efficiencyChart) efficiencyChart.destroy();
});

// ==========================================
// 🌐 API - ENVIAR IMAGEN
// ==========================================
async function enviarImagen(file) {
    if (!isConnected) {
        alert("Primero conecta el sistema");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("https://predict-69de5e15fbeb60f22304-dproatj77a-vp.a.run.app/predict", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${ul_6511bc5f0958c9abdeab8b133ed6827792decbc8}`
            },
            body: formData
        });

        if (!response.ok) throw new Error("Error en API");

        const data = await response.json();

        procesarResultado(data);

    } catch (error) {
        console.error(error);
        logAction("❌ Error con API");
    }
}

// ==========================================
// 🎯 PROCESAR RESULTADO REAL
// ==========================================
function procesarResultado(data) {
    const clase = data?.clase || "Desconocido";
    const confianza = ((data?.confianza || 0) * 100).toFixed(1);

    // 🔥 Actualizar dashboard
    setText("ai-result", clase);

    const box = document.getElementById("detection-box");
    if (box) {
        box.innerHTML = `<b>${clase}</b><br>${confianza}%`;

        if (clase.toLowerCase().includes("plastico")) {
            box.style.background = "rgba(0,150,255,0.2)";
        } else if (clase.toLowerCase().includes("organico")) {
            box.style.background = "rgba(0,200,100,0.2)";
        } else {
            box.style.background = "rgba(255,255,255,0.1)";
        }
    }

    // 📊 métricas
    wasteCount++;
    setText("metric-count", wasteCount);
    setText("metric-time", (Math.random()+0.3).toFixed(2)+"s");
    setText("metric-recycle", confianza + "%");

    // 📈 actualizar gráficos reales
    const hora = new Date().getHours();
    classificationsByHour[hora]++;

    if (hourlyChart) {
        hourlyChart.data.datasets[0].data = classificationsByHour;
        hourlyChart.update();
    }

    if (!materialData[clase]) materialData[clase] = 0;
    materialData[clase]++;

    if (materialChart) {
        materialChart.data.labels = Object.keys(materialData);
        materialChart.data.datasets[0].data = Object.values(materialData);
        materialChart.update();
    }

    logAction(`♻️ Detectado: ${clase} (${confianza}%)`);
}

// ==========================================
// 📸 INPUT HTML
// ==========================================
function subirImagen() {
    const input = document.getElementById("fileInput");

    if (!input || !input.files[0]) {
        alert("Selecciona una imagen");
        return;
    }

    enviarImagen(input.files[0]);
}