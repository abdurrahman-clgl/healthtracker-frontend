<!-- src/components/buttons/signup-button.vue -->
<template>
  <button class="button__sign-up" @click="handleSignUp">Sign Up</button>
</template>

<script setup>
import { useAuth0 } from '@auth0/auth0-vue';

const { loginWithRedirect } = useAuth0();

const handleSignUp = () => {
  loginWithRedirect({
    appState: {
      target: '/profile',
    },
    authorizationParams: {
      screen_hint: 'signup',
    },
  });
};
</script>

<style scoped>
.button__sign-up {
  /* Füge hier deine spezifischen Stile für den Sign-Up-Button hinzu */
}
</style>
