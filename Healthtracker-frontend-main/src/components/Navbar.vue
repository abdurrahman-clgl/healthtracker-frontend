<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue";
import LoginButton from '@/pages/Login-button.vue';
import LogoutButton from '@/pages/logout-button.vue';
import SignupButton from '@/pages/signup-button.vue';

const { isAuthenticated } = useAuth0();
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">HealthTracker</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav">
          <router-link class="nav-link" to="/">Home</router-link>
          <template v-if="isAuthenticated">
            <router-link class="nav-link" to="/heartrate">HeartRate</router-link>
            <router-link class="nav-link" to="/sleeppattern">SleepPattern</router-link>
            <router-link class="nav-link" to="/bloodpressure">BloodPressure</router-link>
            <router-link class="nav-link" to="/bloodsugar">BloodSugar</router-link>
            <router-link class="nav-link" to="/stepcount">StepCount</router-link>
            <router-link class="nav-link" to="/weight">Weight</router-link>
          </template>
        </ul>
        <ul class="navbar-nav ms-auto">
          <template v-if="!isAuthenticated">
            <SignupButton />
            <LoginButton />
          </template>
          <template v-else>
            <LogoutButton />
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  font-family: 'Open Sans', sans-serif;
}
.navbar-brand {
  font-weight: bold;
}
.nav-link {
  margin-right: 10px;
}
</style>
