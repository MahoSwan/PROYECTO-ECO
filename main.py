"""
ClasifiEco - Sistema de clasificación de residuos con IA
Punto de entrada principal de la aplicación
"""
import sys
import os

# Agregar ruta actual al path para importar módulos
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from utils.helpers import log_message, ensure_directory


class ClasifiEcoApp:
    """Aplicación principal de ClasifiEco"""
    
    def __init__(self):
        """Inicializar la aplicación"""
        log_message("🚀 Iniciando ClasifiEco...", "INFO")
        
        # Inicializar componentes (importación diferida para evitar errores)
        try:
            from hardware.bluetooth import SerialCommunication
            self.serial_comm = SerialCommunication()
            log_message("✅ Módulo hardware inicializado", "SUCCESS")
        except ImportError as e:
            log_message(f"⚠️ Hardware no disponible: {e}", "WARNING")
            self.serial_comm = None
        
        try:
            from ia.yolo_detector import WasteDetector
            self.detector = WasteDetector()
            log_message("✅ Módulo IA inicializado", "SUCCESS")
        except ImportError as e:
            log_message(f"⚠️ IA no disponible: {e}", "WARNING")
            self.detector = None
        
        self.is_connected = False
        self.start_time = None
        
        # Asegurar directorios necesarios
        ensure_directory("runs")
        ensure_directory("dataset/images")
        ensure_directory("dataset/labels")
    
    def run(self):
        """Ejecutar la aplicación"""
        log_message("🎯 Aplicación lista para usar", "SUCCESS")
        print("\n" + "="*60)
        print("CLASIFI-ECO - Sistema de Clasificación de Residuos")
        print("="*60)
        print("\nMódulos disponibles:")
        print("  🤖 ia.yolo_detector    - Detección de residuos con YOLOv8")
        print("  🔌 hardware.bluetooth  - Comunicación con Arduino")
        print("  🧰 utils.helpers       - Funciones auxiliares")
        print("  🖥️  ui.interfaz         - Interfaz gráfica (requiere Tkinter)")
        print("\nPara iniciar la interfaz web, abre index.html en tu navegador")
        print("="*60 + "\n")


if __name__ == "__main__":
    app = ClasifiEcoApp()
    app.run()
