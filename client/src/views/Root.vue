<template>
  <div></div>
</template>

<script>
export default {
  name: 'Root',
  mounted() {
    if (typeof this.$route.hash === 'object') {
      this.$router.push('/login')
    }
    this.$router.push({ path: '/login', hash: this.$route.hash })
  }
}
</script>
