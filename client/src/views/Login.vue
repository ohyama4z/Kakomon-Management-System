<template>
  <div>
    <div class="uk-position-top uk-text-center">
      誤ってログイン画面を閉じてしまった場合は、ブラウザを再読み込みしてください。(CTRL+R
      or F5)
    </div>
  </div>
</template>

<script lang="ts">
import netlifyIdentity from 'netlify-identity-widget'

import Vue from 'vue'

export default Vue.extend({
  name: 'login',
  mounted() {
    this.$store.dispatch('updateCurrentUser')

    if (this.$store.state.currentUser != null) {
      this.$store.commit('updateLastPage')
      this.$router.push(`/${this.$store.state.lastPage}`)
      return
    }

    netlifyIdentity.on('login', () => {
      this.$store.commit('updateLastPage')
      this.$router.push(`/${this.$store.state.lastPage}`)
    })

    netlifyIdentity.open()
  },

  beforeRouteLeave(to, from, next) {
    netlifyIdentity.close()
    next()
  }
})
</script>
