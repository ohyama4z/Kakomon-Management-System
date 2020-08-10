<template>
  <div></div>
</template>

<script>
  const netlifyIdentity = require('netlify-identity-widget')
  export default {
    name: 'login',
      data () {
        return {
        }
      },

    mounted () {
      console.log('あほ')
      netlifyIdentity.open()
      netlifyIdentity.on('login', () => {
        console.log('あふいえふぁえ')
        this.$store.commit('getCurrentUser')
        this.$store.dispatch('get')
        // console.log('login', user)
        // console.log('state', this.$store.state.currentUser)
      });
    }
}
</script>