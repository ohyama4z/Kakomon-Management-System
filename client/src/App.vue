<template>
  <div>
    <router-view></router-view>
    <vk-notification
      position="bottom-center"
      :messages.sync="messages"
    ></vk-notification>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { State } from './store/state'
import 'vuikit'
// @ts-ignore
import { Notification } from 'vuikit/lib/notification'

interface Data {
  messages: string[]
  text: string
}

export default Vue.extend({
  name: 'App',

  components: {
    VkNotification: Notification
  },
  data(): Data {
    return {
      messages: [],
      text: ''
    }
  },
  watch: {
    notificactionInState(val) {
      this.messages = val
    },
    messages(val) {
      this.$store.commit('syncNotificationsChange', { messages: val })
    }
  },
  computed: {
    notificactionInState() {
      return (this.$store.state as State).notifications
    }
  }
})
</script>
