<template>
  <div class="container">
    <sidebar-menu :menu="sidebarMenu" />
  </div>
</template>
 
<script>
export default {
  name: 'test',
  data() {
    return {
      isOpened: false,
      header: [{
        header: true,
        title: '過去問管理',
        hiddenOnCollapse: true
      }],
      menu: [{
              title: '名前なし',
              icon: this.isOpened ? 'fa fa-folder-open' : 'fa fa-folder',
              child: [
            {
              title: 'file001',
              icon: 'fa fa-file',
            }
          ]
        },
        {
          title: '名前あり',
          icon: this.isOpened ? 'fa fa-folder-open' : 'fa fa-folder',
          child: [
            {
                title: '英語',
                icon: this.isOpened ? 'fa fa-folder-open' : 'fa fa-folder',
              child: [
                {
                  title: 'file002',
                  icon: 'fa fa-file',
                }
              ]
            },
            {
              title: '数学',
              icon: this.isOpened ? 'fa fa-folder-open' : 'fa fa-folder',
            }
          ]
        }
      ]
    }
  },
  computed: {
    sidebarMenu () {
      return this.header.concat(this.menu)
    }
  }
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