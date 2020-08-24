<template>
  <vk-sticky>
    <vk-navbar-full class="custom-navbar">
      <vk-navbar-nav>
        <a
          class="help-logo"
          href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md"
          target="_blank"
        >
          <vk-navbar-logo>
            KMS
          </vk-navbar-logo>
          <vk-navbar-item>
            <vk-iconnav>
              <vk-iconnav-item icon="question" />
            </vk-iconnav>
          </vk-navbar-item>
        </a>
        <vk-navbar-item>
          <vk-button
            class="custom-button"
            v-bind:type="uploadButtonType"
            @click="toUpload"
          >
            アップロード
          </vk-button>
        </vk-navbar-item>
        <vk-navbar-item>
          <vk-button
            class="custom-button"
            v-bind:type="editButtonType"
            @click="toEdit"
            >編集</vk-button
          >
        </vk-navbar-item>
      </vk-navbar-nav>
      <vk-navbar-nav slot="right">
        <vk-navbar-item>
          <vk-icon icon="git-branch"></vk-icon>
          <select
            class="uk-select uk-form-width-medium"
            v-model="selectedBranch"
            @change="selectBranch"
          >
            <option disabled value="">ブランチを選択</option>
            <option>master</option>
            <option
              v-for="(sha, branchName) in branches"
              v-bind:key="sha"
              v-show="branchName !== 'master'"
              >{{ branchName }}</option
            >
          </select>
        </vk-navbar-item>
        <vk-navbar-item>
          <vk-button type="text" @click="logout"
            >ログアウト
            <vk-icon icon="sign-out"></vk-icon>
          </vk-button>
        </vk-navbar-item>
      </vk-navbar-nav>
    </vk-navbar-full>
  </vk-sticky>
</template>

<script>
import { mapState } from 'vuex'
import { Sticky } from 'vuikit/lib/sticky'
import {
  NavbarFull,
  NavbarNav,
  NavbarItem,
  NavbarLogo
} from 'vuikit/lib/navbar'
import { Button } from 'vuikit/lib/button'

export default {
  name: 'Navbar',
  components: {
    VkSticky: Sticky,
    VkNavbarFull: NavbarFull,
    VkNavbarNav: NavbarNav,
    VkNavbarItem: NavbarItem,
    VkNavbarLogo: NavbarLogo,
    VkButton: Button
  },

  data() {
    return {
      selectedBranch: 'master'
    }
  },

  computed: {
    ...mapState({
      branches: state => {
        return state.branches.data
      }
    }),

    uploadButtonType() {
      if (this.$route.path === '/upload') {
        return ''
      }

      return 'primary'
    },
    editButtonType() {
      if (this.$route.path === '/edit') {
        return ''
      }

      return 'primary'
    }
  },

  methods: {
    toUpload() {
      this.$router.push('/upload')
    },

    toEdit() {
      this.$router.push('/edit')
    },

    logout() {
      localStorage.setItem('lastPage', 'edit')
      this.$store.commit('updateLastPage')
      this.$router.push('/logout')
    },

    async selectBranch() {
      await this.$store.dispatch('selectBranch', this.selectedBranch)
    }
  }
}
</script>

<style scoped>
.custom-navbar {
  height: 10vh;
}
.custom-button {
  border: 1px solid #39f;
  border-radius: 500px;
}
.help-logo {
  display: flex;
}

a {
  text-decoration: none;
}
</style>
