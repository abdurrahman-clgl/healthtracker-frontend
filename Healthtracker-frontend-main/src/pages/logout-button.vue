<!-- src/components/buttons/logout-button.vue -->
<template>
  <button class="button__logout" @click="handleLogout">Log Out</button>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';

const { logout } = useAuth0();

const handleLogout = () => {
  logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};
</script>

<style scoped>
.button__logout {
  /* Füge hier deine spezifischen Stile für den Logout-Button hinzu */
}
</style>
