<template>
  <span style="text-align: left; margin-left: 10px;">
    <el-button
      class="search-button btn-icon-class"
      size="small"
      @click="visible.addSrcVisible = !visible.addSrcVisible">
      <span>
        <img
          style="width: 16px; height: 16px; margin-right: 5px"
          src="../assets/icon_add_file.svg"/>
        从素材库添加文件
      </span>
    </el-button>
    <el-dialog :modal-append-to-body="true"
               :visible="visible.addSrcVisible"
               title="请选择目录"
               @close="handleClickClose"
               @opened="handleDialogOpened">
      <div>
        <span>
          <span style=" color:#1f1731;font-size: 15px;cursor:pointer;"
                @click="handleListLenovoDir('/营销素材展示','ent')">首页</span>
          <span v-for="(item,index) in dir.currentPath"
                v-if="item !== '营销素材展示'"
                style="display: inline">/
            <span style=" color:#1f1731;font-size: 15px;cursor:pointer;"
                  @click="handleClickDirPath(item,index)">{{ item }}</span>
          </span>
        </span>
        <el-button v-show="multipleSelection.length > 0"
                   style="margin: 0 20px"
                   type="primary"
                   @click="handleSelect">选择</el-button>
      </div>
      <div>
        <el-table v-loading="dir.loadingDir"
                  :data="dir.tableData"
                  empty-text="没有可选目录啦!"
                  height="400"
                  @selection-change="handleSelectionChange"
                  @row-click="handleClickItem">

          <el-table-column label="路径">
            <template slot-scope="scope">
              <i v-if="scope.row.is_dir"
                 class="el-icon-folder-opened"></i>
              <i v-else-if="scope.row.mime_type.startsWith('video')"
                 class="el-icon-video-camera"></i>
              <img v-else-if="scope.row.mime_type.startsWith('image')"
                   :onerror="defaultImg"
                   :preview-text="scope.row.path"
                   :src="genSrcPreviewUrl(scope.row.neid)"
                   preview="add_src_private_dir_image_list"
                   style="width: 60px;height: 60px;line-height: 0px">
              <i v-else-if="scope.row.mime_type.startsWith('doc')"
                 class="el-icon-tickets"></i>
              <i v-else-if="scope.row.mime_type.startsWith('word')"
                 class="el-icon-link"></i>
              <i v-else
                 class="el-icon-question"></i>
              <span style="line-height: 30px">{{ genFileName(scope.row.path) }}</span>
            </template>
          </el-table-column>
          <el-table-column :selectable="selectInit"
                           style=""
                           type="selection"
                           width="55"> </el-table-column>
          <!--              <el-table-column label="操作" width="80" align="center">-->
          <!--                <template slot-scope="scope">-->
          <!--                    <div v-if="scope.row.is_dir || scope.row.mime_type.startsWith('word')">-</div>-->
          <!--                    <el-button v-else @click.stop="handleSelectSrc(scope.row)">选择</el-button>-->
          <!--                </template>-->
          <!--              </el-table-column>-->
        </el-table>
      </div>
    </el-dialog>
  </span>
</template>

<script>

import { batchNewPrivateDirSrc, ftsSearch, getFileMetadata, newPrivateDirSrc } from '@/api'
import LenovoDirSelector from '@/components/LenovoDirSelector'
import { filterDirList, genFileName } from '@/utils/JoyeaUtil'
import genSrcPreviewUrl from '@/utils'

export default {
  name: 'AddSrcToPrivateDir',
  components: {
    LenovoDirSelector
  },
  props: ['curDirNeid'],
  data () {
    return {
      defaultImg: 'this.src="' + require('@assets/error.png') + '"', // 默认图地址
      dir: {
        currentPathNeid: '',
        currentPath: [],
        tableData: [],
        loadingDir: false
      },
      visible: {
        addSrcVisible: false
      },
      multipleSelection: []
    }
  },
  methods: {
    handleSelect () {
      batchNewPrivateDirSrc(this.curDirNeid, this.multipleSelection.map(item => item.path)).then(resp => {
        if (resp.code === '0') {
          this.visible.addSrcVisible = false
          this.$message.success('批量添加文件成功！')
          this.$emit('onAddSuccess')
        } else {
          this.$message.error('添加文件失败: ' + resp.msg)
        }
      })
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
    },
    selectInit (row, index) {
      return !row.is_dir && !row.mime_type.startsWith('word')
    },
    handleSelectSrc (item) {
      newPrivateDirSrc(this.curDirNeid, item.path).then(resp => {
        if (resp.code === '0') {
          this.visible.addSrcVisible = false
          this.$message.success('添加文件成功！')
          this.$emit('onAddSuccess')
        } else {
          this.$message.error('添加文件失败: ' + resp.msg)
        }
      })
    },
    genFileName,
    filterDirList,
    genSrcPreviewUrl,
    handleClickDirPath (item, index) {
      let toReachPath = ''
      for (let i = 0; i <= index; i++) {
        toReachPath = toReachPath + '/' + this.dir.currentPath[i]
      }
      this.handleListLenovoDir(toReachPath, 'ent')
    },
    handleSelectDir () {
      this.$emit('selectDirPath', {
        neid: this.dir.currentPathNeid,
        path: this.dir.currentPath
      })
    },
    handleClickClose () {
      this.dir.tableData = []
      this.visible.addSrcVisible = false
    },
    handleClickItem (item) {
      if (item.is_dir) {
        this.handleListLenovoDir(item.path, 'ent')
      } else {
        this.$emit('preview', item)
      }
    },
    handleListLenovoDir (path) {
      this.dir.loadingDir = true
      getFileMetadata('LENOVO', path, '').then(response => {
        if (response.code === '0') {
          this.currentTypeActive = 0
          this.dir.tableData = []
          if (response.obj.content) {
            response.obj.content.forEach(item => {
              this.dir.tableData.push(item)
            })
            if (this.isDir) {
              this.dir.tableData = filterDirList(this.dir.tableData)
            }
            this.dir.currentPath = []
            this.dir.currentPathNeid = response.obj.neid
            response.obj.path.split('/').forEach(item => {
              if (item.length !== 0) {
                this.dir.currentPath.push(item)
              }
            })
          }
          this.multipleSelection = []
        } else {
          console.log('文件夹列表获取失败' + response.msg)
        }
        this.dir.loadingDir = false
      })
    },
    handleDialogOpened () {
      this.handleListLenovoDir('/营销素材展示', 'ent')
    }
  }
}
</script>

<style scoped lang="scss">
.el-button {
    border-radius: 0;
    border: none;
    font-size: 16px;
}
</style>
