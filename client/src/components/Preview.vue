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
            <img :src="image.blob" class="image" width="700" />
            <div class="uk-text-center@s">↑ {{ image.filename }}</div>
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
  border: solid #d1d1d1;
}
</style>
