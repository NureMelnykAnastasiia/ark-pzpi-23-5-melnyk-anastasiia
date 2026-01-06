import os
from dotenv import load_dotenv

load_dotenv()

MQTT_BROKER = os.getenv('MQTT_BROKER', 'localhost') 
MQTT_PORT = int(os.getenv('MQTT_PORT', 1883))
MQTT_USERNAME = os.getenv('MQTT_USERNAME', '') 
MQTT_PASSWORD = os.getenv('MQTT_PASSWORD', '')
TOPIC_PREFIX = os.getenv('TOPIC_PREFIX', 'eco-office/devices')

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:3000')
API_ENDPOINT = f"{API_BASE_URL}/api/readings/iot" 
API_LOGIN_ENDPOINT = f"{API_BASE_URL}/api/auth/login"
API_LOGIN_USER = f"admin@eco.com"
API_LOGIN_PASS = f"password123"
SEND_INTERVAL = int(os.getenv('SEND_INTERVAL', 5))