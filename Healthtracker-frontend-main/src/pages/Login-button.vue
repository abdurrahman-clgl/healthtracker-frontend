<!-- src/components/buttons/login-button.vue -->
<template>
  <button class="button__login" @click="handleLogin">Log In</button>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';

const { loginWithRedirect } = useAuth0();

const handleLogin = () => {
  loginWithRedirect({
    appState: {
      target: '/',
    },
  });
};
</script>

<style scoped>
.button__login {
  /* Füge hier deine spezifischen Stile für den Login-Button hinzu */
}
</style>
