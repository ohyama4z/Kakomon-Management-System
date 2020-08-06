<template>
  <div class="container">
    <button v-on:click="updateState()"> updateState </button>
    <div v-if="status === 'loading'">NOW LOADING</div>
    <div v-else>{{state}}</div>
  </div>
</template>
 
<script>
export default {
  name: 'test',
  data() {
    return {
      state: null
    }
  },
  computed: {
    status () {
      return this.$store.state.serverSideLanguage.status
    }
  },
  methods: {
    updateState () {
      this.$store.dispatch('updateState')
      this.state = this.$store.state.serverSideLanguage.name
    }
  }
}
</script>