<template>
  <div class="uk-margin">
    <vk-spinner class="uk-flex uk-flex-center" v-if="!images" ratio="5" />
    <ul v-else>
      <template>
        <li v-for="(key, image) in images" v-bind:key="key">
          <img :src="image.blobUri" width="10%" v-if="!image" />
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
        const commitSha = state.branches[state.currentBranch]
        return state.imageDatas?.[commitSha]?.data
      }
    })
  }
}
</script>
