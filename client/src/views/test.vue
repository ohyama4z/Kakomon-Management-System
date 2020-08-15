<template>
  <div class="container">
    <button v-on:click="updateState()"> updateState </button>
    <div v-if="status === 'loading'">NOW LOADING</div>
    <div v-else>{{state}}</div>
  </div>
</template>
 
<script>
export default {
  name: 'test',
  data() {
    return {
      state: null
    }
  },
  computed: {
    sidebarMenu () {
      return this.header.concat(this.getMenuStructure)
    },
    intermediateFiles () {
      return this.$store.state.sampleFiles.reduce((previous, current) => {
        if (previous == null) {
          previous = {}
        }

        if (previous[current.year] == null) {
          previous[current.year] = {}
        }

        if (previous[current.year][current.subject] == null) {
          previous[current.year][current.subject] = {}
        }

        if (previous[current.year][current.subject][current.period] == null) {
          previous[current.year][current.subject][current.period] = []
        }

        previous[current.year][current.subject][current.period].push(current)

        return previous
      }, {})
    },
    getMenuStructure () {
      const icon = 'fa fa-folder'
      return Object.entries(this.intermediateFiles).reduce((previous, [year, value]) => {
        previous.push({
          title: year,
          icon,
          child: generateChildOfYear(value)
        })
        return previous
      }, [])

      function generateChildOfYear(yearValue) {
        return Object.entries(yearValue).reduce((previous, [subject, subjectValue]) => {
          previous.push({
            title: subject,
            icon,
            child: generateChildOfSubject(subjectValue)
          })
          return previous
        }, [])
      }

      function generateChildOfSubject(subjectValue) {
        return Object.entries(subjectValue).reduce((previous, [period, periodValue]) => {
          previous.push({
            title: period,
            icon,
            child: generateChildOfPeriod(periodValue)
          })
          return previous
        }, [])
      }

      function generateChildOfPeriod(periodValue) {
        return periodValue.map(file => file.fileName)
      }
    }
  },
}
</script>
 
<style>
@import url('https://use.fontawesome.com/releases/v5.6.1/css/all.css');
 
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 15px;
}
</style>