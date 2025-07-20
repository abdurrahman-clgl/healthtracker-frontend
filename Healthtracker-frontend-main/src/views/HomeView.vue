<template>
  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <h1>Willkommen zu Ihrem Gesundheitstracker</h1>
        <p>Verfolgen und verwalten Sie Ihre wichtigsten Gesundheitsdaten mühelos.</p>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section py-5">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-4" v-for="(feature, index) in features" :key="index">
            <router-link :to="feature.link" class="feature-link">
              <div class="mb-4">
                <i :class="`feature-icon bi bi-${feature.icon}`"></i>
              </div>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer Section -->
    <footer class="footer">
      <div class="container">
        <p>&copy; 2024 Gesundheitstracker. Alle Rechte vorbehalten.</p>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const features = ref([
  {
    icon: 'heart',
    title: 'Herzfrequenz',
    description: 'Überwachen Sie Ihre Herzfrequenz und erhalten Sie wertvolle Einblicke in Ihre kardiovaskuläre Gesundheit.',
    link: '/heartrate'
  },
  {
    icon: 'speedometer',
    title: 'Blutdruck',
    description: 'Verfolgen Sie Ihren Blutdruck, um Ihre Herzgesundheit im Auge zu behalten.',
    link: '/bloodpressure'
  },
  {
    icon: 'person-lines-fill',
    title: 'Gewicht',
    description: 'Überprüfen Sie Ihre Gewichtsveränderungen und setzen Sie sich gesundheitsbewusste Ziele.',
    link: '/weight'
  },
  {
    icon: 'bicycle',
    title: 'Schrittzähler',
    description: 'Verfolgen Sie Ihre täglichen Schritte und bleiben Sie aktiv.',
    link: '/stepcount'
  },
  {
    icon: 'moon',
    title: 'Schlafmuster',
    description: 'Analysieren Sie Ihre Schlafgewohnheiten und verbessern Sie Ihre Schlafqualität.',
    link: '/sleeppattern'
  },
  {
    icon: 'droplet-half',
    title: 'Blutzuckerspiegel',
    description: 'Behalten Sie Ihren Blutzuckerspiegel im Auge und verwalten Sie Ihre Diabetes.',
    link: '/bloodsugar'
  }
]);
</script>

<style scoped>
.hero-section {
  background: url('/2465431.jpg') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 100px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 70vh; /* Höhe auf 70% des Viewports gesetzt */
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.hero-section p {
  font-size: 1.5rem;
  margin-bottom: 30px;
}

.features-section {
  background-color: #f8f9fa;
}

.feature-link {
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease;
}

.feature-link:hover {
  text-decoration: none;
  color: #007bff;
  transform: translateY(-10px);
}

.feature-icon {
  font-size: 2.5rem;
  color: #007bff;
  transition: color 0.3s ease;
}

.feature-link:hover .feature-icon {
  color: #0056b3;
}

.footer {
  background-color: #343a40;
  color: #f8f9fa;
  padding: 20px 0;
  text-align: center;
}

.footer p {
  margin: 0;
}
</style>
