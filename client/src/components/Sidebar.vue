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
// import { mapGetters } from 'vuex'
import { SidebarMenu } from 'vue-sidebar-menu'

import Vue from 'vue'
import { GetterValues } from '../store/getters'
import { StateTypedVueConstructor } from '../extended'
import { State } from '../store/state'

interface InterMediateFilesOld {
  [period: string]: {
    [subj: string]: {
      [toolType: string]: {
        [year: string]: {
          [filename: string]: State['contentMetadatas']['']['data'][''] & {
            sha: string
          }
        }
      }
    }
  }
}

type CsvRow = State['contentMetadatas']['']['data'][''] & {
  sha: string
  isLast: true
}
interface InterMediateFiles {
  [key: string]: CsvRow | InterMediateFiles
}

function isCsvRow(x: InterMediateFiles['']): asserts x is CsvRow {
  // (仮)
  if (typeof x?.src === 'string') {
    throw new Error()
  }
}

function isInterMediateFiles(
  x: InterMediateFiles['']
): asserts x is InterMediateFiles {
  // (仮)
  if (typeof x?.src !== 'string') {
    throw new Error()
  }
}

type GenerateMenuStructurePattern =
  | {
      child: GenerateMenuStructurePattern[]
      expand: boolean
      icon: string
      isEndOfFolder: false
      title: string
    }
  | {
      expand: boolean
      icon: string
      isEndOfFolder: true
      title: string
      data: State['contentMetadatas']['']['data']['']
    }

type GenerateMenuStructure = (
  intermediate: InterMediateFiles,
  num: number
) => GenerateMenuStructurePattern[]

export default (Vue as StateTypedVueConstructor).extend({
  name: 'Sidebar',
  components: {
    SidebarMenu
  },

  computed: {
    // ...mapGetters(['currentBranchMetadatas']),
    currentBranchMetadatas(): GetterValues['currentBranchMetadatas'] {
      return this.$store.getters.currentBranchMetadatas
    },

    intermediateFiles(): InterMediateFiles {
      const files = Object.entries(this.currentBranchMetadatas.data)
      const beforeMerge = files.map(([filename, file]) => {
        const {
          period,
          subj,
          // eslint-disable-next-line camelcase
          tool_type,
          year
        } = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            value === '' ? '不明' : value
          ])
        )

        const fileResult = {
          [period]: {
            [subj]: {
              [tool_type]: {
                [year]: { [filename]: file }
              }
            }
          }
        }
        return fileResult
      })
      const result = merge.all<InterMediateFiles>(beforeMerge)
      return result
    },

    menuStructure() {
      const icon = 'fa fa-folder'
      const result = generateMenuStructure(this.intermediateFiles, 4)
      return result

      function generateMenuStructure(
        intermediate: InterMediateFiles,
        num: number
      ): GenerateMenuStructurePattern[] {
        if (num === 1) {
          const result: GenerateMenuStructurePattern[] = Object.entries(
            intermediate
          ).map(([key, file]) => {
            isCsvRow(file)
            return {
              title: key,
              icon: 'fas fa-circle',
              data: file,
              isEndOfFolder: true,
              expand: false
            }
          })
          return result
        }

        return Object.entries(intermediate).reduce((previous, [key, value]) => {
          isInterMediateFiles(value)
          return [
            ...previous,
            {
              title: key,
              icon,
              child: generateMenuStructure(value, num - 1),
              isEndOfFolder: false,
              expand: false
            }
          ]
        }, [] as GenerateMenuStructurePattern[])
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
      // データツリーの末端フォルダ(年度)をクリックしたときに処理を行う
      if (item.isEndOfFolder && !item.expand) {
        const fileSha = item.data.sha
        this.$store.dispatch('getImageDatas', fileSha)
        // const changedFilesBase = Object.fromEntries(
        //   item.child.map((file: any) => {
        //     return [file.data.src, file.data]
        //   })
        // )

        const changedFilesBase = { [item.src]: item.data }
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
