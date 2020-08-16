<template>
  <div>ログアウトできてるよ！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！</div>
</template>

<script>
import netlifyIdentity from 'netlify-identity-widget'
export default {
  mounted () {
    netlifyIdentity.logout()
    netlifyIdentity.on('logout', () => {
      this.$store.dispatch('updateCurrentUser')
      this.$router.push('/login')
    })
  }
}
</script>