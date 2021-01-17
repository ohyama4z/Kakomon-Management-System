<template>
  <div class="uk-overflow-auto uk-padding">
    <table class="uk-table uk-table-divider uk-table-striped uk-table-middle">
      <thead>
        <tr>
          <th class="uk-text-nowrap">選択</th>
          <th class="uk-text-nowrap">index</th>
          <th class="uk-text-nowrap">ファイル名</th>
          <th class="uk-text-nowrap">教科名</th>
          <th class="uk-text-nowrap">年度</th>
          <th class="uk-text-nowrap">用途</th>
          <th class="uk-text-nowrap">時期</th>
          <th class="uk-text-nowrap">種類</th>
          <th class="uk-text-nowrap">作成者</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, filename) in files" v-bind:key="data.src">
          <td>
            <input
              type="checkbox"
              class="uk-checkbox"
              :value="filename"
              v-model="selectedFiles"
              @change="setSelectedFiles"
            />
          </td>
          <td>
            <input
              type="number"
              class="uk-input uk-form-small uk-form-width-small"
              :placeholder="data.image_index"
              @change="updateIndex($event, filename)"
            />
          </td>
          <td>
            <span class="uk-hidden@m uk-text-nowrap">
              {{
                filename.substr(filename.lastIndexOf('/') + 1).substr(0, 3)
              }}...{{
                filename.substr(filename.length - 7, filename.length - 1)
              }}
            </span>
            <span class="uk-visible@m uk-text-nowrap">
              {{ filename.substr(filename.lastIndexOf('/') + 1) }}
            </span>
          </td>
          <td class="uk-text-nowrap">{{ data.subj }}</td>
          <td class="uk-text-nowrap">{{ data.year }}</td>
          <td class="uk-text-nowrap">{{ data.tool_type }}</td>
          <td class="uk-text-nowrap">{{ data.period }}</td>
          <td class="uk-text-nowrap">{{ data.content_type }}</td>
          <td class="uk-text-nowrap">{{ data.author }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import type { State } from '../store/state'
import Vue from 'vue'

import { StateTypedVueConstructor } from '../extended'

interface Data {
  selectedFiles: string[]
}
export default (Vue as StateTypedVueConstructor).extend({
  name: 'List',
  data(): Data {
    return {
      selectedFiles: []
    }
  },
  watch: {
    selectedFilesInState(val) {
      this.selectedFiles = val
    }
  },
  computed: {
    files() {
      const state = this.$store.state as State
      return state.changedFiles
    },
    selectedFilesInState() {
      const state = this.$store.state as State
      return state.selectedFiles
    }
  },
  methods: {
    setSelectedFiles(): void {
      this.$store.commit('setSelectedFiles', this.selectedFiles)
    },
    updateIndex(e: any, filename: string): void {
      if (e.target.value !== '') {
        const index =
          e.target.value.length < 3
            ? '0'.repeat(3 - e.target.value.length) + e.target.value
            : e.target.value
        if (index !== '000') {
          const payload = {
            filename,
            index
          }
          this.$store.commit('updateChangedFileIndex', payload)
        }
      }
    }
  }
})
</script>
