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

class CsvItem {
  readonly files: { [filename: string]: CsvRow }
  constructor(files: { [filename: string]: CsvRow }) {
    this.files = files
  }
}

type CsvRow = State['contentMetadatas']['']['data'][''] & {
  sha: string
  // isLast: true
}
interface InterMediateFiles {
  [key: string]: CsvItem | InterMediateFiles
}

interface LastOfDataTree {
  title: string
  icon: string
  data: CsvRow
  isLast: true
  expand: boolean
}

type GenerateMenuStructurePattern =
  | {
      child: GenerateMenuStructurePattern[]
      expand: boolean
      icon: string
      isLast: false
      title: string
    }
  | {
      expand: boolean
      icon: string
      isLast: true
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
        const { period, subj, tool_type: toolType, year } = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            value === '' ? '不明' : value
          ])
        )

        const fileResult = {
          [period]: {
            [subj]: {
              [toolType]: {
                [year]: new CsvItem({ [filename]: file })
              }
            }
          }
        }
        return fileResult
      })
      const result = merge.all<InterMediateFiles>(beforeMerge, {
        isMergeableObject: obj =>
          typeof obj === `object` && !(obj instanceof CsvItem)
      })
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
        return Object.entries(intermediate).map(([filename, value]) => {
          if (value instanceof CsvItem) {
            return {
              title: filename,
              icon: 'fas fa-circle',
              data: value.files,
              isLast: true,
              expand: false
            }
          }

          return {
            title: filename,
            icon,
            child: generateMenuStructure(value, num - 1),
            isLast: false,
            expand: false
          }
        })
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
    onItemClick(e: any, item: LastOfDataTree): void {
      // データツリーの末端フォルダ(年度)をクリックしたときに処理を行う
      console.log(item)
      if (item.isLast) {
        Object.values(item.data).map(file => {
          const fileSha = file.sha
          this.$store.dispatch('getImageDatas', fileSha)
        })

        const changedFilesBase = item.reduce((result, curFile) => {
          result = { ...result, [curFile.src]: curFile }
          return result
        }, {})
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
