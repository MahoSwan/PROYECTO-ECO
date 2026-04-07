// --- ESTADO DEL SISTEMA ---
let isConnected = false;
let wasteCount = 0;
let errorCount = 0;
let startTime = null;
let classificationsByHour = Array(24).fill(0).map(() => Math.floor(Math.random() * 20) + 5);
let materialData = {
    'PET': Math.floor(Math.random() * 50) + 20,
    'Aluminio': Math.floor(Math.random() * 40) + 15,
    'Cartón': Math.floor(Math.random() * 35) + 10,
    'HDPE': Math.floor(Math.random() * 30) + 8,
    'Vidrio': Math.floor(Math.random() * 25) + 5,
    'Orgánico': Math.floor(Math.random() * 45) + 18
};

let hourlyChart, materialChart, efficiencyChart;
let chartUpdateInterval;

// --- INICIALIZAR GRÁFICOS CON ESTILO ---
function initCharts() {
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";
    
    // Gradientes para gráficos
    const gradientBlue = document.getElementById('hourlyChart').getContext('2d')
        .createLinearGradient(0, 0, 0, 400);
    gradientBlue.addColorStop(0, 'rgba(59, 130, 246, 0.4)');
    gradientBlue.addColorStop(1, 'rgba(59, 130, 246, 0.01)');
    
    // Gráfico de líneas
    const hourlyCtx = document.getElementById('hourlyChart').getContext('2d');
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
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    borderColor: 'rgba(59, 130, 246, 0.3)',
                    borderWidth: 1,
                    padding: 16,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Clasificaciones: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: { stepSize: 10 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    
    // Gráfico de pastel
    const materialCtx = document.getElementById('materialChart').getContext('2d');
    materialChart = new Chart(materialCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(materialData),
            datasets: [{
                data: Object.values(materialData),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'
                ],
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
                    labels: {
                        boxWidth: 16,
                        padding: 20,
                        font: { size: 12, family: "'Segoe UI', sans-serif" },
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
    
    // Gráfico de barras
    const efficiencyCtx = document.getElementById('efficiencyChart').getContext('2d');
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
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: 'rgba(255,255,255,0.03)' },
                    ticks: {
                        callback: value => value + '%',
                        stepSize: 20
                    }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function generateHourLabels() {
    const labels = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(hour.getHours().toString().padStart(2, '0') + 'h');
    }
    return labels;
}

function updateCharts() {
    if (!isConnected) return;
    
    // Actualizar datos aleatoriamente
    const currentHour = new Date().getHours();
    if (Math.random() > 0.5) {
        classificationsByHour[currentHour] += Math.floor(Math.random() * 5);
        hourlyChart.data.datasets[0].data = classificationsByHour;
        hourlyChart.update('none');
    }
    
    // Actualizar materiales
    if (Math.random() > 0.6) {
        const materials = Object.keys(materialData);
        const randomMat = materials[Math.floor(Math.random() * materials.length)];
        materialData[randomMat] += 1;
        materialChart.data.datasets[0].data = Object.values(materialData);
        materialChart.update('none');
    }
    
    updateRealtimeMetrics();
}

function updateRealtimeMetrics() {
    const rate = Math.floor(Math.random() * 15) + 8;
    document.getElementById('rate-current').innerText = `${rate}/min`;
    
    const accuracy = (Math.random() * (98 - 92) + 92).toFixed(1);
    document.getElementById('ai-accuracy').innerText = `${accuracy}%`;
    
    const totalKg = (wasteCount * 0.15).toFixed(1);
    document.getElementById('total-recycled').innerText = `${totalKg} kg`;
    
    if (startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('uptime').innerText = `${hours}:${minutes}:${seconds}`;
    }
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`${viewName}-view`).classList.add('active');
    
    const buttons = document.querySelectorAll('.nav-btn');
    if(viewName === 'dashboard') buttons[0].classList.add('active');
    else if(viewName === 'console') buttons[1].classList.add('active');
    else if(viewName === 'statistics') {
        buttons[2].classList.add('active');
        if (!hourlyChart) setTimeout(initCharts, 100);
    }

    const titles = {
        'dashboard': '🎛️ Panel de Control',
        'console': '💻 Consola de Control',
        'statistics': '📊 Estadísticas en Tiempo Real'
    };
    document.getElementById('page-title').innerText = titles[viewName];
}

function logAction(message) {
    if (!isConnected) {
        alert("⚠️ Debe conectar el sistema primero");
        return;
    }

    const logsWindow = document.getElementById('console-logs');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${timeString}]</span> ${message}`;
    
    logsWindow.appendChild(entry);
    logsWindow.scrollTop = logsWindow.scrollHeight;
}

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
        startTime = null;
        logAction("❌ Conexión cerrada");
        
        if (chartUpdateInterval) clearInterval(chartUpdateInterval);
    }
}

function simulateData() {
    if (!isConnected) return;

    if (Math.random() > 0.3) {
        wasteCount++;
        document.getElementById('metric-count').innerText = wasteCount;
        
        const items = ["PET", "Aluminio", "Cartón", "HDPE", "Vidrio"];
        const detected = items[Math.floor(Math.random() * items.length)];
        const resultEl = document.getElementById('ai-result');
        
        resultEl.innerText = `✓ ${detected} Detectado`;
        resultEl.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        resultEl.style.webkitBackgroundClip = 'text';
        
        const randomTime = (Math.random() * (2.5 - 0.8) + 0.8).toFixed(1);
        document.getElementById('metric-time').innerText = `${randomTime}s`;
        document.getElementById('metric-recycle').innerText = `${Math.floor(Math.random() * (98 - 94) + 94)}%`;
    }
}

setInterval(simulateData, 1500);