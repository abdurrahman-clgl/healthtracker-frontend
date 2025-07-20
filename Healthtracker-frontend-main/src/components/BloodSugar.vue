<template>
  <div class="container">
    <div class="header">
      <h2>Blutzuckerüberwachung</h2>
    </div>
    <canvas ref="chartCanvas" class="chart" width="200" height="50"></canvas>

    <!-- Pfeile zur Navigation -->
    <div class="navigation-arrows">
      <!-- Pfeil zur Seite /heartrate -->
      <router-link to="/bloodpressure" class="arrow-link">
        ←
      </router-link>

      <!-- Pfeil zur Seite /bloodpressure -->
      <router-link to="/stepcount" class="arrow-link">
        →
      </router-link>
    </div>

    <!-- Eingabeformular -->
    <div class="form-container">
      <h3>Neuer Blutzuckereintrag</h3>
      <form @submit.prevent="saveBloodSugar">
        <label for="bloodSugarLevel">Blutzuckerwert (mg/dL):</label>
        <input v-model="bloodSugarLevelInput" id="bloodSugarLevel" type="number" placeholder="Blutzuckerwert" required>
        <button type="submit" class="btn-save">Speichern</button>
        <p v-if="invalidInput">Bitte geben Sie einen gültigen Blutzuckerwert ein.</p>
      </form>
    </div>

    <!-- Liste der Blutzuckereinträge -->
    <div class="list-container">
      <h2>Blutzuckereinträge</h2>
      <p>Anzahl der Blutzuckereinträge: {{ bloodSugars.length }}</p>
      <table v-if="bloodSugars.length > 0">
        <thead>
        <tr>
          <th>Datum</th>
          <th>Blutzuckerwert (mg/dL)</th>
          <th>Aktion</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(entry, index) in bloodSugars" :key="index">
          <td>{{ formatDate(entry.dateRecorded) }}</td>
          <td>{{ entry.bloodSugarLevel }}</td>
          <td><button @click="deleteBloodSugar(entry.id)" class="btn-delete">Löschen</button></td>
        </tr>
        </tbody>
      </table>
      <p v-else>Noch keine Blutzuckereinträge aufgezeichnet.</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { BloodSugar } from '@/model/BloodSugar';

// Referenzen und Zustände
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const bloodSugars = ref<BloodSugar[]>([]);
const bloodSugarLevelInput = ref<number>(0);
const invalidInput = ref(false);
let chart: Chart | null = null;

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/BloodSugar/bloodsugar`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Funktion zum Abrufen der Blutzuckereinträge
async function fetchBloodSugars() {
  try {
    const response = await axios.get(endpoint);
    bloodSugars.value = response.data.map((entry: any) => new BloodSugar(
        entry.id,
        new Date(entry.dateRecorded),
        entry.bloodSugarLevel
    ));
    updateChart();
  } catch (error) {
    console.error('Fehler beim Abrufen der Blutzuckerdaten:', error);
  }
}

// Funktion zum Speichern eines neuen Blutzuckereintrags
async function saveBloodSugar() {
  if (!bloodSugarLevelInput.value || bloodSugarLevelInput.value <= 0) {
    invalidInput.value = true;
    return;
  }

  const bloodSugarData = {
    dateRecorded: new Date().toISOString(),
    bloodSugarLevel: bloodSugarLevelInput.value,
  };

  try {
    const response = await axios.post(endpoint, bloodSugarData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    bloodSugars.value.push(new BloodSugar(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.bloodSugarLevel
    ));
    bloodSugarLevelInput.value = 0;
    invalidInput.value = false;
    updateChart();
  } catch (error) {
    console.error('Fehler beim Speichern des Blutzuckers:', error);
  }
}

// Funktion zum Löschen eines Blutzuckereintrags
async function deleteBloodSugar(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    bloodSugars.value = bloodSugars.value.filter(bs => bs.id !== id);
    updateChart();
  } catch (error) {
    console.error('Fehler beim Löschen des Blutzuckers:', error);
  }
}

// Funktion zum Aktualisieren des Diagramms
function updateChart() {
  if (chartCanvas.value) {
    const ctx = chartCanvas.value.getContext('2d');
    if (ctx) {
      if (chart) {
        chart.destroy();
      }
      chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: bloodSugars.value.map(bs => formatDate(bs.dateRecorded)),
          datasets: [{
            label: 'Blutzuckerwert (mg/dL)',
            data: bloodSugars.value.map(bs => bs.bloodSugarLevel),
            borderColor: '#FF6347',
            borderWidth: 2,
            pointBackgroundColor: '#FF6347',
            pointBorderColor: '#FFF',
            pointBorderWidth: 2,
            pointRadius: 5,
            tension: 0.4
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
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

onMounted(async () => {
  await fetchBloodSugars();
});
</script>


<style scoped>
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Open Sans', sans-serif;
  color: #333;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.form-container {
  margin-top: 20px;
  width: 100%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.form-container label {
  margin-top: 10px;
  display: block;
  color: #FF6347;
}

.form-container input {
  margin-bottom: 5px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #FF6347;
  border-radius: 4px;
}

.btn-save {
  background-color: #FF6347;
  color: #fff;
  border: none;
  padding: 3px 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  width: 17%;
}

.btn-save:hover {
  background-color: #e5533d;
}

.btn-delete {
  background-color: #FF6347;
  color: #fff;
  border: none;
  padding: 3px 5px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background-color: #800000;
}

.list-container {
  margin-top: 20px;
  width: 100%;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th, table td {
  border: 1px solid #ddd;
  padding: 8px;
}

table th {
  background-color: #ffe6e6;
  text-align: left;
  color: #FF6347;
}

button {
  cursor: pointer;
}

.chart {
  margin-top: 20px;
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

