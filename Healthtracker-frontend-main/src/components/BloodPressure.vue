<template>
  <div class="container">
    <h2>Blutdrucküberwachung</h2>

    <!-- Eingabeformular -->
    <div class="form-container">
      <h3>Neuer Blutdruckeintrag</h3>
      <label for="systolicPressure">Systolischer Druck (mmHg):</label>
      <input v-model="systolicPressureInput" id="systolicPressure" type="number" placeholder="Systolischer Druck">

      <label for="diastolicPressure">Diastolischer Druck (mmHg):</label>
      <input v-model="diastolicPressureInput" id="diastolicPressure" type="number" placeholder="Diastolischer Druck">

      <button @click="saveBloodPressure" class="btn-save">Speichern</button>
    </div>

    <!-- Eingabeformular für das Aktualisieren von Blutdruckeinträgen -->
    <div class="form-container" v-if="editableBloodPressure">
      <h3>Blutdruckeintrag aktualisieren</h3>
      <label for="updateSystolicPressure">Systolischer Druck (mmHg):</label>
      <input v-model="editableBloodPressure.systolicPressure" id="updateSystolicPressure" type="number" placeholder="Systolischer Druck">

      <label for="updateDiastolicPressure">Diastolischer Druck (mmHg):</label>
      <input v-model="editableBloodPressure.diastolicPressure" id="updateDiastolicPressure" type="number" placeholder="Diastolischer Druck">

      <button @click="updateBloodPressure" class="btn-save">Aktualisieren</button>
      <button @click="cancelUpdate" class="btn-cancel">Abbrechen</button>
    </div>

    <!-- Liste der Blutdruckeinträge -->
    <div class="list-container">
      <table v-if="bloodPressures.length > 0">
        <thead>
        <tr>
          <th>Datum</th>
          <th>Systolischer Druck (mmHg)</th>
          <th>Diastolischer Druck (mmHg)</th>
          <th>Aktion</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(entry, index) in bloodPressures" :key="index">
          <td>{{ formatDate(entry.dateRecorded) }}</td>
          <td>{{ entry.systolicPressure }}</td>
          <td>{{ entry.diastolicPressure }}</td>
          <td>
            <button @click="editBloodPressure(entry)" class="btn-edit">Bearbeiten</button>
            <button @click="deleteBloodPressure(entry.id)" class="btn-delete">Löschen</button>
          </td>
        </tr>
        </tbody>
      </table>
      <p v-else>Noch keine Blutdruckeinträge aufgezeichnet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Definiere die BloodPressure-Klasse
class BloodPressure {
  id: number;
  dateRecorded: Date;
  systolicPressure: number;
  diastolicPressure: number;

  constructor(id?: number, dateRecorded?: Date, systolicPressure?: number, diastolicPressure?: number) {
    this.id = id ?? 0;
    this.dateRecorded = dateRecorded ?? new Date();
    this.systolicPressure = systolicPressure ?? 0;
    this.diastolicPressure = diastolicPressure ?? 0;
  }
}

// Referenzen und Zustände
const bloodPressures = ref<BloodPressure[]>([]);
const systolicPressureInput = ref<number>(0);
const diastolicPressureInput = ref<number>(0);
const editableBloodPressure = ref<BloodPressure | null>(null);

// API-Endpunkt
const baseUrl = import.meta.env.VITE_APP_BACKEND_BASE_URL;
const endpoint = `${baseUrl}/BloodPressures/bloodpressure`;

// Hilfsfunktion zum Formatieren des Datums
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE');
}

// Funktion zum Abrufen der Blutdruckeinträge
async function fetchBloodPressures() {
  try {
    const response = await axios.get(endpoint);
    bloodPressures.value = response.data.map((entry: any) => new BloodPressure(
        entry.id,
        new Date(entry.dateRecorded),
        entry.systolicPressure,
        entry.diastolicPressure
    ));
  } catch (error) {
    console.error('Fehler beim Abrufen der Blutdruckdaten:', error);
  }
}

// Funktion zum Speichern eines neuen Blutdruckeintrags
async function saveBloodPressure() {
  const bloodPressureData = {
    dateRecorded: new Date().toISOString(),
    systolicPressure: systolicPressureInput.value,
    diastolicPressure: diastolicPressureInput.value,
  };

  try {
    const response = await axios.post(endpoint, bloodPressureData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    bloodPressures.value.push(new BloodPressure(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.systolicPressure,
        response.data.diastolicPressure
    ));
    systolicPressureInput.value = 0;
    diastolicPressureInput.value = 0;
  } catch (error) {
    console.error('Fehler beim Speichern des Blutdrucks:', error);
  }
}

// Funktion zum Bearbeiten eines Blutdruckeintrags
function editBloodPressure(bloodPressure: BloodPressure) {
  editableBloodPressure.value = { ...bloodPressure };
}

// Funktion zum Aktualisieren eines Blutdruckeintrags
async function updateBloodPressure() {
  if (!editableBloodPressure.value) return;

  try {
    const response = await axios.put(`${endpoint}/${editableBloodPressure.value.id}`, editableBloodPressure.value, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const updatedBloodPressure = new BloodPressure(
        response.data.id,
        new Date(response.data.dateRecorded),
        response.data.systolicPressure,
        response.data.diastolicPressure
    );

    const index = bloodPressures.value.findIndex(bp => bp.id === updatedBloodPressure.id);
    if (index !== -1) {
      bloodPressures.value[index] = updatedBloodPressure;
    }

    // Reset editableBloodPressure
    editableBloodPressure.value = null;

  } catch (error) {
    console.error('Fehler beim Aktualisieren des Blutdrucks:', error);
  }
}

// Funktion zum Abbrechen der Aktualisierung
function cancelUpdate() {
  editableBloodPressure.value = null;
}

// Funktion zum Löschen eines Blutdruckeintrags
async function deleteBloodPressure(id: number) {
  try {
    await axios.delete(`${endpoint}/${id}`);
    bloodPressures.value = bloodPressures.value.filter(bp => bp.id !== id);
  } catch (error) {
    console.error('Fehler beim Löschen des Blutdrucks:', error);
  }
}

onMounted(async () => {
  await fetchBloodPressures();
});
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Open Sans', sans-serif;
  color: #333;
  background-color: #ffe6e6;
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
  color: #cc0000;
}

.form-container input {
  margin-bottom: 10px;
  padding: 5px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cc0000;
  border-radius: 4px;
}

.btn-save, .btn-cancel, .btn-edit, .btn-delete {
  background-color: #cc0000;
  color: #fff;
  border: none;
  padding: 3px 5px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
  width: 100%
}

.btn-save:hover, .btn-cancel:hover, .btn-edit:hover, .btn-delete:hover {
  background-color: #a30000;
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
  background-color: #ffcccc;
  text-align: left;
  color: #cc0000;
}

button {
  cursor: pointer;
}
</style>
