<template>
  <div>
    <vk-navbar-full>
      <vk-navbar-nav>
        <vk-navbar-logo>Logo</vk-navbar-logo>
        <vk-navbar-nav>
          <vk-navbar-nav-item icon="star" title="Features"></vk-navbar-nav-item>
        </vk-navbar-nav>
        <vk-navbar-item>
          <div>Some <a>Link</a></div>
        </vk-navbar-item>
        <vk-navbar-item>
          <form action="javascript:void(0)">
            <input
              class="uk-input uk-form-width-small uk-margin-small-right"
              type="text"
              placeholder="Input"
            />
            <vk-button>Button</vk-button>
          </form>
        </vk-navbar-item>
      </vk-navbar-nav>
    </vk-navbar-full>
  </div>
</template>

<script>
export default {
  name: 'Navbar'
}
</script>
