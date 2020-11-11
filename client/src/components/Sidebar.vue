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
  readonly row: CsvRow
  constructor(row: CsvRow) {
    this.row = row
  }
}

type CsvRow = State['contentMetadatas']['']['data'][''] & {
  sha: string
  // isLast: true
}
interface InterMediateFiles {
  [key: string]: CsvItem | InterMediateFiles
}

// const files = InterMediateFiles['前期定期']['数学']['テスト']['2019']

interface FilePathData {
  period: string
  subj: string
  toolType: string
  year: string
  filename: string
}

interface LastOfDataTree {
  title: string
  icon: string
  data: FilePathData
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
      data: FilePathData
    }
  | {
      expand: boolean
      icon: string
      isLast: true
      title: string
      data: FilePathData
    }

type GenerateMenuStructure = (
  intermediate: InterMediateFiles,
  num: number
) => GenerateMenuStructurePattern[]

type SidebarHeader = {
  header: true
  title: string
  hiddenOnCollapse: boolean
}

type SidebarTree = (SidebarHeader | GenerateMenuStructurePattern)[]
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

    fileMetadataTree(): InterMediateFiles {
      const files = Object.entries(this.currentBranchMetadatas.data)
      const beforeMerge = files.map(([filename, file]) => {
        const { period, subj, tool_type: toolType, year } = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            value === '' ? '不明' : value
          ])
        )

        // if ([period, subj, toolType, year].find(el => el === `不明`)) {
        //   return this.unvaluedFileMetadataTree(filename, file)
        // }

        const fileResult = {
          [period]: {
            [subj]: {
              [toolType]: {
                [year]: {
                  [filename]: new CsvItem(file)
                }
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

    intermediateFiles(): InterMediateFiles {
      const files = Object.entries(this.currentBranchMetadatas.data)
      const beforeMerge = files.map(([, file]) => {
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
                [year]: new CsvItem(file)
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
      const result = generateMenuStructure(
        this.intermediateFiles,
        { period: '', subj: '', toolType: '', year: '', filename: '' },
        'period'
      )
      return result

      function getNextProperty(currentProperty: string): string {
        const propertyArr = ['period', 'subj', 'toolType', 'year', 'filename']
        const index = propertyArr.findIndex(el => el === currentProperty)

        return propertyArr[index + 1]
      }

      function generateMenuStructure(
        intermediate: InterMediateFiles,
        data: FilePathData,
        property: string
      ): GenerateMenuStructurePattern[] {
        return Object.entries(intermediate).map(([filename, value]) => {
          if (value instanceof CsvItem) {
            return {
              title: filename,
              icon: 'fas fa-circle',
              data: { ...data, [property]: filename },
              isLast: true,
              expand: false
            }
          }

          return {
            title: filename,
            icon,
            child: generateMenuStructure(
              value,
              { ...data, [property]: filename },
              getNextProperty(property)
            ),
            isLast: false,
            expand: false,
            // data: { ...data, [value.property]: filename }
            data: { ...data, [property]: filename }
          }
        })
      }
    },

    sidebarMenu(): SidebarTree {
      const header: SidebarHeader = {
        header: true,
        title: `Branch : ${this.$store.state.currentBranch}`,
        hiddenOnCollapse: true
      }

      return [header, ...this.menuStructure]
    }
  },

  methods: {
    // async unvaluedFileMetadataTree(filename:string, file):Promise<InterMediateFiles> {
    //     const { period, subj, tool_type: toolType, year } = Object.fromEntries(
    //       Object.entries(file).map(([key, value]) => [
    //         key,
    //         value === '' ? '不明' : value
    //       ])
    //     )

    //     await this.$store.dispatch('getTimeStamp',file)

    //     const lastCommitYear = this.$store.state.timeStamp[filename]
    //     const lastCommitMonth = this.$store.state.timeStamp[filename]

    //     return {
    //       '不明': {
    //         [lastCommitYear]:{
    //           [lastCommitMonth]: new CsvItem(file)
    //         }
    //       }
    //     }
    // }

    onItemClick(e: any, item: LastOfDataTree): void {
      // データツリーの末端フォルダ(年度)をクリックしたときに処理を行う
      if (item.isLast) {
        const tree = this.fileMetadataTree
        if (tree instanceof CsvItem) {
          throw new Error()
        }
        const periodTree = tree[item.data.period]

        if (periodTree instanceof CsvItem) {
          throw new Error()
        }

        const subjTree = periodTree[item.data.subj]
        if (subjTree instanceof CsvItem) {
          throw new Error()
        }

        const toolTypeTree = subjTree[item.data.toolType]
        if (toolTypeTree instanceof CsvItem) {
          throw new Error()
        }

        const yearTree = toolTypeTree[item.data.year]
        if (yearTree instanceof CsvItem) {
          throw new Error()
        }

        const files = yearTree

        Object.values(files).forEach(file => {
          if (!(file instanceof CsvItem)) {
            return
          }
          const fileSha = file.row.sha
          this.$store.dispatch('getImageDatas', fileSha)
        })

        const changedFilesBase = Object.entries(files).reduce(
          (result, [filename, file]) => {
            result = { ...result, [filename]: file.row }
            return result
          },
          {}
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
