<template>
  <div>
    <div
      class="uk-flex uk-flex-center uk-margin-small"
      v-for="(data, filename) in files"
      v-bind:key="data.src"
    >
      <vk-iconnav>
        <vk-iconnav-item icon="trash"></vk-iconnav-item>
        {{ filename.substr(filename.lastIndexOf('/') + 1) }}
      </vk-iconnav>
    </div>
  </div>
</template>

<script lang="ts">
import type { State } from '../store/state'
import Vue from 'vue'

export default Vue.extend({
  name: 'List',
  computed: {
    files() {
      const state = this.$store.state as State
      return state.changedFiles
    }
  }
})
</script>
