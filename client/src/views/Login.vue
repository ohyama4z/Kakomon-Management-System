<template>
  <div>
    <div class="uk-position-top uk-text-center">
      誤ってログイン画面を閉じてしまった場合は、ブラウザを再読み込みしてください。(CTRL+R
      or F5)
    </div>
  </div>
</template>

<script>
const netlifyIdentity = require('netlify-identity-widget')
export default {
  name: 'login',
  data() {
    return {}
  },

  mounted() {
    netlifyIdentity.open()
    this.$store.commit('getCurrentUser')

    netlifyIdentity.on('login', () => {
      this.$store.commit('updateLastPage')
      this.$router.push(`/${this.$store.state.lastPage}`)
    })

    if (this.$store.state.currentUser != null) {
      this.$store.commit('updateLastPage')
      this.$router.push(`/${this.$store.state.lastPage}`)
    }
  }
}
</script>
