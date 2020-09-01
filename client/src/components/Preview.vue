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
              <img :src="image.blob" class="image" width="700" />
              <div class="uk-position-top-right uk-overlay"></div>
            </div>
            <div class="uk-text-center@s filename">{{ image.filename }}</div>
          </div>
          <vk-spinner raito="5" v-else />
        </li>
      </template>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Preview',
  computed: {
    ...mapState({
      images: state => {
        const commitSha = state.branches.data[state.currentBranch]
        return state.displayedFiles.map(filePath => {
          const directoryPath = filePath.substr(0, filePath.lastIndexOf('/'))
          const filename = filePath.substr(filePath.lastIndexOf('/') + 1)
          const imageSha =
            state.imageShas[commitSha]?.[directoryPath]?.data?.[filename]
          return { blob: state.imageDatas?.[imageSha]?.data, filename }
        })
      }
    })
  }
}
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
</style>
