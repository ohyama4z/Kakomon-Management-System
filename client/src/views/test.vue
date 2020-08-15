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
}
</script>
 
<style>
@import url('https://use.fontawesome.com/releases/v5.6.1/css/all.css');
 
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15px;
}
</style>