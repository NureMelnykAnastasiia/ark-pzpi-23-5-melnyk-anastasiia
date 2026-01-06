# Використовуємо легкий образ Python
FROM python:3.10-slim

# Налаштування для коректного виводу логів в консоль Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Спочатку копіюємо requirements для кешування шарів
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копіюємо весь код програми
COPY . .

# Створюємо папку для логів Mosquitto (якщо вона потрібна локально) або інших даних
RUN mkdir -p logs

# Оголошуємо volume для збереження історії аномалій (щоб не втрачати навчання)
VOLUME ["/app/sensor_history.json"]

# Запускаємо лаунчер, який керує процесами bridge.py та main.py
CMD ["python", "launcher.py"]