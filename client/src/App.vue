<template>
  <div>
    <router-view></router-view>
    <vk-notification :messages.sync="messages"></vk-notification>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from './store/state'
export default Vue.extend({
  computed: {
    messages() {
      return (this.$store.state as State).errorMessages
    }
  }
})
</script>
