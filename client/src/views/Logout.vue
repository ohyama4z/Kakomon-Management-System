<template>
  <div>
    <div class="uk-position-top uk-text-center">
      ログアウト中です...
    </div>

    <vk-spinner
      class="uk-position-medium uk-position-center"
      ratio="5"
    ></vk-spinner>
  </div>
</template>

<script lang="ts">
// @ts-ignore
import { Spinner } from 'vuikit'
import netlifyIdentity from 'netlify-identity-widget'

import Vue from 'vue'

export default Vue.extend({
  components: {
    VkSpinner: Spinner
  },

  mounted() {
    netlifyIdentity.logout()
    netlifyIdentity.on('logout', () => {
      this.$store.dispatch('updateCurrentUser')
      this.$router.push('/login')
    })
  }
})
</script>
