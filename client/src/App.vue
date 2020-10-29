<template>
  <div>
    <router-view></router-view>
    <vk-notification
      position="bottom-center"
      :messages.sync="messages"
      timeout="1000000000"
    ></vk-notification>
    <input type="text" v-model="text" />
    <button @click="notify">通知テスト</button>
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
      ;(this as any).messages = val
    },
    messages(val) {
      this.$store.dispatch('syncNotificationsChange', val)
    }
  },
  computed: {
    notificactionInState() {
      return (this.$store.state as State).notifications
    }
  },
  methods: {
    notify(): void {
      this.$store.dispatch('notify', this.text)
    }
  }
})
</script>
