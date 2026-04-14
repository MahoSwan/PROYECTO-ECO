# 🌿 ClasifiEco - Sistema de Clasificación de Residuos con IA

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://python.org)
[![YOLOv8](https://img.shields.io/badge/YOLO-v8-purple.svg)](https://docs.ultralytics.com/)

Sistema inteligente de clasificación de residuos utilizando Inteligencia Artificial y visión por computadora.

## 📁 Estructura del Proyecto

```
clasifi-eco/
├── main.py                    # 🚀 Punto de entrada principal
├── ui/                        # 🖥️ Interfaces gráficas (Tkinter)
│   ├── __init__.py
│   ├── interfaz.py            # Dashboard principal
│   └── interfaz_consola.py    # Consola de control
├── ia/                        # 🤖 Módulo de Inteligencia Artificial
│   ├── __init__.py
│   └── yolo_detector.py       # Detección con YOLOv8
├── hardware/                  # 🔌 Comunicación con Arduino
│   ├── __init__.py
│   └── bluetooth.py           # Conexión serial
├── utils/                     # 🧰 Funciones auxiliares
│   ├── __init__.py
│   └── helpers.py             # Utilidades varias
├── assets/                    # 📷 Recursos visuales
│   ├── iconos/
│   └── imagenes/
├── dataset/                   # 📊 Datos de entrenamiento
│   ├── images/
│   └── labels/
├── runs/                      # 📈 Resultados de YOLO (auto-generado)
├── requirements.txt           # 📦 Dependencias
└── README.md                  # 📖 Este archivo
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd clasifi-eco
```

2. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

3. **Ejecutar la aplicación**
```bash
python main.py
```

## 📦 Dependencias

- **ultralytics** - Modelo YOLOv8 para detección de objetos
- **opencv-python** - Procesamiento de imágenes
- **pillow** - Manipulación de imágenes
- **tensorflow** - Backend de IA (opcional)
- **pyserial** - Comunicación serial con Arduino
- **matplotlib** - Gráficos en la interfaz
- **numpy** - Operaciones numéricas

## 🔧 Módulos Principales

### IA (Inteligencia Artificial)
```python
from ia.yolo_detector import WasteDetector

detector = WasteDetector()
resultado = detector.detect_and_classify("imagen.jpg")
print(f"Residuo: {resultado['clase']} - Confianza: {resultado['confianza']}")
```

### Hardware (Comunicación Serial)
```python
from hardware.bluetooth import SerialCommunication

comm = SerialCommunication()
comm.connect('COM3')  # o '/dev/ttyUSB0' en Linux
comm.send_move_command('left')
```

### Utils (Funciones Auxiliares)
```python
from utils.helpers import log_message, classify_waste_type

log_message("Iniciando sistema", "INFO")
tipo = classify_waste_type("bottle")  # Retorna: PET
```

## 🎯 Características

- ✅ Detección de residuos en tiempo real con YOLOv8
- ✅ Clasificación automática por tipo de material
- ✅ Interfaz gráfica moderna con Tkinter
- ✅ Comunicación con Arduino vía Bluetooth/Serial
- ✅ Estadísticas en tiempo real
- ✅ Logs y debugging integrado

## 📊 Tipos de Residuos Soportados

| Categoría | Ejemplos |
|-----------|----------|
| PET | Botellas plásticas |
| Aluminio | Latas de bebida |
| Cartón | Cajas, papel |
| Vidrio | Frascos, botellas |
| Orgánico | Restos de comida |
| Plástico | Vasos, cubiertos |
| Electrónico | Dispositivos pequeños |

## 👥 Equipo de Desarrollo

Proyecto desarrollado por 9 estudiantes de la Universidad Santiago de Cali.

## 🎯 ODS 12

Este proyecto contribuye al **Objetivo de Desarrollo Sostenible 12**: Producción y Consumo Responsables, específicamente a la meta 12.5 de reducir la generación de desechos mediante el reciclaje.

## 📝 Licencia

Proyecto educativo - Universidad Santiago de Cali
