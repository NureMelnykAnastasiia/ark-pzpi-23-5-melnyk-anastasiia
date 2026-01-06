import random
import time
import math

class PlantEnvironment:
    def __init__(self):
        self.soil_moisture = 60.0
        self.battery_level = 100.0
        self.temperature = 22.0
        self.humidity = 60.0
        self.light_level = 0.0
        self.start_time = time.time()
        
    def update(self):
        elapsed_real_seconds = time.time() - self.start_time
        sim_minutes_passed = elapsed_real_seconds * 10 
        cycle_position = (sim_minutes_passed % 1440) / 60.0 
    
        if 6 <= cycle_position <= 20:
            day_progress = (cycle_position - 6) / 14 * math.pi
            base_light = math.sin(day_progress) * 1000
        else:
            base_light = 0
            
        cloud_cover = random.uniform(0.8, 1.2)
        self.light_level = max(0, base_light * cloud_cover)

        temp_cycle = math.sin((cycle_position - 9) / 24 * 2 * math.pi)
        target_temp = 22 + (temp_cycle * 5)
        self.temperature += (target_temp - self.temperature) * 0.05
        self.temperature += random.uniform(-0.05, 0.05)

        target_humidity = 80 - (self.temperature - 15) * 2.5
        self.humidity += (target_humidity - self.humidity) * 0.1
        self.humidity = max(30, min(100, self.humidity + random.uniform(-1, 1)))

        evaporation_rate = 0.001 + (self.temperature / 1000) + (self.light_level / 20000)
        self.soil_moisture -= evaporation_rate
    
        if self.soil_moisture < 25 and random.random() < 0.1:
            self.soil_moisture += random.uniform(30, 50)

        self.soil_moisture = max(0, min(100, self.soil_moisture))

        self.battery_level = max(0, self.battery_level - 0.002)




class Sensor:
    def __init__(self, environment: PlantEnvironment):
        self.env = environment

    def read(self) -> dict:
        raise NotImplementedError("Method 'read' must be implemented")

class MoistureSensor(Sensor):
    def read(self):
        return {"type": "SOIL_MOISTURE", "value": round(self.env.soil_moisture, 2)}

class TemperatureSensor(Sensor):
    def read(self):
        return {"type": "AIR_TEMPERATURE", "value": round(self.env.temperature, 2)}

class HumiditySensor(Sensor):
    def read(self):
        return {"type": "AIR_HUMIDITY", "value": round(self.env.humidity, 2)}

class LightSensor(Sensor):
    def read(self):
        return {"type": "LIGHT_INTENSITY", "value": round(self.env.light_level, 2)}

class BatterySensor(Sensor):
    def read(self):
        return {"type": "BATTERY_LEVEL", "value": round(self.env.battery_level, 2)}


class VirtualPlantSensor:
    def __init__(self):
        self.environment = PlantEnvironment()
   
        self.sensors = [
            MoistureSensor(self.environment),
            TemperatureSensor(self.environment),
            HumiditySensor(self.environment),
            LightSensor(self.environment),
            BatterySensor(self.environment)
        ]

    def get_readings(self):
        self.environment.update()
        readings = []
        for sensor in self.sensors:
            readings.append(sensor.read())
            
        return readings