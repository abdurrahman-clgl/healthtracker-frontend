<template>
  <div class="container">
    <h2>Gewichtsüberwachung</h2>

    <!-- Eingabeformular -->
    <div class="form-container">
      <h3>Neuer Gewichtseintrag</h3>
      <label for="weight">Gewicht (kg):</label>
      <input v-model="weightInput" id="weight" type="number" placeholder="Gewicht">

      <label for="height">Größe (cm):</label>
      <input v-model="heightInput" id="height" type="number" placeholder="Größe">

      <label for="weightGoal">Gewichtsziel (kg):</label>
      <input v-model="weightGoalInput" id="weightGoal" type="number" placeholder="Gewichtsziel">

      <label for="weeklyGoal">Wöchentliches Ziel (kg):</label>
      <input v-model="weeklyGoalInput" id="weeklyGoal" type="number" placeholder="Wöchentliches Ziel">

      <button @click="saveWeight" class="btn-save">Speichern</button>
    </div>

    <!-- Zeitspanne bis zum Erreichen des Ziels -->
    <div v-if="timeToReachGoal !== null" class="goal-container">
      <p>Du wirst dein Ziel in etwa {{ timeToReachGoal }} Monaten erreichen.</p>
    </div>

    <!-- Liste der Gewichtseinträge -->
    <div class="list-container">
      <table v-if="weights.length > 0">
        <thead>
        <tr>
          <th>Datum</th>
          <th>Gewicht (kg)</th>
          <th>Größe (cm)</th>
          <th>Gewichtsziel (kg)</th>
          <th>Wöchentliches Ziel (kg)</th>
          <th>Aktion</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(entry, index) in weights" :key="index">
          <td>{{ formatDate(entry.dateRecorded) }}</td>
          <td>{{ entry.weight }}</td>
          <td>{{ entry.height }}</td>
          <td>{{ entry.weightGoal }}</td>
          <td>{{ entry.weeklyGoal }}</td>
          <td><button @click="deleteWeight(entry.id)" class="btn-delete">Löschen</button></td>
        </tr>
        </tbody>
      </table>
      <p v-else>Noch keine Gewichtseinträge aufgezeichnet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// Definiere die Weight-Klasse
class Weight {
  id: number;
  dateRecorded: Date;
  weight: number;
  height: number;
  weightGoal: number;
  weeklyGoal: number;

  constructor(id?: number, dateRecorded?: Date, weight?: number, height?: number, weightGoal?: number, weeklyGoal?: number) {
    this.id = id ?? 0;
    this.dateRecorded = dateRecorded ?? new Date();
    this.weight = weight ?? 0;
    this.height = height ?? 0;
    this.weightGoal = weightGoal ?? 0;
    this.weeklyGoal = weeklyGoal ?? 0;
  }
}

// Referenzen und Zustände
const weights = ref<Weight[]>([]);
const weightInput = ref<number>(0);
const heightInput = ref<number>(0);
const weightGoalInput = ref<number>(0);
const weeklyGoalInput = ref<number>(0);

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/Weight/weights`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Berechnung der Zeitspanne bis zum Erreichen des Ziels
const timeToReachGoal = computed(() => {
  if (weightInput.value && weightGoalInput.value && weeklyGoalInput.value) {
    const weightDifference = Math.abs(weightInput.value - weightGoalInput.value);
    const weeksToGoal = weightDifference / weeklyGoalInput.value;
    const monthsToGoal = weeksToGoal / 4.345;  // Durchschnittliche Anzahl der Wochen pro Monat
    return Math.ceil(monthsToGoal);
  }
  return null;
});

// Funktion zum Abrufen der Gewichtseinträge
async function fetchWeights() {
  try {
    const response = await axios.get(endpoint);
    weights.value = response.data.map((entry: any) => new Weight(
        entry.id,
        new Date(entry.dateRecorded),
        entry.weight,
        entry.height,
        entry.weightGoal,
        entry.weeklyGoal
    ));
  } catch (error) {
    console.error('Fehler beim Abrufen der Gewichtsdaten:', error);
  }
}

// Funktion zum Speichern eines neuen Gewichtseintrags
async function saveWeight() {
  const weightData = {
    dateRecorded: new Date().toISOString(),
    weight: weightInput.value,
    height: heightInput.value,
    weightGoal: weightGoalInput.value,
    weeklyGoal: weeklyGoalInput.value,
  };

  try {
    const response = await axios.post(endpoint, weightData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    weights.value.push(new Weight(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.weight,
        response.data.height,
        response.data.weightGoal,
        response.data.weeklyGoal
    ));
    weightInput.value = 0;
    heightInput.value = 0;
    weightGoalInput.value = 0;
    weeklyGoalInput.value = 0;
  } catch (error) {
    console.error('Fehler beim Speichern des Gewichts:', error);
  }
}

// Funktion zum Löschen eines Gewichtseintrags
async function deleteWeight(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    weights.value = weights.value.filter(w => w.id !== id);
  } catch (error) {
    console.error('Fehler beim Löschen des Gewichts:', error);
  }
}

onMounted(async () => {
  await fetchWeights();
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Open Sans', sans-serif;
  color: #333;
  background-color: #f0f4f8;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.form-container {
  margin-top: 20px;
}

.form-container label {
  margin-top: 10px;
  display: block;
  color: #333;
}

.form-container input {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-save {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 3px 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.btn-save:hover {
  background-color: #45a049;
}

.btn-delete {
  background-color: #4CAF50;
  color: #fff;
  border: none;
  padding: 3px 5px;
  cursor: pointer;
  border-radius: 3px;
  transition: background-color 0.3s ease;
}

.btn-delete:hover {
  background-color: #cc0000;
}

.goal-container {
  margin-top: 20px;
  background-color: #e7f4e4;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  font-weight: bold;
  color: #2a6d2a;
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
  padding: 8px;
}

table th {
  background-color: #4CAF50;
  text-align: left;
  color: #fff;
}

button {
  cursor: pointer;
}
</style>
