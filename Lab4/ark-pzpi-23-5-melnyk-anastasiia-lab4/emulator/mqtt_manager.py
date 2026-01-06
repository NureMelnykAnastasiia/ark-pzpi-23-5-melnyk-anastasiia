import paho.mqtt.client as mqtt
import json
import time
import logging

class MqttPublisher:
    def __init__(self, broker, port, topic_prefix, device_mac):
        self.client = mqtt.Client()
        self.broker = broker
        self.port = port
        self.topic_prefix = topic_prefix
        self.device_mac = device_mac
        
        self.client.on_connect = self.on_connect

    def on_connect(self, client, userdata, flags, rc):
        if rc == 0:
            logging.info(f"Device Connected to Broker: {self.broker}")
        else:
            logging.error(f"Connection failed: {rc}")

    def connect(self):
        self.client.connect(self.broker, self.port, 60)
        self.client.loop_start()

    def publish_reading(self, reading_type, value):
        topic = f"{self.topic_prefix}/{self.device_mac}/readings"
        
        payload = {
            "macAddress": self.device_mac,
            "type": reading_type,
            "value": value,
            "timestamp": time.time()
        }
        
        self.client.publish(topic, json.dumps(payload))
        logging.info(f"MQTT Sent: {reading_type}={value} -> {topic}")

    def disconnect(self):
        self.client.loop_stop()
        self.client.disconnect()