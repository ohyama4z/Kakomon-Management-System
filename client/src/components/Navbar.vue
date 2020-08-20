<template>
  <vk-sticky>
    <div>
      <vk-navbar-full class="custom-navbar">
        <vk-navbar-nav>
          <vk-navbar-logo>KMS</vk-navbar-logo>
          <!-- <vk-navbar-nav-item>
            <vk-button class="custom-button">アップロード</vk-button>
            <router-link to="/upload">アップロード</router-link>
          </vk-navbar-nav-item> -->
          <vk-navbar-nav-item
            icon="question"
            href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md"
            target="_blank"
          ></vk-navbar-nav-item>
        </vk-navbar-nav>
        <vk-navbar-nav slot="right">
          <vk-navabar-navitem> </vk-navabar-navitem>
        </vk-navbar-nav>
      </vk-navbar-full>
    </div>
  </vk-sticky>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>

<style scoped>
.custom-navbar {
  height: 10vh;
}
.custom-button {
  border-radius: 500px;
}
</style>
