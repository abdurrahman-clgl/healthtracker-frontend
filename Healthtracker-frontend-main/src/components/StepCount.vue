<template>
  <div class="container">
    <h2>Schrittzählerüberwachung</h2>
    <canvas ref="chartCanvas" class="chart" width="200" height="50"></canvas>

    <!-- Pfeile zur Navigation -->
    <div class="navigation-arrows">
      <router-link to="/bloodsugar" class="arrow-link">←</router-link>
      <router-link to="/weight" class="arrow-link">→</router-link>
    </div>

    <!-- Eingabeformular -->
    <div class="form-container">
      <h3>Neuer Schrittzähler-Eintrag</h3>
      <label for="stepCount">Schrittanzahl:</label>
      <input v-model="stepCountInput" id="stepCount" type="number" placeholder="Schrittanzahl">
      <label for="targetStepCount">Tägliches Ziel:</label>
      <input v-model="targetStepCountInput" id="targetStepCount" type="number" placeholder="Tägliches Ziel">
      <button @click="saveStepCount" class="btn-small">Speichern</button>
    </div>

    <!-- Bearbeitungsformular -->
    <div class="form-container" v-if="editableStepCount">
      <h3>Schrittzähler-Eintrag bearbeiten</h3>
      <label for="editStepCount">Schrittanzahl:</label>
      <input v-model="editableStepCount.stepCount" id="editStepCount" type="number" placeholder="Schrittanzahl">
      <label for="editTargetStepCount">Tägliches Ziel:</label>
      <input v-model="editableStepCount.targetStepCount" id="editTargetStepCount" type="number" placeholder="Tägliches Ziel">
      <button @click="updateStepCount" class="btn-small">Aktualisieren</button>
      <button @click="cancelEdit" class="btn-small">Abbrechen</button>
    </div>

    <!-- Liste der Schrittzähler-Einträge -->
    <div class="list-container">
      <table v-if="stepCounts.length > 0">
        <thead>
        <tr>
          <th>Datum</th>
          <th>Schrittanzahl</th>
          <th>Tägliches Ziel</th>
          <th>Differenz</th>
          <th>Aktion</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(entry, index) in stepCounts" :key="index">
          <td>{{ formatDate(entry.dateRecorded) }}</td>
          <td>{{ entry.stepCount }}</td>
          <td>{{ entry.targetStepCount }}</td>
          <td>{{ calculateDifference(entry.stepCount, entry.targetStepCount) }}</td>
          <td>
            <button @click="editStepCount(entry)" class="btn-small">Bearbeiten</button>
            <button @click="deleteStepCount(entry.id)" class="btn-small">Löschen</button>
          </td>
        </tr>
        </tbody>
      </table>
      <p v-else>Noch keine Schrittzähler-Einträge aufgezeichnet.</p>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { StepCount } from '@/model/StepCount';

// Referenzen und Zustände
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const stepCounts = ref<StepCount[]>([]);
const stepCountInput = ref<number>(0);
const targetStepCountInput = ref<number>(10000); // Standardziel: 10000 Schritte
const editableStepCount = ref<StepCount | null>(null); // Zustand für bearbeitbaren Schrittzähler-Eintrag
let chart: Chart | null = null;

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/StepCounts/stepcount`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Funktion zum Berechnen der Differenz zwischen Schrittanzahl und Ziel
function calculateDifference(stepCount: number, targetStepCount: number): number {
  return targetStepCount - stepCount;
}

// Funktion zum Abrufen der Schrittzähler-Einträge
async function fetchStepCounts() {
  try {
    const response = await axios.get(endpoint);
    stepCounts.value = response.data.map((entry: any) => new StepCount(
        entry.id,
        new Date(entry.dateRecorded),
        entry.stepCount,
        entry.targetStepCount
    ));
    updateChart();
  } catch (error) {
    console.error('Fehler beim Abrufen der Schrittzähler-Daten:', error);
  }
}

// Funktion zum Speichern eines neuen Schrittzähler-Eintrags
async function saveStepCount() {
  const stepCountData = {
    dateRecorded: new Date().toISOString(),
    stepCount: stepCountInput.value,
    targetStepCount: targetStepCountInput.value,
  };

  try {
    const response = await axios.post(endpoint, stepCountData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    stepCounts.value.push(new StepCount(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.stepCount,
        response.data.targetStepCount
    ));
    stepCountInput.value = 0;
    targetStepCountInput.value = 10000; // Standardziel zurücksetzen
    updateChart();
  } catch (error) {
    console.error('Fehler beim Speichern des Schrittzählers:', error);
  }
}

// Funktion zum Löschen eines Schrittzähler-Eintrags
async function deleteStepCount(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    stepCounts.value = stepCounts.value.filter(sc => sc.id !== id);
    updateChart();
  } catch (error) {
    console.error('Fehler beim Löschen des Schrittzählers:', error);
  }
}

// Funktion zum Bearbeiten eines Schrittzähler-Eintrags
function editStepCount(stepCount: StepCount) {
  editableStepCount.value = { ...stepCount };
}

// Funktion zum Aktualisieren eines Schrittzähler-Eintrags
async function updateStepCount() {
  if (!editableStepCount.value) return;

  try {
    const response = await axios.put(`${endpoint}/${editableStepCount.value.id}`, editableStepCount.value, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const index = stepCounts.value.findIndex(sc => sc.id === response.data.id);
    if (index !== -1) {
      stepCounts.value[index] = new StepCount(
          response.data.id,
          new Date(response.data.dateRecorded),
          response.data.stepCount,
          response.data.targetStepCount
      );
    }
    editableStepCount.value = null; // Zurücksetzen des Eingabefelds
    updateChart();
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Schrittzählers:', error);
  }
}

// Funktion zum Abbrechen der Bearbeitung
function cancelEdit() {
  editableStepCount.value = null;
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
          labels: stepCounts.value.map(sc => formatDate(sc.dateRecorded)),
          datasets: [{
            label: 'Schrittanzahl',
            data: stepCounts.value.map(sc => sc.stepCount),
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
  await fetchStepCounts();
});
</script>

<style scoped>
/* Ihr bestehender Stylecode */
.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Open Sans', sans-serif;
  color: #333;
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.chart {
  margin-bottom: 20px;
}
.form-container {
  margin-bottom: 20px;
}
input[type="number"] {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 3px 5px;
  background-color: #007BFF;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100px; /* Gleiche Breite für alle Buttons */
}
button.btn-small {
  padding: 5px 10px;
  margin-bottom: 5px; /* Lücke zwischen den Buttons */
}
button:hover {
  background-color: #0056b3;
}
.list-container {
  margin-top: 20px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}
th {
  background-color: #f2f2f2;
}
.navigation-arrows {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.arrow-link {
  text-decoration: none;
  font-size: 24px;
  color: #007BFF;
}
.arrow-link:hover {
  color: #0056b3;
}
</style>
