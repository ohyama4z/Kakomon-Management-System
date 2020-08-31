<template>
  <div></div>
</template>

<script>
export default {
  name: 'Root',
  mounted() {
    if (typeof this.$route.hash === 'string') {
      this.$router.push({ path: '/login', hash: this.$route.hash })
    }
    this.$router.push('/login')
  }
}
</script>
