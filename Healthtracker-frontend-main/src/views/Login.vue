<!-- src/views/Login.vue -->
<template>
  <div>
    <h1>Login</h1>
    <div id="sign-in-widget"></div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { OktaSignIn } from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';
import oktaConfig from '../okta/oktaConfig';

export default {
  setup() {
    onMounted(() => {
      const signIn = new OktaSignIn({
        baseUrl: oktaConfig.issuer.split('/oauth2')[0],
        clientId: oktaConfig.clientId,
        redirectUri: oktaConfig.redirectUri,
        authParams: {
          issuer: oktaConfig.issuer,
          responseType: ['token', 'id_token'],
          display: 'page'
        }
      });

      signIn.renderEl(
          { el: '#sign-in-widget' },
          () => {
            // success callback
          },
          (err) => {
            throw err;
          }
      );
    });

    return {};
  }
};
</script>

<style scoped>
/* Fügen Sie hier Ihre CSS-Stile hinzu */
</style>
