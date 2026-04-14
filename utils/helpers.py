"""
Helpers - Funciones auxiliares para ClasifiEco
"""
import os
import json
from datetime import datetime
from typing import Dict, List, Any


def get_timestamp() -> str:
    """
    Obtener timestamp formateado
    
    Returns:
        String con formato YYYY-MM-DD_HH-MM-SS
    """
    return datetime.now().strftime("%Y-%m-%d_%H-%M-%S")


def ensure_directory(path: str) -> bool:
    """
    Asegurar que un directorio existe, crearlo si no
    
    Args:
        path: Ruta del directorio
        
    Returns:
        True si existe o fue creado exitosamente
    """
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except OSError as e:
        print(f"❌ Error creando directorio {path}: {e}")
        return False


def load_json(file_path: str) -> Dict:
    """
    Cargar archivo JSON
    
    Args:
        file_path: Ruta al archivo JSON
        
    Returns:
        Diccionario con los datos cargados
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Archivo no encontrado: {file_path}")
        return {}
    except json.JSONDecodeError as e:
        print(f"❌ Error decodificando JSON: {e}")
        return {}


def save_json(data: Dict, file_path: str, indent: int = 4) -> bool:
    """
    Guardar datos en archivo JSON
    
    Args:
        data: Datos a guardar
        file_path: Ruta del archivo
        indent: Número de espacios para indentación
        
    Returns:
        True si se guardó exitosamente
    """
    try:
        # Asegurar que el directorio existe
        directory = os.path.dirname(file_path)
        if directory:
            ensure_directory(directory)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=indent, ensure_ascii=False)
        return True
    except IOError as e:
        print(f"❌ Error guardando JSON: {e}")
        return False


def format_confidence(confidence: float) -> str:
    """
    Formatear valor de confianza como porcentaje
    
    Args:
        confidence: Valor entre 0 y 1
        
    Returns:
        String con formato "XX.X%"
    """
    return f"{confidence * 100:.1f}%"


def classify_waste_type(class_name: str) -> str:
    """
    Clasificar nombre de objeto a tipo de residuo
    
    Args:
        class_name: Nombre de la clase detectada
        
    Returns:
        Tipo de residuo (PET, Aluminio, Cartón, Vidrio, Orgánico, etc.)
    """
    waste_categories = {
        'PET': ['bottle', 'plastic bottle'],
        'Aluminio': ['can'],
        'Cartón': ['cardboard', 'paper', 'box'],
        'Vidrio': ['vase', 'wine glass', 'bottle'],
        'Orgánico': ['banana', 'apple', 'orange', 'pizza', 'sandwich', 'food'],
        'Plástico': ['cup', 'fork', 'knife', 'spoon', 'bowl'],
        'Electrónico': ['cell phone', 'laptop', 'keyboard', 'mouse']
    }
    
    class_lower = class_name.lower()
    
    for category, keywords in waste_categories.items():
        for keyword in keywords:
            if keyword in class_lower:
                return category
    
    return 'No clasificable'


def calculate_statistics(detections: List[Dict]) -> Dict[str, Any]:
    """
    Calcular estadísticas básicas de detecciones
    
    Args:
        detections: Lista de diccionarios con detecciones
        
    Returns:
        Diccionario con estadísticas
    """
    if not detections:
        return {
            'total': 0,
            'average_confidence': 0.0,
            'categories': {}
        }
    
    total = len(detections)
    confidences = [d.get('confidence', 0) for d in detections]
    avg_confidence = sum(confidences) / total if total > 0 else 0.0
    
    # Contar por categoría
    categories = {}
    for detection in detections:
        category = classify_waste_type(detection.get('class_name', ''))
        categories[category] = categories.get(category, 0) + 1
    
    return {
        'total': total,
        'average_confidence': avg_confidence,
        'categories': categories
    }


def log_message(message: str, level: str = "INFO", log_file: str = None) -> None:
    """
    Registrar mensaje en consola y opcionalmente en archivo
    
    Args:
        message: Mensaje a registrar
        level: Nivel del log (INFO, WARNING, ERROR, SUCCESS)
        log_file: Ruta opcional al archivo de logs
    """
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_msg = f"[{timestamp}] [{level}] {message}"
    
    # Colores ANSI para consola
    colors = {
        "INFO": "\033[94m",      # Azul
        "SUCCESS": "\033[92m",   # Verde
        "WARNING": "\033[93m",   # Amarillo
        "ERROR": "\033[91m"      # Rojo
    }
    reset = "\033[0m"
    
    color = colors.get(level, "")
    print(f"{color}{formatted_msg}{reset}")
    
    # Guardar en archivo si se especifica
    if log_file:
        try:
            ensure_directory(os.path.dirname(log_file))
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(formatted_msg + "\n")
        except IOError as e:
            print(f"⚠️ No se pudo escribir en log file: {e}")
