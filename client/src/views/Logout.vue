<template>
  <div>
    <vk-spinner
      class="uk-position-medium uk-position-center"
      ratio="5"
    ></vk-spinner>
  </div>
</template>

<script>
import netlifyIdentity from 'netlify-identity-widget'
export default {
  mounted() {
    netlifyIdentity.logout()
    netlifyIdentity.on('logout', () => {
      this.$store.dispatch('updateCurrentUser')
      this.$router.push('/login')
    })
  }
}
</script>
