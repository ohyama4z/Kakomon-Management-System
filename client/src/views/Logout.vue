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

<script>
import { Spinner } from 'vuikit'
import netlifyIdentity from 'netlify-identity-widget'

export default {
  conponent: {
    VkSpinner: Spinner
  },

  mounted() {
    netlifyIdentity.logout()
    netlifyIdentity.on('logout', () => {
      this.$store.dispatch('updateCurrentUser')
      this.$router.push('/login')
    })
  }
}
</script>
