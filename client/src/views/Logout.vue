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

import { StateTypedVueConstructor } from '../extended'
export default (Vue as StateTypedVueConstructor).extend({
  components: {
    VkSpinner: Spinner
  },

  mounted() {
    if (netlifyIdentity.currentUser() == null) {
      this.$router.push('/login')
      return
    }
    netlifyIdentity.logout()
    netlifyIdentity.on('logout', () => {
      this.$store.dispatch('updateCurrentUser')
      this.$router.push('/login')
    })
  }
})
</script>
