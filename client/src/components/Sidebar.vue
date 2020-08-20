<template>
  <sidebar-menu
    :menu="sidebarMenu"
    @item-click="onItemClick"
    @toggle-collapse="onToggleCollapse"
  />
</template>

<script>
import merge from 'deepmerge'
import { mapGetters } from 'vuex'

export default {
  name: 'Sidebar',
  data() {
    return {
      selectedFiles: []
    }
  },

  computed: {
    ...mapGetters(['currentBranchMetadatas']),

    intermediateFiles() {
      const files = Object.values(this.currentBranchMetadatas)
      const beforeMerge = files.map(file => {
        const {
          period,
          subj,
          // eslint-disable-next-line camelcase
          tool_type,
          year,
          // eslint-disable-next-line camelcase
          content_type
        } = Object.fromEntries(
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

    menuStructure() {
      const icon = 'fa fa-folder'
      const result = generateMenuStructure(this.intermediateFiles, 6)
      return result

      function generateMenuStructure(intermediate, num) {
        if (num === 1) {
          const result = Object.entries(intermediate).map(([key, file]) => ({
            title: key,
            icon: 'fas fa-file',
            data: file
          }))

          return result
        }
        return Object.entries(intermediate).reduce((previous, [key, value]) => {
          if (num === 2) {
          }
          return [
            ...previous,
            {
              title: key,
              icon,
              child: generateMenuStructure(value, num - 1)
            }
          ]
        }, [])
      }
    },

    sidebarMenu() {
      const header = [
        {
          header: true,
          title: `Branch : ${this.$store.state.currentBranch}`,
          icon: '',
          hiddenOnCollapse: true
        }
      ]

      const component = [
        {
          props: {
            collapse: {
              default: true
            }
          }
        }
      ]
      return [...header, ...this.menuStructure, ...component]
    }
  },

  methods: {
    // onItemClick(e, item) {
    //   // データツリーの末端要素をクリックしたときに処理を行う
    //   if (item.child == null) {
    //     console.log(item.data)
    //     const sameItem = this.selectedFiles.find(
    //       file => file.title === item.title
    //     )
    //     if (sameItem == null) {
    //       this.selectedFiles.push(item)
    //     }
    //   }
    // },
    onToggleCollapse(collapsed) {
      this.$store.commit('setCollapased', !collapsed)
    }
  }
}
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
