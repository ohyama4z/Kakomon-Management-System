<template>
  <vk-sticky>
    <vk-navbar-full class="custom-navbar">
      <vk-navbar-nav>
        <a
          class="help-logo"
          href="https://github.com/asann3/Kakomon-Management-System/blob/master/client/manuals/README.md"
          target="_blank"
        >
          <vk-navbar-logo class="uk-visible@m">
            KMS
          </vk-navbar-logo>
          <vk-navbar-item>
            <vk-iconnav>
              <vk-iconnav-item icon="question" />
            </vk-iconnav>
          </vk-navbar-item>
        </a>
        <vk-navbar-item class="uk-visible@m">
          <vk-button
            class="custom-button"
            v-bind:type="uploadButtonType"
            @click="toUpload"
          >
            アップロード
          </vk-button>
        </vk-navbar-item>
        <vk-navbar-item class="uk-visible@m">
          <vk-button
            class="custom-button"
            v-bind:type="editButtonType"
            @click="toEdit"
            >編集</vk-button
          >
        </vk-navbar-item>
        <vk-navbar-item class="uk-hidden@m">
          <vk-iconnav>
            <vk-iconnav-item icon="cloud-upload" @click="toUpload" />
          </vk-iconnav>
        </vk-navbar-item>
        <vk-navbar-item class="uk-hidden@m">
          <vk-iconnav>
            <vk-iconnav-item icon="file-edit" @click="toEdit" />
          </vk-iconnav>
        </vk-navbar-item>
        <vk-navbar-item class="uk-hidden@m">
          <vk-iconnav>
            <vk-iconnav-item icon="sign-out" @click="logout" />
          </vk-iconnav>
        </vk-navbar-item>
      </vk-navbar-nav>
      <vk-navbar-nav slot="right">
        <vk-navbar-item v-if="isEdit">
          <div class="uk-inline">
            <vk-icon
              class="uk-form-icon uk-form-icon-flip"
              icon="git-branch"
            ></vk-icon>
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
          </div>
        </vk-navbar-item>
        <vk-navbar-item class="uk-visible@m">
          <vk-button type="text" @click="logout"
            >ログアウト
            <vk-icon icon="sign-out"></vk-icon>
          </vk-button>
        </vk-navbar-item>
      </vk-navbar-nav>
    </vk-navbar-full>
  </vk-sticky>
</template>

<script lang="ts">
// @ts-ignore
import { Sticky } from 'vuikit/lib/sticky'
// @ts-ignore
import {
  NavbarFull,
  NavbarNav,
  NavbarItem,
  NavbarLogo
  // @ts-ignore
} from 'vuikit/lib/navbar'
// @ts-ignore
import { Button } from 'vuikit/lib/button'
import Vue from 'vue'
import { StateTypedVueConstructor } from '../extended'

interface Data {
  selectedBranch: string
}

export default (Vue as StateTypedVueConstructor).extend({
  name: 'Navbar',
  components: {
    VkSticky: Sticky,
    VkNavbarFull: NavbarFull,
    VkNavbarNav: NavbarNav,
    VkNavbarItem: NavbarItem,
    VkNavbarLogo: NavbarLogo,
    VkButton: Button
  },

  data(): Data {
    return {
      selectedBranch: 'master'
    }
  },

  computed: {
    branches(): any {
      const state = this.$store.state
      return state.branches.data
    },

    uploadButtonType(): string {
      if (this.$route.path === '/upload') {
        return ''
      }

      return 'primary'
    },
    editButtonType(): string {
      if (this.$route.path === '/edit') {
        return ''
      }

      return 'primary'
    },

    isEdit(): boolean {
      return this.$route.path === '/edit'
    }
  },

  methods: {
    toUpload(): void {
      this.$router.push('/upload')
    },

    toEdit(): void {
      this.$router.push('/edit')
    },

    logout(): void {
      this.$emit('before-logout')
      this.$router.push('/logout')
    },

    async selectBranch(): Promise<void> {
      await this.$store.dispatch('selectBranch', this.selectedBranch)
    }
  }
})
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
.uk-select:not([multiple]):not([size]) {
  background-image: none;
}

a {
  text-decoration: none;
}
</style>
