<template>
  <div></div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'Root',
  async mounted() {
    if (typeof this.$route.hash === 'string') {
      if (this.$route.hash[0] === '#') {
        await this.$router.push({ path: '/login', hash: this.$route.hash })
        return
      }
      await this.$router.push('/login')
    }
  }
})
</script>
