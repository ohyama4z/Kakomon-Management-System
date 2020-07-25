<template>
  <div id="app">
    <p>{{ count }}</p>
    <p>
      <button @click="increment">+</button>
      <button @click="decrement">-</button>
    </p>
    <input type="number" v-model="amount">
  </div>
</template>

<script>
  export default {
    name: 'App',
    data () {
      return {
        amount: 1
      }
    },
    computed: {
        count () {
          return this.$store.state.count
        }
    },
    methods: {
      increment () {
        this.$store.commit('increment', this.amount)
      },
      decrement () {
        this.$store.commit('decrement', this.amount)
      }
    }
  }
</script>
