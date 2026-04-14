"""
Dashboard principal de ClasifiEco - Interfaz gráfica con Tkinter
"""
import tkinter as tk
from tkinter import font as tkfont
import random
import time
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure
import matplotlib

matplotlib.use('TkAgg')

# Paleta de colores
COLORS = {
    "bg_dark": "#0a0e1a",
    "bg_panel": "#151b2d",
    "primary": "#3b82f6",
    "success": "#10b981",
    "error": "#ef4444",
    "warning": "#f59e0b",
    "text_main": "#f1f5f9",
    "text_dim": "#94a3b8"
}


class StatisticsView(tk.Frame):
    """Vista de estadísticas en tiempo real"""
    
    def __init__(self, parent, controller):
        super().__init__(parent, bg=COLORS["bg_dark"])
        self.controller = controller
        
        # Header
        header = tk.Frame(self, bg=COLORS["bg_dark"], height=60)
        header.pack(fill="x", padx=20, pady=10)
        tk.Label(header, text="Estadísticas en Tiempo Real", bg=COLORS["bg_dark"], 
                 fg=COLORS["text_main"], font=self.controller.title_font).pack(side="left")
        
        # Contenedor principal con scroll
        self.canvas_container = tk.Canvas(self, bg=COLORS["bg_dark"], highlightthickness=0)
        self.canvas_container.pack(fill="both", expand=True, padx=20, pady=10)
        
        # Frame para los gráficos
        self.stats_frame = tk.Frame(self.canvas_container, bg=COLORS["bg_dark"])
        self.stats_frame.pack(fill="both", expand=True)
        
        # Inicializar datos
        self.hourly_data = [random.randint(5, 15) for _ in range(24)]
        self.material_data = {'PET': 45, 'Aluminio': 32, 'Cartón': 28, 'HDPE': 25, 'Vidrio': 18, 'Orgánico': 12}
        self.efficiency_data = {'PET': 95, 'Aluminio': 92, 'Cartón': 88, 'HDPE': 90, 'Vidrio': 85, 'Orgánico': 98}
        
        # Crear gráficos
        self.create_charts()
        
        # Métricas en tiempo real
        self.create_realtime_metrics()
        
    def create_charts(self):
        """Crear los tres gráficos principales"""
        self.create_line_chart()
        self.create_pie_chart()
        self.create_bar_chart()
        
    def create_line_chart(self):
        """Gráfico de líneas - Clasificaciones por hora"""
        chart_frame = tk.Frame(self.stats_frame, bg=COLORS["bg_panel"], padx=10, pady=10)
        chart_frame.pack(fill="x", pady=10)
        
        tk.Label(chart_frame, text="📈 Clasificaciones por Hora (Últimas 24h)", 
                 bg=COLORS["bg_panel"], fg=COLORS["text_main"], 
                 font=("Segoe UI", 11, "bold")).pack(anchor="w", pady=(0, 10))
        
        fig = Figure(figsize=(8, 4), facecolor=COLORS["bg_panel"])
        ax = fig.add_subplot(111)
        ax.set_facecolor(COLORS["bg_panel"])
        
        hours = [f"{h:02d}:00" for h in range(24)]
        ax.plot(hours, self.hourly_data, color='#3b82f6', linewidth=2, marker='o', markersize=4)
        ax.fill_between(range(24), self.hourly_data, alpha=0.3, color='#3b82f6')
        ax.tick_params(colors=COLORS["text_dim"])
        ax.spines['bottom'].set_color(COLORS["text_dim"])
        ax.spines['left'].set_color(COLORS["text_dim"])
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        
        self.line_chart_data = self.hourly_data
        self.line_chart_ax = ax
        self.line_chart_canvas = canvas
        
    def create_pie_chart(self):
        """Gráfico de pastel - Distribución por material"""
        chart_frame = tk.Frame(self.stats_frame, bg=COLORS["bg_panel"], padx=10, pady=10)
        chart_frame.pack(fill="x", pady=10)
        
        tk.Label(chart_frame, text="🥧 Distribución por Tipo de Material", 
                 bg=COLORS["bg_panel"], fg=COLORS["text_main"], 
                 font=("Segoe UI", 11, "bold")).pack(anchor="w", pady=(0, 10))
        
        fig = Figure(figsize=(6, 4), facecolor=COLORS["bg_panel"])
        ax = fig.add_subplot(111)
        
        colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']
        ax.pie(list(self.material_data.values()), labels=list(self.material_data.keys()), 
               autopct='%1.1f%%', colors=colors, startangle=90)
        ax.axis('equal')
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        
        self.pie_chart_data = self.material_data
        self.pie_chart_canvas = canvas
        
    def create_bar_chart(self):
        """Gráfico de barras - Eficiencia"""
        chart_frame = tk.Frame(self.stats_frame, bg=COLORS["bg_panel"], padx=10, pady=10)
        chart_frame.pack(fill="x", pady=10)
        
        tk.Label(chart_frame, text="📊 Eficiencia de Clasificación por Categoría", 
                 bg=COLORS["bg_panel"], fg=COLORS["text_main"], 
                 font=("Segoe UI", 11, "bold")).pack(anchor="w", pady=(0, 10))
        
        fig = Figure(figsize=(10, 4), facecolor=COLORS["bg_panel"])
        ax = fig.add_subplot(111)
        ax.set_facecolor(COLORS["bg_panel"])
        
        materials = list(self.efficiency_data.keys())
        efficiencies = list(self.efficiency_data.values())
        colors = ['#3b82f6', '#22c55e', '#eab308', '#f97316', '#ef4444', '#8b5cf6']
        
        ax.bar(materials, efficiencies, color=colors, edgecolor='white', linewidth=2)
        ax.set_ylim(0, 100)
        ax.tick_params(colors=COLORS["text_dim"])
        ax.spines['bottom'].set_color(COLORS["text_dim"])
        ax.spines['left'].set_color(COLORS["text_dim"])
        
        # Agregar valores sobre las barras
        for i, v in enumerate(efficiencies):
            ax.text(i, v + 2, f'{v}%', ha='center', color=COLORS["text_main"], fontweight='bold')
        
        canvas = FigureCanvasTkAgg(fig, master=chart_frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True)
        
        self.bar_chart_canvas = canvas
        
    def create_realtime_metrics(self):
        """Métricas en tiempo real"""
        metrics_frame = tk.Frame(self.stats_frame, bg=COLORS["bg_dark"])
        metrics_frame.pack(fill="x", pady=20)
        
        self.realtime_labels = {}
        metrics = [
            ("⚡ Tasa Actual", "0/min", COLORS["primary"]),
            ("🎯 Precisión IA", "0%", COLORS["success"]),
            ("♻️ Total Reciclado", "0 kg", COLORS["primary"]),
            ("⏱️ Tiempo Activo", "00:00:00", COLORS["text_main"])
        ]
        
        for i, (label, value, color) in enumerate(metrics):
            metric_card = tk.Frame(metrics_frame, bg=COLORS["bg_panel"], padx=20, pady=15)
            metric_card.grid(row=0, column=i, sticky="ew", padx=10)
            metrics_frame.columnconfigure(i, weight=1)
            
            tk.Label(metric_card, text=label, bg=COLORS["bg_panel"], 
                     fg=COLORS["text_dim"], font=("Segoe UI", 9)).pack(anchor="w")
            lbl_value = tk.Label(metric_card, text=value, bg=COLORS["bg_panel"], 
                                 fg=color, font=("Segoe UI", 16, "bold"))
            lbl_value.pack(anchor="w")
            self.realtime_labels[label] = lbl_value
            
    def update_statistics(self):
        """Actualizar estadísticas en tiempo real"""
        if not self.controller.is_connected:
            return
            
        # Actualizar gráfico de línea
        current_hour = time.localtime().tm_hour
        self.line_chart_data[current_hour] += random.randint(1, 3)
        self.line_chart_ax.clear()
        self.line_chart_ax.plot(range(24), self.line_chart_data, color='#3b82f6', 
                                linewidth=2, marker='o', markersize=4)
        self.line_chart_ax.fill_between(range(24), self.line_chart_data, alpha=0.3, color='#3b82f6')
        self.line_chart_canvas.draw()
        
        # Actualizar gráfico de pastel
        material = random.choice(list(self.pie_chart_data.keys()))
        self.pie_chart_data[material] += 1
        self.create_pie_chart()
        
        # Actualizar métricas en tiempo real
        self.realtime_labels["⚡ Tasa Actual"].configure(text=f"{random.randint(5, 15)}/min")
        self.realtime_labels["🎯 Precisión IA"].configure(text=f"{random.uniform(85, 98):.1f}%")
        total_kg = sum(self.pie_chart_data.values()) * 0.15
        self.realtime_labels["♻️ Total Reciclado"].configure(text=f"{total_kg:.1f} kg")
        
        # Tiempo activo
        if hasattr(self.controller, 'start_time') and self.controller.start_time:
            elapsed = int(time.time() - self.controller.start_time)
            hours = elapsed // 3600
            minutes = (elapsed % 3600) // 60
            seconds = elapsed % 60
            self.realtime_labels["⏱️ Tiempo Activo"].configure(
                text=f"{hours:02d}:{minutes:02d}:{seconds:02d}")
