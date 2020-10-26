<template>
  <div>
    <router-view></router-view>
    <vk-notification :messages.sync="messages"></vk-notification>
    <button @click="notify">あほあほｆでゃおｓ</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from './store/state'
import 'vuikit'

// @ts-ignore
import { Notification } from 'vuikit/lib/notification'
export default Vue.extend({
  name: 'App',

  components: {
    VkNotification: Notification
  },
  computed: {
    messages() {
      return (this.$store.state as State).notifications
    }
  },
  methods: {
    notify() {
      this.$store.dispatch('notify', 'あほ')
    }
  }
})
</script>
