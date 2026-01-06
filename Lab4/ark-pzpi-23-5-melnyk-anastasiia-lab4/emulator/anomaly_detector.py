import json
import os
import statistics

class AnomalyDetector:
    def __init__(self, history_file='sensor_history.json', history_size=20, multiplier=2):
        self.history_file = history_file
        self.history_size = history_size
        self.base_multiplier = multiplier 
        self.data = self._load_data()


        self.SENSOR_CONFIG = {
          
            'LIGHT_INTENSITY': {'min_iqr': 300, 'multiplier': 4.0}, 
           
            'SOIL_MOISTURE':   {'min_iqr': 15,   'multiplier': 3.0}, 
           
            'AIR_TEMPERATURE': {'min_iqr': 2,    'multiplier': 3.0},
          
            'AIR_HUMIDITY':    {'min_iqr': 5,    'multiplier': 3.0},
       
            'BATTERY_LEVEL':   {'min_iqr': 1,    'multiplier': 5.0}
        }

    def _load_data(self):
        if os.path.exists(self.history_file):
            try:
                with open(self.history_file, 'r') as f:
                    return json.load(f)
            except (json.JSONDecodeError, ValueError):
                return {}
        return {}

    def _save_data(self):
        with open(self.history_file, 'w') as f:
            json.dump(self.data, f, indent=2)

    def _get_params(self, sensor_type):
        cfg = self.SENSOR_CONFIG.get(sensor_type, {'min_iqr': 10, 'multiplier': self.base_multiplier})
        return cfg['min_iqr'], cfg['multiplier']

    def check_and_update(self, mac, sensor_type, value):
        if mac not in self.data:
            self.data[mac] = {}
        if sensor_type not in self.data[mac]:
            self.data[mac][sensor_type] = []

        history = self.data[mac][sensor_type]
        is_anomaly = False
        message = "Normal"
        median_val = value

        min_iqr, current_multiplier = self._get_params(sensor_type)
        if len(history) < 5:
            self._update_history(mac, sensor_type, value)
            return False, "Calibrating (gathering history...)", value

        try:
            quartiles = statistics.quantiles(history, n=4)
            q1 = quartiles[0] 
            q3 = quartiles[2] 
            
            iqr = q3 - q1
            median_val = quartiles[1] 

            effective_iqr = max(iqr, min_iqr)
            margin = current_multiplier * effective_iqr
            lower_bound = q1 - margin
            upper_bound = q3 + margin

            if value < lower_bound or value > upper_bound:
                is_anomaly = True
                message = (
                    f"IQR Anomaly! Value {value} outside "
                    f"[{lower_bound:.2f} ... {upper_bound:.2f}]. "
                    f"Median: {median_val:.2f}, Used IQR: {effective_iqr}"
                )

        except Exception as e:
            message = f"Calculation error: {e}"

        self._update_history(mac, sensor_type, value)
        
        return is_anomaly, message, median_val

    def _update_history(self, mac, sensor_type, value):
        history = self.data[mac][sensor_type]
        history.append(value)
        if len(history) > self.history_size:
            history.pop(0)
        self.data[mac][sensor_type] = history
        self._save_data()