<template>
  <sidebar-menu
    :menu="sidebarMenu"
    :show-one-child="true"
    @toggle-collapse="onToggleCollapse"
    @item-click="onItemClick"
  />
</template>

<script lang="ts">
import merge from 'deepmerge'
import { mapGetters } from 'vuex'
import { SidebarMenu } from 'vue-sidebar-menu'

import Vue from 'vue'
export default Vue.extend({
  name: 'Sidebar',
  components: {
    SidebarMenu
  },

  computed: {
    ...mapGetters(['currentBranchMetadatas']),

    intermediateFiles(): any {
      const files = Object.values(this.currentBranchMetadatas.data)
      const beforeMerge = files.map((file: any) => {
        const {
          period,
          subj,
          // eslint-disable-next-line camelcase
          tool_type,
          year,
          // eslint-disable-next-line camelcase
          content_type
        }: // @ts-ignore
        any = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            value === '' ? '不明' : value
          ])
        )

        const fileResult = {
          [period]: {
            [subj]: {
              // eslint-disable-next-line camelcase
              [tool_type]: {
                [year]: {
                  // eslint-disable-next-line camelcase
                  [content_type]: {
                    [file.src.replace(/^.*\//, '')]: file
                  }
                }
              }
            }
          }
        }
        return fileResult
      })
      const result = merge.all(beforeMerge)
      return result
    },

    menuStructure(): any {
      const icon = 'fa fa-folder'
      const result = generateMenuStructure(this.intermediateFiles, 6)
      return result

      function generateMenuStructure(intermediate: any, num: any): any {
        if (num === 1) {
          const result = Object.entries(intermediate).map(([key, file]) => ({
            title: key,
            icon: 'fas fa-file',
            data: file,
            isSecondFromEnd: false,
            expand: false
          }))

          return result
        }
        return Object.entries(intermediate).reduce(
          (previous: any, [key, value]: any) => {
            return [
              ...previous,
              {
                title: key,
                icon,
                child: generateMenuStructure(value, num - 1),
                isSecondFromEnd: num === 2, // 末端ファイルの元となるフォルダかを確かめる
                expand: false
              }
            ]
          },
          []
        )
      }
    },

    sidebarMenu(): any {
      const header = [
        {
          header: true,
          title: `Branch : ${this.$store.state.currentBranch}`,
          hiddenOnCollapse: true
        }
      ]
      return [...header, ...this.menuStructure]
    }
  },

  methods: {
    onItemClick(e: any, item: any): void {
      // データツリーの末端ファイルの元となるフォルダをクリックしたときに処理を行う
      if (item.isSecondFromEnd && !item.expand) {
        const fileSha = item.child[0].data.sha
        this.$store.dispatch('getImageDatas', fileSha)
        const changedFilesBase = Object.fromEntries(
          item.child.map((file: any) => {
            return [file.data.src, file.data]
          })
        )
        this.$store.commit('setChangedFilesBase', changedFilesBase)
      }

      item.expand = !item.expand
    },
    onToggleCollapse(collapsed: boolean): void {
      this.$store.commit('setExpand', !collapsed)
    }
  }
})
</script>

<style>
.v-sidebar-menu {
  margin-top: 10vh;
  height: 90vh;
}
.v-sidebar-menu .vsm--toggle-btn {
  order: -1;
}
</style>
