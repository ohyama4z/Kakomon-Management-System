<template>
  <div></div>
</template>

<script>
export default {
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
}
</script>
