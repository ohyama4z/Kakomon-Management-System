<template>
  <div>
    <ul>
      <li v-for="(key, img) in images" v-bind:key="img.data.src">
        <img :src="img.data.src" width="10%" />
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'Preview',
  computed: {
    ...mapState({
      images: state => state.images
    })
  }
}
</script>
