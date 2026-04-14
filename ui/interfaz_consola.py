"""
Consola de control para ClasifiEco - Interfaz de texto para debugging y control
"""
import tkinter as tk
from datetime import datetime


class ConsoleView(tk.Frame):
    """Vista de consola para logs y control del sistema"""
    
    def __init__(self, parent, controller):
        super().__init__(parent)
        self.controller = controller
        
        # Configurar estilo
        self.configure(bg="#0a0e1a")
        
        # Header
        header = tk.Frame(self, bg="#0a0e1a", height=60)
        header.pack(fill="x", padx=20, pady=10)
        tk.Label(header, text="💻 Consola de Control", bg="#0a0e1a", 
                 fg="#f1f5f9", font=("Segoe UI", 14, "bold")).pack(side="left")
        
        # Área de logs
        self.logs_frame = tk.Frame(self, bg="#0a0e1a")
        self.logs_frame.pack(fill="both", expand=True, padx=20, pady=10)
        
        # Canvas con scrollbar para logs
        self.canvas = tk.Canvas(self.logs_frame, bg="#0f172a", highlightthickness=0)
        self.scrollbar = tk.Scrollbar(self.logs_frame, orient="vertical", command=self.canvas.yview)
        self.scrollable_frame = tk.Frame(self.canvas, bg="#0f172a")
        
        self.scrollable_frame.bind(
            "<Configure>",
            lambda e: self.canvas.configure(scrollregion=self.canvas.bbox("all"))
        )
        
        self.canvas.create_window((0, 0), window=self.scrollable_frame, anchor="nw")
        self.canvas.configure(yscrollcommand=self.scrollbar.set)
        
        self.canvas.pack(side="left", fill="both", expand=True)
        self.scrollbar.pack(side="right", fill="y")
        
        # Área de entrada de comandos
        self.command_frame = tk.Frame(self, bg="#1e293b", height=80)
        self.command_frame.pack(fill="x", padx=20, pady=10)
        
        tk.Label(self.command_frame, text="Comando:", bg="#1e293b", 
                 fg="#94a3b8").pack(side="left", padx=10)
        
        self.command_entry = tk.Entry(self.command_frame, bg="#0f172a", 
                                       fg="#f1f5f9", insertbackground="#3b82f6",
                                       font=("Consolas", 11))
        self.command_entry.pack(side="left", fill="x", expand=True, padx=10, pady=10)
        self.command_entry.bind("<Return>", self.execute_command)
        
        self.send_btn = tk.Button(self.command_frame, text="Enviar", 
                                   command=self.execute_command,
                                   bg="#3b82f6", fg="white", 
                                   font=("Segoe UI", 10, "bold"),
                                   relief="flat", padx=20)
        self.send_btn.pack(side="right", padx=10, pady=10)
        
        # Lista de logs
        self.log_entries = []
        
    def add_log(self, message, level="INFO"):
        """Agregar un mensaje al log"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        colors = {
            "INFO": "#3b82f6",
            "SUCCESS": "#10b981",
            "WARNING": "#f59e0b",
            "ERROR": "#ef4444"
        }
        
        log_text = f"[{timestamp}] [{level}] {message}"
        
        label = tk.Label(self.scrollable_frame, text=log_text, 
                        bg="#0f172a", fg="#f1f5f9", 
                        font=("Consolas", 10), anchor="w", padx=10, pady=5)
        label.pack(fill="x", padx=5, pady=2)
        
        self.log_entries.append(label)
        
        # Auto-scroll al final
        self.canvas.yview_moveto(1.0)
        
        # Limitar número de logs mostrados
        if len(self.log_entries) > 100:
            self.log_entries[0].destroy()
            self.log_entries.pop(0)
    
    def execute_command(self, event=None):
        """Ejecutar comando ingresado"""
        command = self.command_entry.get().strip()
        if command:
            self.add_log(f"Comando ejecutado: {command}", "INFO")
            self.command_entry.delete(0, tk.END)
            
            # Aquí se puede agregar lógica para procesar comandos específicos
            if command.lower() == "clear":
                self.clear_logs()
            elif command.lower() == "status":
                self.add_log("Sistema en línea - Todos los módulos operativos", "SUCCESS")
            elif command.lower() == "help":
                self.add_log("Comandos disponibles: clear, status, help, connect, disconnect", "INFO")
            elif command.lower() == "connect":
                self.add_log("Intentando conectar...", "INFO")
            elif command.lower() == "disconnect":
                self.add_log("Desconectando...", "WARNING")
            else:
                self.add_log(f"Comando desconocido: {command}", "WARNING")
    
    def clear_logs(self):
        """Limpiar todos los logs"""
        for entry in self.log_entries:
            entry.destroy()
        self.log_entries = []
        self.add_log("Logs limpiados", "INFO")
