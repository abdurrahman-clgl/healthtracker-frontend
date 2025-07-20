<!-- src/pages/callback-page.vue -->
<template>
  <div class="page-layout">
    <NavBar />
    <div class="page-layout__content">
      <slot>
        <div>Loading...</div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth0 } from '@auth0/auth0-vue';
import NavBar from "@/components/Navbar.vue";

const { handleRedirectCallback, isAuthenticated } = useAuth0();

onMounted(async () => {
  await handleRedirectCallback();
  if (isAuthenticated) {
    window.location.replace('/');
  }
});
</script>

<style scoped>
.page-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.page-layout__content {
  text-align: center;
  font-size: 24px;
}
</style>
