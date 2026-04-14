"""
YOLO Detector - Módulo de detección de residuos usando YOLOv8
"""
from ultralytics import YOLO
import cv2
import numpy as np
from typing import Dict, List, Optional


class WasteDetector:
    """Clase para detectar y clasificar residuos usando YOLO"""
    
    def __init__(self, model_path: str = "yolov8n.pt"):
        """
        Inicializar el detector YOLO
        
        Args:
            model_path: Ruta al modelo YOLO pre-entrenado o custom
        """
        try:
            self.model = YOLO(model_path)
            self.is_loaded = True
        except Exception as e:
            print(f"❌ Error cargando modelo YOLO: {e}")
            self.model = None
            self.is_loaded = False
    
    def detect(self, image_path: str = None, image_array: np.ndarray = None, 
               confidence: float = 0.5) -> List[Dict]:
        """
        Detectar residuos en una imagen
        
        Args:
            image_path: Ruta a la imagen (opcional si se usa image_array)
            image_array: Array numpy de la imagen (opcional si se usa image_path)
            confidence: Umbral de confianza mínima
            
        Returns:
            Lista de diccionarios con las detecciones
        """
        if not self.is_loaded:
            return []
        
        if image_path is None and image_array is None:
            raise ValueError("Debe proporcionar image_path o image_array")
        
        try:
            # Realizar detección
            if image_path:
                results = self.model(image_path, conf=confidence)
            else:
                results = self.model(image_array, conf=confidence)
            
            detections = []
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for i in range(len(boxes)):
                        detection = {
                            'class_id': int(boxes.cls[i]),
                            'class_name': result.names[int(boxes.cls[i])],
                            'confidence': float(boxes.conf[i]),
                            'bbox': boxes.xyxy[i].cpu().numpy().tolist()
                        }
                        detections.append(detection)
            
            return detections
            
        except Exception as e:
            print(f"❌ Error en detección: {e}")
            return []
    
    def detect_and_classify(self, image_source) -> Dict:
        """
        Detectar y clasificar un residuo, retornando el resultado principal
        
        Args:
            image_source: Ruta o array de imagen
            
        Returns:
            Diccionario con la clasificación principal
        """
        detections = self.detect(image_path=image_source if isinstance(image_source, str) else None,
                                image_array=image_source if not isinstance(image_source, str) else None)
        
        if not detections:
            return {
                'clase': 'No detectado',
                'confianza': 0.0,
                'tipo': 'desconocido'
            }
        
        # Obtener la detección con mayor confianza
        best_detection = max(detections, key=lambda x: x['confidence'])
        
        # Mapear clase YOLO a categoría de residuo
        waste_category = self._map_to_waste_category(best_detection['class_name'])
        
        return {
            'clase': waste_category,
            'confianza': best_detection['confidence'],
            'tipo': best_detection['class_name']
        }
    
    def _map_to_waste_category(self, class_name: str) -> str:
        """
        Mapear nombre de clase YOLO a categoría de residuo
        
        Args:
            class_name: Nombre de la clase detectada por YOLO
            
        Returns:
            Categoría de residuo correspondiente
        """
        # Mapeo básico - se puede expandir según el dataset
        waste_mapping = {
            'bottle': 'PET',
            'cup': 'Plástico',
            'fork': 'Plástico',
            'knife': 'Plástico',
            'spoon': 'Plástico',
            'bowl': 'Plástico',
            'banana': 'Orgánico',
            'apple': 'Orgánico',
            'orange': 'Orgánico',
            'carrot': 'Orgánico',
            'pizza': 'Orgánico',
            'cake': 'Orgánico',
            'donut': 'Orgánico',
            'sandwich': 'Orgánico',
            'hot dog': 'Orgánico',
            'can': 'Aluminio',
            'cardboard': 'Cartón',
            'paper': 'Cartón',
            'book': 'Cartón',
            'cell phone': 'Electrónico',
            'laptop': 'Electrónico',
            'keyboard': 'Electrónico',
            'mouse': 'Electrónico',
            'tv': 'Electrónico',
            'microwave': 'Electrónico',
            'refrigerator': 'Electrónico',
            'oven': 'Electrónico',
            'toaster': 'Electrónico',
            'sink': 'Electrónico',
            'toilet': 'Electrónico',
            'vase': 'Vidrio',
            'wine glass': 'Vidrio',
            'cup': 'Vidrio',
            'bottle': 'Vidrio',
        }
        
        class_lower = class_name.lower()
        
        for key, value in waste_mapping.items():
            if key in class_lower:
                return value
        
        return 'No clasificable'
    
    def process_webcam_frame(self, frame: np.ndarray) -> tuple:
        """
        Procesar un frame de webcam para detección en tiempo real
        
        Args:
            frame: Frame de la cámara
            
        Returns:
            Tuple con (frame procesado, detecciones)
        """
        detections = self.detect(image_array=frame)
        
        # Dibujar bounding boxes en el frame
        processed_frame = frame.copy()
        
        for detection in detections:
            bbox = detection['bbox']
            x1, y1, x2, y2 = map(int, bbox)
            
            # Dibujar rectángulo
            color = (59, 130, 246)  # Azul
            cv2.rectangle(processed_frame, (x1, y1), (x2, y2), color, 2)
            
            # Dibujar etiqueta
            label = f"{detection['class_name']}: {detection['confidence']:.2f}"
            cv2.putText(processed_frame, label, (x1, y1 - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        return processed_frame, detections
