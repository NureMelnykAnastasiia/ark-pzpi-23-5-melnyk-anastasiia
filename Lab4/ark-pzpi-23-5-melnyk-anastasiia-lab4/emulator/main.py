import time
import logging
import sys
from getmac import get_mac_address
from config import MQTT_BROKER, MQTT_PORT, TOPIC_PREFIX, SEND_INTERVAL
from sensors import VirtualPlantSensor
from mqtt_manager import MqttPublisher

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [DEVICE] %(message)s',
    datefmt='%H:%M:%S',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def get_device_mac():
    try:
        mac = get_mac_address()
        return mac.upper() if mac else "AA:BB:CC:DD:EE:FF"
    except:
        return "AA:BB:CC:DD:EE:FF"

def main():
    logging.info("EcoOffice Device Simulator")
    
    device_mac = get_device_mac()
    logging.info(f"Device MAC: {device_mac}")
    publisher = MqttPublisher(MQTT_BROKER, MQTT_PORT, TOPIC_PREFIX, device_mac)
    publisher.connect()

    sensors = VirtualPlantSensor()

    try:
        while True:
            readings = sensors.get_readings()

            for reading in readings:
                publisher.publish_reading(reading['type'], reading['value'])
                time.sleep(0.1)

            time.sleep(SEND_INTERVAL)

    except KeyboardInterrupt:
        logging.info("\nDevice stopped.")
    finally:
        publisher.disconnect()

if __name__ == "__main__":
    main()