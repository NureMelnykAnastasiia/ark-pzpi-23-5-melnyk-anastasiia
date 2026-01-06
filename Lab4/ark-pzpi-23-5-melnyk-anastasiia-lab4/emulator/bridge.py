import paho.mqtt.client as mqtt
import requests
import json
import logging
import sys
import time
from config import (
    MQTT_BROKER, MQTT_PORT, TOPIC_PREFIX, API_ENDPOINT, MQTT_USERNAME, MQTT_PASSWORD,
    API_LOGIN_ENDPOINT, API_LOGIN_PASS, API_LOGIN_USER
)
from anomaly_detector import AnomalyDetector

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [BRIDGE] %(message)s',
    datefmt='%H:%M:%S',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def get_api_token():
    try:
        response = requests.post(
            API_LOGIN_ENDPOINT,
            json={"email": API_LOGIN_USER, "password": API_LOGIN_PASS},
            timeout=5
        )
        if response.status_code == 200:
            token = response.json().get("token")
            if token:
                logging.info("API token received")
                return token
            else:
                logging.error("Token not found in response")
        else:
            logging.error(f"Login failed: {response.status_code} {response.text}")
    except Exception as e:
        logging.error(f"Login request error: {e}")
    return None

API_TOKEN = get_api_token()
if not API_TOKEN:
    logging.error("Bridge stopped due to missing API token")
    sys.exit(1)

detector = AnomalyDetector(history_file='sensor_history.json', history_size=20, multiplier=3)

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logging.info(f"Bridge Connected to Broker ({MQTT_BROKER})")
        topic = f"{TOPIC_PREFIX}/+/readings"
        client.subscribe(topic)
        logging.info(f"Listening to topic: {topic}")
    else:
        logging.error(f"Connection failed: code {rc}")

def on_message(client, userdata, msg):
    try:
        payload_str = msg.payload.decode()
        mqtt_payload = json.loads(payload_str)
        
        mac = mqtt_payload.get('macAddress', 'UNKNOWN')
        r_type = mqtt_payload.get('type', 'UNKNOWN')
        val = mqtt_payload.get('value', 0)

        is_anomaly, anomaly_msg, mean_val = detector.check_and_update(mac, r_type, val)

        if is_anomaly:
            logging.warning(f"ANOMALY DETECTED [{mac}] {r_type}: {val} | Mean: {mean_val:.2f} | {anomaly_msg}")
        else:
            status_note = "(Calibrating)" if "Calibrating" in anomaly_msg else "(OK)"
            logging.info(f"MQTT Recv [{mac}]: {r_type} = {val} {status_note}")

        api_payload = {
            "macAddress": mac,
            "type": r_type,
            "value": val,
        }

        headers = {
            "Authorization": f"Bearer {API_TOKEN}",
            "Content-Type": "application/json"
        }
        response = requests.post(API_ENDPOINT, headers=headers, json=api_payload, timeout=2)

        if response.status_code in [200, 201]:
            if is_anomaly:
                logging.info("Forwarded to API (Logged as Anomaly)")
        elif response.status_code == 404:
            logging.warning("Server Warning: Device not registered")
        else:
            logging.error(f"Server Error {response.status_code}: {response.text}")

    except requests.exceptions.ConnectionError:
        logging.error(f"API Connection Failed! Is server running at {API_ENDPOINT}?")
    except Exception as e:
        logging.error(f"Processing Error: {e}")

def main():
    logging.info("Starting Smart Bridge")
    logging.info(f"Target API: {API_ENDPOINT}")

    client = mqtt.Client()
    
    if MQTT_USERNAME and MQTT_PASSWORD:
        client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

    client.on_connect = on_connect
    client.on_message = on_message

    try:
        logging.info("Connecting to broker")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        logging.info("Bridge stopped by user")
    except Exception as e:
        logging.error(f"Critical Error: {e}")

if __name__ == "__main__":
    main()
