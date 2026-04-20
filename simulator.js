// simulator.js — do not modify
const INGEST_URL = process.env.INGEST_URL || 'http://localhost:3000/api/ingest';
 
const devices = [
  { id: 'sensor-01', location: 'north-wing',  temp: 22, humidity: 55 },
  { id: 'sensor-02', location: 'south-wing',  temp: 24, humidity: 60 },
  { id: 'sensor-03', location: 'storage-bay', temp: 18, humidity: 45 },
];
 
function drift(value, step, min, max) {
  const next = value + (Math.random() - 0.5) * step;
  return Math.max(min, Math.min(max, next));
}
 
async function tick() {
  for (const d of devices) {
    const anomaly = Math.random() < 0.05; // occasional out-of-range spike
    d.temp = anomaly
      ? d.temp + (Math.random() * 10 - 5)
      : drift(d.temp, 0.4, 10, 40);
    d.humidity = drift(d.humidity, 1.5, 20, 95);
 
    const payload = {
      deviceId: d.id,
      location: d.location,
      temperature: Number(d.temp.toFixed(2)),
      humidity: Number(d.humidity.toFixed(2)),
      timestamp: new Date().toISOString(),
    };
 
    try {
      const res = await fetch(INGEST_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(`${d.id} → ${res.status}`);
    } catch (err) {
      console.error(`${d.id} → ${err.message}`);
    }
  }
}
 
setInterval(tick, 2000);
tick();
