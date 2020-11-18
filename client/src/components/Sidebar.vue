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
        const requiredFileValue = {
          period: file.period,
          subj: file.subj,
          toolType: file.tool_type,
          year: file.year,
          contentType: file.content_type
        }
        const isUnvalue = Object.values(requiredFileValue).includes('')

        const { period, subj, tool_type: toolType, year } = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            isUnvalue ? '不明' : value
          ])
        )
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
        const requiredFileValue = {
          period: file.period,
          subj: file.subj,
          toolType: file.tool_type,
          year: file.year,
          contentType: file.content_type
        }
        const isUnvalue =
          Object.values(requiredFileValue).includes('') ||
          file.csvFile === 'unassorted.csv'
        const { period, subj, tool_type: toolType, year } = Object.fromEntries(
          Object.entries(file).map(([key, value]) => [
            key,
            isUnvalue ? '不明' : value
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
    onItemClick(e: any, item: LastOfDataTree): void {
      // データツリーの末端フォルダ(年度)をクリックしたときに処理を行う
      if (item.isLast) {
        const tree = this.fileMetadataTree
        if (tree instanceof CsvItem) {
          throw new Error('tree instanceof CsvItem')
        }
        const periodTree = tree[item.data.period]

        if (periodTree instanceof CsvItem) {
          throw new Error('periodTree instanceof CsvItem')
        }

        const subjTree = periodTree[item.data.subj]
        if (subjTree instanceof CsvItem) {
          throw new Error('subjTree instanceof CsvItem')
        }

        const toolTypeTree = subjTree[item.data.toolType]
        if (toolTypeTree instanceof CsvItem) {
          throw new Error('toolTypeTree instanceof CsvItem')
        }

        const yearTree = toolTypeTree[item.data.year]
        if (yearTree instanceof CsvItem) {
          throw new Error('yearTree instanceof CsvItem')
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
          (result, [filename, file], i) => {
            result = {
              ...result,
              [filename]: { ...file.row, image_index: `${i + 1}` }
            }
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
