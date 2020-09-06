<template>
  <div class="uk-margin">
    <ul v-if="images">
      <template>
        <li
          v-for="image in images"
          v-bind:key="image.blob"
          class="uk-flex uk-flex-center"
        >
          <div v-if="image.blob" class="uk-margin-top">
            <div class="uk-inline">
              <img
                :src="image.blob"
                :class="{
                  image: !isSelected(image.filePath),
                  selectedImage: isSelected(image.filePath)
                }"
                width="700"
              />
              <div class="uk-position-top-right uk-overlay">
                <vk-icon-button
                  class="uk-margin-small-right"
                  :class="{ selectedIcon: isSelected(image.filePath) }"
                  icon="check"
                  @click="selectImage(image.filePath)"
                ></vk-icon-button>
              </div>
            </div>
            <div
              class="uk-text-center@s"
              :class="{
                filename: !isSelected(image.filePath),
                selectedFilename: isSelected(image.filePath)
              }"
            >
              {{ image.filename }}
            </div>
          </div>
          <vk-spinner raito="5" v-else />
        </li>
      </template>
    </ul>
  </div>
</template>

<script lang="ts">
import type { State } from '../store/state'
// @ts-ignore
import { IconButton } from 'vuikit/lib/icon'
// @ts-ignore
import { Spinner } from 'vuikit/lib/spinner'

import Vue from 'vue'
interface Image {
  blob: string
  filename: string
  selected: boolean
}

export default Vue.extend({
  name: 'Preview',
  components: {
    VkIconButton: IconButton,
    VkSpinner: Spinner
  },
  computed: {
    images() {
      const state = this.$store.state as State
      const commitSha = state.branches.data[state.currentBranch]
      return state.displayedFiles.map(filePath => {
        const directoryPath = filePath.substr(0, filePath.lastIndexOf('/'))
        const filename = filePath.substr(filePath.lastIndexOf('/') + 1)
        const imageSha =
          state.imageShas[commitSha]?.[directoryPath]?.data?.[filename]

        return { blob: state.imageDatas?.[imageSha]?.data, filename, filePath }
      })
    },
    selectedFiles() {
      const state = this.$store.state as State
      return state.selectedFiles
    }
  },
  methods: {
    selectImage(filename: string): void {
      console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')
      const payload = new Set()
      this.selectedFiles.map(f => {
        payload.add(f)
      })
      if (payload.has(filename)) {
        payload.delete(filename)
      } else {
        payload.add(filename)
      }
      this.$store.commit('setSelectedFiles', [...payload])
    },

    isSelected(filename: string): boolean {
      const duplicatedFile: string | undefined = this.selectedFiles.find(
        (f: string) => f === filename
      )
      return duplicatedFile != null
    }
  }
})
</script>

<style scoped>
.image {
  border-top: solid #f5f5f5;
  border-left: solid #f5f5f5;
  border-right: solid #f5f5f5;
}
.filename {
  border-bottom: solid #f5f5f5;
  border-left: solid #f5f5f5;
  border-right: solid #f5f5f5;
  background-color: #f5f5f5;
}
.selectedImage {
  border-top: solid #87cefa;
  border-left: solid #87cefa;
  border-right: solid #87cefa;
}
.selectedFilename {
  border-bottom: solid #87cefa;
  border-left: solid #87cefa;
  border-right: solid #87cefa;
  background-color: #87cefa;
}
.selectedIcon {
  color: white;
  background-color: #39f;
}
</style>
