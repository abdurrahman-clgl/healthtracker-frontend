<template>
  <div class="container">
    <h2>Herzfrequenzüberwachung</h2>
    <canvas ref="chartCanvas" width="200" height="50"></canvas>

    <!-- Pfeil zur Navigation -->
    <div class="navigation-arrow">
      <router-link to="/sleeppattern" class="arrow-link">→</router-link>
    </div>

    <!-- Eingabeformular für neue Herzfrequenzdaten -->
    <div class="form-container">
      <h2>Neuer Herzfrequenz-Eintrag</h2>
      <form @submit.prevent="submitHeartRate">
        <label>
          Herzfrequenzwert:
          <input v-model="newHeartRate.heartRateValue" type="number" placeholder="Herzfrequenzwert" required>
        </label>
        <button type="submit">Senden</button>
        <p v-if="invalidInput">Bitte geben Sie einen gültigen Herzfrequenzwert ein.</p>
      </form>
    </div>

    <!-- Eingabeformular für das Aktualisieren von Herzfrequenzdaten -->
    <div class="form-container" v-if="editableHeartRate">
      <h2>Herzfrequenzdaten aktualisieren</h2>
      <form @submit.prevent="updateHeartRate">
        <label>
          Neuer Herzfrequenzwert:
          <input v-model="editableHeartRate.heartRateValue" type="number" placeholder="Neuer Herzfrequenzwert" required>
        </label>
        <button type="submit">Aktualisieren</button>
        <button @click="cancelUpdate" type="submit">Abbrechen</button>
      </form>
    </div>

    <!-- Liste der Herzfrequenzdaten -->
    <div class="list-container">
      <h2>Herzfrequenzdaten</h2>
      <p>Anzahl der Herzfrequenzdaten: {{ heartRates.length }}</p>
      <ul>
        <li v-for="(heartRate, index) in heartRates" :key="index">
          Datum: <strong>{{ formatDate(heartRate.dateRecorded) }}</strong>, Herzfrequenz: {{ heartRate.heartRateValue }}
          <button @click="editHeartRate(heartRate)" type="button">Bearbeiten</button>
          <button @click="deleteHeartRate(heartRate.id)" type="reset">Löschen</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Chart from 'chart.js/auto';
import axios from 'axios';
import { HeartRate } from '@/model/heartrate';
import '@/assets/HeartRate.css';

// Referenzen und Zustände
const chartCanvas = ref<HTMLCanvasElement | null>(null);
const heartRates = ref<HeartRate[]>([]);
const newHeartRate = ref<Partial<HeartRate>>({
  heartRateValue: 72
});
const editableHeartRate = ref<Partial<HeartRate> | null>(null);
let chart: Chart | null = null;
const invalidInput = ref(false); // Zustand für ungültige Eingabe

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/HeartRates`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Funktion zum Abrufen der Herzfrequenzdaten
async function fetchHeartRates() {
  try {
    const response = await axios.get(endpoint);
    heartRates.value = response.data.map((entry: any) => new HeartRate(
        entry.id,
        new Date(entry.dateRecorded),
        entry.heartRateValue
    ));
    updateChart(); // Aktualisiere das Diagramm nach dem Abrufen der Daten
  } catch (error) {
    console.error('Fehler beim Abrufen der Herzfrequenzdaten:', error);
  }
}

// Funktion zum Speichern einer neuen Herzfrequenz
async function submitHeartRate() {
  // Validierung: Herzfrequenzwert muss größer als 0 sein
  if (!newHeartRate.value.heartRateValue || newHeartRate.value.heartRateValue <= 0) {
    invalidInput.value = true;
    return;
  }

  const heartRateData = {
    dateRecorded: new Date().toISOString(), // Aktuelles Datum und Uhrzeit im ISO-Format
    heartRateValue: newHeartRate.value.heartRateValue,
  };

  try {
    const response = await axios.post(endpoint, heartRateData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Herzfrequenz gespeichert:', response.data);
    heartRates.value.push(new HeartRate(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.heartRateValue,
    ));
    newHeartRate.value.heartRateValue = 0; // Zurücksetzen des Eingabefelds
    updateChart(); // Aktualisiere das Diagramm nach dem Speichern
    invalidInput.value = false; // Zurücksetzen der ungültigen Eingabe-Meldung
  } catch (error) {
    console.error('Fehler beim Speichern der Herzfrequenz:', error);
  }
}

// Funktion zum Bearbeiten einer Herzfrequenz
function editHeartRate(heartRate: HeartRate) {
  editableHeartRate.value = { ...heartRate };
}

// Funktion zum Aktualisieren einer Herzfrequenz
async function updateHeartRate() {
  if (!editableHeartRate.value?.heartRateValue || editableHeartRate.value.heartRateValue <= 0) {
    invalidInput.value = true;
    return;
  }

  try {
    const response = await axios.put(`${endpoint}/${editableHeartRate.value.id}`, editableHeartRate.value, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const index = heartRates.value.findIndex(hr => hr.id === response.data.id);
    if (index !== -1) {
      heartRates.value[index] = new HeartRate(
          response.data.id,
          new Date(response.data.dateRecorded),
          response.data.heartRateValue
      );
    }
    editableHeartRate.value = null; // Zurücksetzen des Eingabefelds
    updateChart(); // Aktualisiere das Diagramm nach dem Aktualisieren
    invalidInput.value = false; // Zurücksetzen der ungültigen Eingabe-Meldung
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Herzfrequenz:', error);
  }
}

// Funktion zum Abbrechen der Aktualisierung
function cancelUpdate() {
  editableHeartRate.value = null;
}

// Funktion zum Löschen einer Herzfrequenz
async function deleteHeartRate(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    heartRates.value = heartRates.value.filter(hr => hr.id !== id);
    updateChart(); // Aktualisiere das Diagramm nach dem Löschen
  } catch (error) {
    console.error('Fehler beim Löschen der Herzfrequenz:', error);
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
          labels: heartRates.value.map(hr => formatDate(hr.dateRecorded)),
          datasets: [{
            label: 'Herzfrequenz',
            data: heartRates.value.map(hr => hr.heartRateValue),
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

// Initiales Abrufen der Herzfrequenzdaten
onMounted(async () => {
  await fetchHeartRates();
});
</script>

<style scoped>
.container {
  position: relative;
}

.navigation-arrow {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}

.arrow-link {
  font-size: 2rem;
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
