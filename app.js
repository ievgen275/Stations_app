const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const host = 'localhost';
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Логування запитів
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

let lastTemperatureValue = 36;
let lastDoseRateValue = 5;
let lastHumidityValue = 75;

// Функція для зчитування станцій з файлу
const readStationsFromFile = () => {
    try {
        console.log('Читання файлу stations.json...');
        if (!fs.existsSync('stations.json')) {
            console.log("Файл stations.json не існує, повертаємо порожній масив.");
            return [];
        }
        const data = fs.readFileSync('stations.json');
        console.log('Файл прочитано успішно.');
        return data.length ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Помилка при зчитуванні файлу stations.json:', error);
        return [];
    }
};

// Функція для запису станцій у файл
const writeStationsToFile = (stations) => {
    try {
        console.log('Запис у файл stations.json...');
        fs.writeFileSync('stations.json', JSON.stringify(stations, null, 2));
        console.log('Запис виконано успішно.');
    } catch (error) {
        console.error('Помилка при записі у файл stations.json:', error);
    }
};

// Routes
app.get('/stations', (req, res) => {
    try {
        console.log("Отримання всіх станцій...");
        const stations = readStationsFromFile();
        console.log("Станції успішно отримані:", stations);
        res.send(stations);
    } catch (error) {
        console.error('Внутрішня помилка сервера при отриманні станцій:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

app.get('/stations/:id', (req, res) => {
    try {
        const stations = readStationsFromFile();
        const station = stations.find(st => st.id == req.params.id);
        if (!station) {
            return res.status(404).send('Станція не знайдена');
        }
        res.send(station);
    } catch (error) {
        console.error('Внутрішня помилка сервера при отриманні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

app.post('/stations', (req, res) => {
    try {
        const stations = readStationsFromFile();
        const station = req.body;
        const stationId = stations.length ? stations[stations.length - 1].id + 1 : 1;
        const newStation = { ...station, id: stationId };
        stations.push(newStation);
        writeStationsToFile(stations);
        res.send(newStation);
    } catch (error) {
        console.error('Внутрішня помилка сервера при створенні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

app.delete('/stations/:id', (req, res) => {
    try {
        let stations = readStationsFromFile();
        const stationIndex = stations.findIndex(st => st.id == req.params.id);
        if (stationIndex === -1) {
            return res.status(404).send('Станція не знайдена');
        }
        stations = stations.filter(st => st.id != req.params.id);
        writeStationsToFile(stations);
        res.send(`Станція ${req.params.id} була видалена`);
    } catch (error) {
        console.error('Внутрішня помилка сервера при видаленні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

app.put('/stations/:id', (req, res) => {
    try {
        const stations = readStationsFromFile();
        const index = stations.findIndex(st => st.id == req.params.id);
        if (index === -1) {
            return res.status(404).send('Станція не знайдена');
        }
        stations[index] = {
            ...stations[index],
            ...req.body
        };
        writeStationsToFile(stations);
        res.send(stations[index]);
    } catch (error) {
        console.error('Внутрішня помилка сервера при оновленні станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

app.get('/stations/:id/metrics', (req, res) => {
    try {
        const stations = readStationsFromFile();
        const station = stations.find(st => st.id == req.params.id);
        if (!station) {
            return res.status(404).send('Станція не знайдена');
        }
        if (!station.status) {
            res.send({
                temperature: 0,
                dose_rate: 0,
                humidity: 0
            });
        } else {
            lastTemperatureValue = generateRandomNumbers(10, 60, lastTemperatureValue);
            lastDoseRateValue = generateRandomNumbers(0, 12, lastDoseRateValue);
            lastHumidityValue = generateRandomNumbers(30, 90, lastHumidityValue);

            res.send({
                temperature: lastTemperatureValue,
                dose_rate: lastDoseRateValue,
                humidity: lastHumidityValue
            });
        }
    } catch (error) {
        console.error('Внутрішня помилка сервера при отриманні метрик станції:', error);
        res.status(500).send('Внутрішня помилка сервера');
    }
});

// Запуск сервера
app.listen(port, host, () => {
    console.log(`Сервер працює на http://${host}:${port}`);
});

function generateRandomNumbers(min, max, lastValue) {
    if (lastValue === null) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        const low = Math.max(min, lastValue - 1);
        const high = Math.min(max, lastValue + 1);
        return Math.floor(Math.random() * (high - low + 1)) + low;
    }
}