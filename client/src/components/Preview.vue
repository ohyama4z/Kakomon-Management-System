<template>
  <div class="uk-margin">
    <vk-spinner class="uk-flex uk-flex-center" v-if="!images" ratio="5" />
    <ul v-else v-vk-margin>
      <template>
        <li
          v-for="image in images"
          v-bind:key="image"
          class="uk-flex uk-flex-center"
        >
          <img :src="image" width="60%" v-if="image" />
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
          console.log(state.imageDatas?.[imageSha]?.data)
          return state.imageDatas?.[imageSha]?.data
        })
      }
    })
  }
}
</script>
