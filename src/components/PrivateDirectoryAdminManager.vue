<template>
<span>
    <div class="block">

      <div v-if="!editable">
        <div v-for="item in value" :key="item[0] + '/' + item[1]">
            <el-tag  size="mini" type="info" effect="dark" style="background-color: #f4f4f5;border-color: #f4f4f5;color: #909399">
          {{
                    item[0] + '/' + getNameById(item[1])
                }}
        </el-tag>
        </div>
      </div>
      <el-cascader v-else v-model="value" placeholder="请搜索添加文件管理员" size="small"
                   :options="options" :disabled="!editable" @click.stop="console.log('123')"
                   :props="{ multiple: true }" filterable></el-cascader>
    </div>
</span>
</template>

<script>

import { listJoyeaUser, updatePrivateDirectoryAdmin } from '@/api'

export default {
  name: 'PrivateDirectoryAdminManager',
  props: ['fileItem', 'enabled', 'editable'],
  data () {
    return {
      value: [],
      options: [],
      allUser: []
      // editable: false
    }
  },
  methods: {
      getNameById(id){
          const  targetUser = this.allUser.filter(user => {
              return user.id === id
          })[0];
          if(targetUser) {
              return targetUser.joyeaName
          }else{
              return "";
          }
      },
    handleSave () {
      // if (!this.editable) {
      //     this.editable = true;
      // } else {
      let adminArr = []
      this.value.forEach(item => {
        adminArr.push(item[1])
      })
      updatePrivateDirectoryAdmin(this.fileItem.neid, adminArr).then(resp => {
        if (resp.code === '0') {
          this.$message.success('保存成功！')
          this.editable = false
        } else {
          this.$message.error('保存失败：' + resp.msg)
        }
      })
      // }
    },
    handleReset () {
      this.editable = false
    },
    handleGetAllAdmin () {
      if (!this.fileItem.adminUser) {
        this.fileItem.adminUser = []
      }
      this.fileItem.adminUser.forEach(item => {
        let tmpResult = []
        tmpResult.push(item.department)
        tmpResult.push(item.id)
        this.value.push(tmpResult)
      })
      console.log('admin user:' + JSON.stringify(this.value))
    },
    handleListAllUser () {
      let department = {}
      let _this = this
      listJoyeaUser().then(resp => {
        this.allUser = resp.list
        resp.list.forEach(item => {
          if (!department[item.department]) {
            department[item.department] = []
          }
          department[item.department].push({
            value: item.id,
            label: item.joyeaName,
          })
        })
        Object.keys(department).forEach(function (key) {
          _this.options.push({
            value: key,
            label: key,
            children: department[key]
          })
        })
      })
    },
  },
  created () {
    this.handleGetAllAdmin()
    this.handleListAllUser()
  },
  mounted () {
    this.$nextTick(() => {
      let dom = document.querySelectorAll('.el-cascader .el-input__inner')
      dom.forEach(item => {
        item.style.backgroundColor = 'transparent'
      })
    })
  }
}
</script>

<style scoped>

</style>
