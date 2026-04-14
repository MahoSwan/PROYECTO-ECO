"""
Bluetooth/Serial - Módulo de comunicación con Arduino vía serial
"""
import serial
import serial.tools.list_ports
from typing import Optional, Callable
import threading
import time


class SerialCommunication:
    """Clase para manejar comunicación serial con Arduino"""
    
    def __init__(self, baud_rate: int = 9600, timeout: float = 1.0):
        """
        Inicializar comunicación serial
        
        Args:
            baud_rate: Velocidad de transmisión (por defecto 9600)
            timeout: Timeout para lecturas en segundos
        """
        self.baud_rate = baud_rate
        self.timeout = timeout
        self.serial_port: Optional[serial.Serial] = None
        self.is_connected = False
        self.read_thread: Optional[threading.Thread] = None
        self.stop_reading = threading.Event()
        self.on_data_received: Optional[Callable[[str], None]] = None
    
    def list_ports(self) -> list:
        """
        Listar puertos seriales disponibles
        
        Returns:
            Lista de diccionarios con información de puertos
        """
        ports = serial.tools.list_ports.comports()
        return [
            {
                'device': port.device,
                'description': port.description,
                'hwid': port.hwid
            }
            for port in ports
        ]
    
    def connect(self, port: str) -> bool:
        """
        Conectar a un puerto serial
        
        Args:
            port: Nombre del puerto (ej: 'COM3' o '/dev/ttyUSB0')
            
        Returns:
            True si la conexión fue exitosa
        """
        try:
            self.serial_port = serial.Serial(
                port=port,
                baudrate=self.baud_rate,
                timeout=self.timeout,
                bytesize=serial.EIGHTBITS,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE
            )
            self.is_connected = True
            print(f"✅ Conectado a {port}")
            return True
        except serial.SerialException as e:
            print(f"❌ Error conectando a {port}: {e}")
            self.is_connected = False
            return False
    
    def disconnect(self):
        """Desconectar del puerto serial"""
        if self.serial_port and self.serial_port.is_open:
            self.stop_reading.set()
            
            if self.read_thread and self.read_thread.is_alive():
                self.read_thread.join(timeout=2.0)
            
            self.serial_port.close()
            self.is_connected = False
            print("🔌 Desconectado")
    
    def send_command(self, command: str) -> bool:
        """
        Enviar comando a Arduino
        
        Args:
            command: Comando a enviar
            
        Returns:
            True si se envió correctamente
        """
        if not self.is_connected or not self.serial_port:
            return False
        
        try:
            self.serial_port.write(f"{command}\n".encode('utf-8'))
            self.serial_port.flush()
            return True
        except serial.SerialException as e:
            print(f"❌ Error enviando comando: {e}")
            return False
    
    def send_move_command(self, direction: str):
        """
        Enviar comando de movimiento
        
        Args:
            direction: Dirección ('left', 'right', 'forward', 'backward', 'stop')
        """
        commands = {
            'left': 'MOVE_LEFT',
            'right': 'MOVE_RIGHT',
            'forward': 'MOVE_FORWARD',
            'backward': 'MOVE_BACKWARD',
            'stop': 'STOP'
        }
        
        cmd = commands.get(direction.lower(), 'STOP')
        self.send_command(cmd)
    
    def start_reading(self, callback: Callable[[str], None]):
        """
        Iniciar hilo de lectura continua
        
        Args:
            callback: Función a llamar cuando se reciban datos
        """
        if not self.is_connected:
            return
        
        self.on_data_received = callback
        self.stop_reading.clear()
        self.read_thread = threading.Thread(target=self._read_loop, daemon=True)
        self.read_thread.start()
    
    def _read_loop(self):
        """Bucle de lectura en segundo plano"""
        while not self.stop_reading.is_set():
            try:
                if self.serial_port and self.serial_port.in_waiting > 0:
                    line = self.serial_port.readline().decode('utf-8').strip()
                    if line and self.on_data_received:
                        self.on_data_received(line)
            except serial.SerialException as e:
                print(f"❌ Error leyendo: {e}")
                break
            except UnicodeDecodeError:
                pass
            
            time.sleep(0.1)
    
    def get_sensor_data(self) -> dict:
        """
        Obtener datos de sensores (formato esperado: JSON o CSV)
        
        Returns:
            Diccionario con datos de sensores
        """
        if not self.is_connected:
            return {}
        
        try:
            self.send_command("GET_SENSORS")
            # Esperar respuesta (implementación básica)
            time.sleep(0.5)
            return {'status': 'command_sent'}
        except Exception as e:
            print(f"❌ Error obteniendo datos: {e}")
            return {'error': str(e)}
