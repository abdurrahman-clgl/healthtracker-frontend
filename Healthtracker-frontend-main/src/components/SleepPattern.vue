<template>
  <div class="container">
    <h2>Schlafmusterüberwachung</h2>
    <canvas ref="chartCanvas" width="200" height="50"></canvas>

    <!-- Pfeile zur Navigation -->
    <div class="navigation-arrows">
      <!-- Pfeil zur Seite /heartrate -->
      <router-link to="/heartrate" class="arrow-link">
        ←
      </router-link>

      <!-- Pfeil zur Seite /bloodpressure -->
      <router-link to="/bloodpressure" class="arrow-link">
         →
      </router-link>
    </div>

    <!-- Eingabeformular -->
    <div class="form-container">
      <h3>Neuer SchlafmusterEintrag</h3>
      <label for="sleepDuration">Schlafdauer (Stunden):</label>
      <input v-model="sleepDurationInput" id="sleepDuration" type="number" placeholder="Schlafdauer">

      <label for="lightSleepDuration">Leichtschlafdauer (Stunden):</label>
      <input v-model="lightSleepDurationInput" id="lightSleepDuration" type="number" placeholder="Leichtschlafdauer">

      <label for="deepSleepDuration">Tiefschlafdauer (Stunden):</label>
      <input v-model="deepSleepDurationInput" id="deepSleepDuration" type="number" placeholder="Tiefschlafdauer">

      <label for="interruptions">Unterbrechungen:</label>
      <input v-model="interruptionsInput" id="interruptions" type="number" placeholder="Unterbrechungen">

      <button @click="saveSleepPattern">Speichern</button>
    </div>

    <!-- Liste der Schlafmuster -->
    <div class="list-container">
      <table v-if="sleepPatterns.length > 0">
        <thead>
        <tr>
          <th>Datum</th>
          <th>Schlafdauer (Stunden)</th>
          <th>Leichtschlafdauer (Stunden)</th>
          <th>Tiefschlafdauer (Stunden)</th>
          <th>Unterbrechungen</th>
          <th>Schlafqualität (%)</th>
          <th>Aktion</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(pattern, index) in sleepPatterns" :key="index">
          <td>{{ formatDate(pattern.dateRecorded) }}</td>
          <td>{{ pattern.sleepDuration }}</td>
          <td>{{ pattern.lightSleepDuration }}</td>
          <td>{{ pattern.deepSleepDuration }}</td>
          <td>{{ pattern.interruptions }}</td>
          <td>{{ pattern.sleepQuality.toFixed(2) }}</td>
          <td><button @click="deleteSleepPattern(pattern.id)">Löschen</button></td>
        </tr>
        </tbody>
      </table>
      <p v-else>Noch keine Schlafmuster aufgezeichnet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { SleepPattern } from '@/model/SleepPattern';

// Referenzen und Zustände
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const sleepPatterns = ref<SleepPattern[]>([]);
const sleepDurationInput = ref<number>(0);
const lightSleepDurationInput = ref<number>(0);
const deepSleepDurationInput = ref<number>(0);
const interruptionsInput = ref<number>(0);
let chart: Chart | null = null;

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/SleepPattern/sleeppattern`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Funktion zur Berechnung der Schlafqualität
function calculateSleepQuality(sleepDuration: number, lightSleepDuration: number, deepSleepDuration: number, interruptions: number): number {
  const totalSleep = lightSleepDuration + deepSleepDuration;
  let quality = (deepSleepDuration / totalSleep) * 100 - (interruptions * 5);
  quality = quality < 0 ? 0 : quality; // Schlafqualität darf nicht negativ sein
  quality = quality > 100 ? 100 : quality; // Schlafqualität darf nicht mehr als 100 sein
  return quality;
}

// Funktion zum Abrufen der Schlafmuster
async function fetchSleepPatterns() {
  try {
    const response = await axios.get(endpoint);
    sleepPatterns.value = response.data.map((entry: any) => new SleepPattern(
        entry.id,
        new Date(entry.dateRecorded),
        entry.sleepDuration,
        entry.lightSleepDuration,
        entry.deepSleepDuration,
        entry.interruptions,
        calculateSleepQuality(entry.sleepDuration, entry.lightSleepDuration, entry.deepSleepDuration, entry.interruptions)
    ));
    updateChart(); // Aktualisiere das Diagramm nach dem Abrufen der Daten
  } catch (error) {
    console.error('Fehler beim Abrufen der Schlafmuster:', error);
  }
}

// Funktion zum Speichern der Schlafmuster
async function saveSleepPattern() {
  const sleepQuality = calculateSleepQuality(sleepDurationInput.value, lightSleepDurationInput.value, deepSleepDurationInput.value, interruptionsInput.value);

  const sleepPatternData = {
    dateRecorded: new Date().toISOString(), // Setze das aktuelle Datum und die aktuelle Uhrzeit im ISO-Format
    sleepDuration: sleepDurationInput.value,
    lightSleepDuration: lightSleepDurationInput.value,
    deepSleepDuration: deepSleepDurationInput.value,
    interruptions: interruptionsInput.value,
    sleepQuality: sleepQuality
  };

  if (sleepDurationInput.value < lightSleepDurationInput.value + deepSleepDurationInput.value) {
    console.error('Die Summe der Leicht- und Tiefschlafdauer darf nicht größer als die Gesamtschlafdauer sein.');
    return;
  }

  try {
    const response = await axios.post(endpoint, sleepPatternData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Schlafmuster gespeichert:', response.data);
    sleepPatterns.value.push(new SleepPattern(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.sleepDuration,
        response.data.lightSleepDuration,
        response.data.deepSleepDuration,
        response.data.interruptions,
        response.data.sleepQuality
    ));
    sleepDurationInput.value = 0;
    lightSleepDurationInput.value = 0;
    deepSleepDurationInput.value = 0;
    interruptionsInput.value = 0;
    updateChart(); // Aktualisiere das Diagramm nach dem Speichern
  } catch (error) {
    console.error('Fehler beim Speichern des Schlafmusters:', error);
  }
}

// Funktion zum Löschen eines Schlafmusters
async function deleteSleepPattern(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    sleepPatterns.value = sleepPatterns.value.filter(sp => sp.id !== id);
    updateChart(); // Diagramm aktualisieren
  } catch (error) {
    console.error('Fehler beim Löschen des Schlafmusters:', error);
  }
}

// Funktion zum Aktualisieren des Diagramms
function updateChart() {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    if (ctx) {
      if (chart) {
        chart.destroy(); // Zerstöre das alte Diagramm, wenn es existiert
      }
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sleepPatterns.value.map(sp => formatDate(sp.dateRecorded)),
          datasets: [{
            label: 'Schlafqualität (%)',
            data: sleepPatterns.value.map(sp => sp.sleepQuality),
            borderColor: '#007BFF',
            borderWidth: 2,
            pointBackgroundColor: '#007BFF',
            pointBorderColor: '#FFF',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0.4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100 // Setze das Maximum auf 100, da die Schlafqualität in Prozent gemessen wird
            }
          },
          elements: {
            line: {
              tension: 0.4
            },
            point: {
              radius: 5
            }
          }
        }
      });
    }
  }
}

// Initiales Abrufen der Daten
onMounted(async () => {
  await fetchSleepPatterns();
});
</script>

<style scoped>
.container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.form-container {
  margin-bottom: 20px;
}

.list-container {
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  border: 1px solid #ddd;
  padding: 4px;
}

table th {
  background-color: #f2f2f2;
  text-align: left;
}

.container {
  position: relative;
}

.navigation-arrows {
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
  width: 100%;
}

.arrow-link {
  font-size: 1.5rem;
  color: #007BFF;
  text-decoration: none;
  cursor: pointer;
}

.arrow-link:hover {
  color: #0056b3;
}

.form-container {
  margin-top: 20px;
}

.list-container {
  margin-top: 20px;
}
</style>
