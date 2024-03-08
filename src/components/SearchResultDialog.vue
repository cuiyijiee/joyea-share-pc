<template>
  <div>
    <el-dialog :close-on-click-modal="false"
               :close-on-press-escape="false"
               :title="'【' + search.keyword + '】的搜索结果'"
               :visible.sync="visible.searchDialogVisible"
               class="search-dialog"
               @close="">
      <template slot="title">
        <span style="font-size: 16px">{{'【 ' + search.keyword + ' 】的搜索结果'}}</span>
<!--        <span style="margin-left: 20px;font-size: 12px;color: #BBBBBB">{{'共有' + search.keyword + '个内容'}}</span>-->
      </template>
      <el-tabs v-model="search.resultShowType" class="search-result-type-switch"
               tab-position="top" @tab-click="handleFilterSearchResult">
        <el-tab-pane key="0" label="全部"></el-tab-pane>
        <el-tab-pane key="1" label="文件夹"></el-tab-pane>
        <el-tab-pane key="2" label="文档"></el-tab-pane>
        <el-tab-pane key="3" label="图片"></el-tab-pane>
        <el-tab-pane key="4" label="视频"></el-tab-pane>
      </el-tabs>
      <!--            <div v-loading="loading.searchMore" class="search-result-content">-->
      <div class="search-result-content">
        <div class="function-block">
          <el-button icon="iconfont el-icon-a-icon_addtolist" size="mini" type="primary"
                     @click="handleBatchAddToList">加入清单
          </el-button>
          <el-button icon="iconfont el-icon-a-icon_addtomarketsegments" :disabled="directoryType!=='SELF'"
                     size="mini" type="primary" @click="handleBatchAddToPrivate">加入细分市场
          </el-button>
          <span class="function-block-sort">
            <el-popover
                placement="bottom-end"
                trigger="click">
              <div class="sort-item" @click="handleSortTypeSelected(0)">
                <i class="iconfont el-icon-icon_right sort-icon"
                   :style="{visibility : sortType === 0 ? 'visible' : 'hidden'}"></i>匹配度排序</div>
              <div class="sort-item" @click="handleSortTypeSelected(1)">
                <i class="iconfont el-icon-icon_right sort-icon"
                   :style="{visibility : sortType === 1 ? 'visible' : 'hidden'}"></i>名称排序</div>
              <div v-if="sortType === 1">
                <el-divider></el-divider>
                <div class="sort-item" @click="handleSortOrderSelected(0)">
                  <i class="iconfont el-icon-icon_right sort-icon"
                     :style="{visibility : sortOrder === 0 ? 'visible' : 'hidden'}"></i>升序</div>
                <div class="sort-item" @click="handleSortOrderSelected(1)">
                  <i class="iconfont el-icon-icon_right sort-icon"
                     :style="{visibility : sortOrder === 1 ? 'visible' : 'hidden'}"></i>降序</div>
              </div>
              <el-button slot="reference" size="mini"
                         icon="iconfont el-icon-icon_sort">排序</el-button>
            </el-popover>
            <el-button v-if="search.resultShowType === '3'"
                size="mini"
                       style="margin-left: 10px"
                       @click="isListMode = !isListMode"
                       :icon="isListMode ? 'iconfont el-icon-a-icon_thumbnailmode' : 'iconfont el-icon-a-icon_listmode'">
              {{ isListMode ? "大图模式" : "列表模式" }}
            </el-button>
          </span>
        </div>
        <el-table v-if="isListMode || search.resultShowType !== '3'"
            v-loading="loading.search" :data="searchResult" @selection-change="handleSelectionChange"
                  empty-text="暂没有搜索数据" height="500" class="better-scroll" style="width: 100%"
                  ref="multipleTable">
          <!--多选框，屏蔽文件夹，使其不可选中-->
          <el-table-column type="selection" width="55"
                           :selectable="(row) => {return !row.is_dir}"></el-table-column>
          <el-table-column label="文件名" show-overflow-tooltip>
            <template v-slot="scope">
              <div class="flex">
                  <span class="file-icon">
                    <i v-if="scope.row.is_dir" class="iconfont-color icon-icon_folder"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('doc')"
                       class="iconfont-color icon-icon_file"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('image')"
                       class="iconfont-color icon-icon_pic"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('video')"
                       class="iconfont-color icon-icon_vedio"></i>
                    <i v-else class="el-icon-question"></i>
                  </span>
                <span class="file-name" @click="handleGoToPreview(scope.row)">
                                        {{ scope.row.path.substr(scope.row.path.lastIndexOf("/") + 1) }}
                                    </span>
              </div>
              <div v-if="scope.row.desc" class="file-desc">
                <el-tag v-for="(tag,index) in scope.row.desc.split(' ')" size="mini"
                        style="margin-right: 2px;" :key="index"
                        type="info">{{ tag.replace(markReg, "") }}
                </el-tag>
              </div>
              <div v-else-if="scope.row.tags">
                <el-tag v-for="(tag,index) in scope.row.tags"
                        size="mini"
                        style="margin-right: 2px"
                        :key="index"
                        type="info">{{ tag.name.replace(markReg, '') }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="预览" width="150">
            <template v-slot="scope">
              <el-image v-if="scope.row.mime_type && scope.row.mime_type.startsWith('image')"
                        :onerror="defaultImg"
                        @click="handleGoToPreview(scope.row)"
                        :src="genPreviewUrl(scope.row.neid)"
                        class="preview_img"
                        style="height: 50px;width: 67px">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column label="文件类型" width="220">
            <template v-slot="scope">
              <div>
                <span class="file-type-show">
                    {{ formatFileShowType(scope.row) }}
                </span>
                <span class="file-type-hide">
                  <el-tooltip v-if="scope.row.is_dir" :open-delay="defaultOpenDelay" placement="top">
                    <div slot="content">跳转至文件所在位置</div>
                    <el-icon
                        class="iconfont el-icon-a-icon_jumptothelocation file-type-icon"
                        @click.native="handleGotoDir(scope.row)"></el-icon>
                  </el-tooltip>
                  <el-tooltip
                      v-if="scope.row.is_dir"
                      :open-delay="defaultOpenDelay" placement="top">
                    <div slot="content">获取短链</div>
                    <el-icon class="iconfont el-icon-a-icon_getshortchain file-type-icon"
                             @click.native="handleGetCurRedirectPath(scope.row)"></el-icon>
                  </el-tooltip>
                  <el-tooltip v-if="directoryType === 'LENOVO' && !scope.row.is_dir"
                              :open-delay="defaultOpenDelay"
                              placement="top">
                    <div slot="content">加入清单</div>
                    <el-icon class="iconfont el-icon-a-icon_addtolist file-type-icon"
                             @click.native="handleAdd(scope.row)"></el-icon>
                  </el-tooltip>

                  <el-tooltip v-if="directoryType === 'SELF' && !scope.row.is_dir"
                              :open-delay="defaultOpenDelay"
                              placement="top">
                    <div slot="content">加入细分市场</div>
                    <el-icon class="iconfont el-icon-a-icon_addtomarketsegments file-type-icon"
                             @click.native="handleAddSrcToPrivateDir(scope.row)"></el-icon>
                  </el-tooltip>
                  <el-tooltip v-if="!scope.row.is_dir && !scope.row.mime_type.startsWith('word')"
                              :open-delay="defaultOpenDelay"
                              placement="top">
                    <div slot="content">下载</div>
                    <el-icon class="iconfont el-icon-icon_xiazailiebiao_20_20px file-type-icon"
                             @click.native="handleDownload(scope.row)"></el-icon>
                  </el-tooltip>
                </span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="引用次数" width="100">
            <template v-slot="scope">
              <span>{{ scope.row.is_dir ? '-' : scope.row.ref_num }}</span>
            </template>
          </el-table-column>
          <el-table-column label="下载次数" width="100">
            <template v-slot="scope">
              <span>{{ scope.row.is_dir ? '-' : scope.row.download_num }}</span>
            </template>
          </el-table-column>
        </el-table>
        <div v-else
             class="better-scroll"
             style="overflow: auto;height: 500px">
          <div v-if="largeImgSearchResult.length"
               class="large-img-mode-box">
            <div class="large-img-item"
                 v-for="(item,index) in largeImgSearchResult"
                 :key="item.neid">
              <el-checkbox
                  @change="handleSelectedLargeImg(item)"
                  :value="largeImgSelected.includes(item.neid)"/>
              <img @click="handleAdd(item,true)"
                   src="../assets/icon_add_hover.svg"
                   style="width: 22px; height: 22px"/>
              <el-image style="height: 130px"
                  :onerror="defaultImg" fit="cover"
                  :preview-src-list="[].concat(genPreviewUrl(item.neid))"
                  :src="genPreviewUrl(item.neid)">
              </el-image>
              <div style="font-size: 11px; color: #000000;text-align: left">{{ item.filename.replace(markReg, "") }}</div>
            </div>
          </div>
          <el-empty v-else
                    description="暂无数据"></el-empty>
        </div>
        <el-button type="primary" size="small" plain :disabled="!search.hasNext"
                   class="search-result-page-switch" @click="handleStartSearch">
                    <span v-show="loading.searchMore" class="rotate_bg">
                        <i class="iconfont el-icon-icon_loading rotateImages"></i></span>
          <span style="font-size: 16px;line-height: 1">{{ loading.searchMore ? "加载中" : "加载更多" }}</span>
        </el-button>
      </div>
    </el-dialog>
    <el-image-viewer
        v-if="imageViewVisible" :initial-index="imageIndex"
        :on-close="()=>{imageViewVisible = false}"
        :url-list="imageViewUrl" :z-index=9999></el-image-viewer>
    <video-preview-dialog ref="VideoPreviewDialog"></video-preview-dialog>
  </div>
</template>

<script>

import { addRedirectPath, ftsSearch, queryFileAlready } from '@/api'
import genSrcPreviewSrc, {formatFileShowType} from '@/utils'
import VideoPreviewDialog from '@/components/VideoPreviewDialog'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
  name: 'SearchResultDialog',
  components: {
    VideoPreviewDialog,
    ElImageViewer
  },
  props: {
    directoryType: {
      default: '',
      type: String
    }
  },
  data() {
    return {
      defaultOpenDelay: 1000,
      imageViewVisible: false,
      imageIndex: 0,
      imageViewUrl: [],
      markReg: /<mark>|<\/mark>/g,
      search: {
        type: '',
        keyword: '',
        hasNext: false,
        nextOffset: 0,
        realOrderType: '0',

        currentIndex: 0,
        defaultLimit: 30,
        resultShowType: '0'
      },
      searchResult: [],
      largeImgSearchResult:[],
      largeImgSelected: [],
      largeImgs: [],
      visible: {
        searchDialogVisible: false
      },
      loading: {
        searchMore: false
      },
      defaultImg: 'this.src="' + require('@assets/error.png') + '"', // 默认图地址
      multipleSelection: [],
      sortType: 0,
      sortOrder: 0,
      isListMode: true
    }
  },
  methods: {
    formatFileShowType,
    handleSelectedLargeImg(data){
      if (!this.largeImgSelected.includes(data.neid)) {
        this.largeImgSelected.push(data.neid)
        this.largeImgs.push(data)
      } else {
        const index = this.largeImgSelected.indexOf(data.neid)
        this.largeImgSelected.splice(index, 1)
        this.largeImgs.splice(index, 1)
      }
    },
    handleGoToPreview(fileItem) {
      if (fileItem.is_dir) {
        this.handleGotoDir(fileItem)
      } else if (fileItem.mime_type && fileItem.mime_type.startsWith('video')) {
        this.$refs.VideoPreviewDialog.playVideo(fileItem)
      } else if (fileItem.mime_type && fileItem.mime_type.startsWith('image')) {
        let imageFileItemNeid = this.searchResult.filter(fileItem => {
          return !fileItem.is_dir && fileItem.mime_type.startsWith('image')
        }).map(fileItem => {
          return fileItem.neid;
        });
        let currentClickItemIndex = imageFileItemNeid.indexOf(fileItem.neid);
        this.imageViewUrl = imageFileItemNeid.map(fileItemNeid => {
          return genSrcPreviewSrc(fileItemNeid);
        })
        this.imageIndex = currentClickItemIndex;
        this.imageViewVisible = true
      } else if (fileItem.mime_type.startsWith('doc')) {
        window.open(genSrcPreviewSrc(fileItem.neid))
      } else {
        this.$message.error('暂不支持的预览类型！')
      }
    },
    handleGotoDir(fileItem) {
      this.visible.searchDialogVisible = false
      this.$emit('goToDir', fileItem)
    },
    handleGetCurRedirectPath(fileItem) {
      const _this = this
      let currentFullPath = fileItem.path
      if (currentFullPath.length === 0 && this.directoryType === 'SELF') {
        currentFullPath = '/'
      }
      addRedirectPath(currentFullPath, this.directoryType).then(resp => {
        const redirectPath = window.location.protocol + '//' +
            window.location.host + '/api/redirectPath?id=' + resp.id
        const input = document.createElement('input')
        input.value = redirectPath
        document.body.appendChild(input)
        input.select()
        input.setSelectionRange(0, input.value.length)
        document.execCommand('Copy')
        document.body.removeChild(input)
        _this.$message.success('获取成功，已复制到剪贴板！')
      })
    },
    genPreviewUrl(neid) {
      return genSrcPreviewSrc(neid)
    },
    handleAdd(fileItem) {
      this.$emit('handleAdd', fileItem)
    },
    handleAddSrcToPrivateDir(fileItem) {
      this.$emit('addSrcToPrivateDir', fileItem)
    },
    handleDownload(row){
      queryFileAlready(row.neid).then(response => {
        if (response.obj) {
          window.open(window.location.protocol + "//" + window.location.host + "/apiv2/download/file/download?neid=" + row.neid);
        } else {
          this.$message.warning("文件正在同步中，请稍候重试！");
        }
      })
    },
    handleStartSearch() {
      this.loading.searchMore = true

      if (this.sortType === 0) {
        this.search.realOrderType = '0'
      } else if (this.sortType === 1) {
        if (this.sortOrder === 0) {
          this.search.realOrderType = '1'
        } else if (this.sortOrder === 1) {
          this.search.realOrderType = '2'
        }
      }
      ftsSearch(this.search.keyword, this.search.nextOffset, this.search.defaultLimit,
          this.search.resultShowType, this.search.realOrderType).then(response => {
        if (response.code === '0') {
          this.search.hasNext = response.obj.has_more
          this.search.nextOffset = response.obj.next_offset
          response.obj.content.forEach(item => {
            item.joyeaDesc = '';
            item.isModify = false;
            this.searchResult.push(item);
            if (item.mime_type && item.mime_type.startsWith('image')) {
              this.largeImgSearchResult.push(item)
            }
          })
        } else {
          this.$notify.error({
            title: '搜索出错',
            message: '搜索过程出现错误：' + response.msg
          })
        }
      }).finally(() => {
        this.loading.searchMore = false
      })
    },
    handleFilterSearchResult() {
      this.search.nextOffset = 0
      this.searchResult = []
      this.largeImgSearchResult = [];
      this.largeImgSelected= [];
      this.largeImgs=[];
      this.handleStartSearch();
    },
    handleSearch(searchKey) {
      this.search.keyword = searchKey
      this.search.nextOffset = 0
      this.search.resultShowType = '0'
      this.searchResult = []
      this.largeImgSearchResult = [];
      this.largeImgSelected= [];
      this.largeImgs=[];
      this.visible.searchDialogVisible = true
      this.handleStartSearch()
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleBatchAddToList() {
      if(this.largeImgs.length > 0) {
        this.$emit('handleBatchAdd', this.largeImgs)
      }else{
        this.$emit('handleBatchAdd', this.multipleSelection)
      }
    },
    handleBatchAddToPrivate() {
      if(this.largeImgs.length > 0) {
        this.$emit('batchAddSrcToPrivateDir', this.largeImgs)
      }else{
        this.$emit('batchAddSrcToPrivateDir', this.multipleSelection)
      }
    },
    handleSortTypeSelected(val) {
      this.sortType = val
      this.search.nextOffset = 0
      this.searchResult = []
      this.largeImgSearchResult = [];
      this.largeImgSelected= [];
      this.largeImgs=[];
      this.handleStartSearch()
    },
    handleSortOrderSelected(val) {
      this.sortOrder = val
      this.search.nextOffset = 0
      this.searchResult = []
      this.largeImgSearchResult = [];
      this.largeImgSelected= [];
      this.largeImgs=[];
      this.handleStartSearch()
    },
    close() {
      this.visible.searchDialogVisible = false
    }
  },
  watch: {
    'search.keyword': {
      immediate: true,
      handler(v1, v2) {
        if (v1 !== '' || v1 !== v2) {
          this.$nextTick(() => {
            this.searchResult = [];
            this.largeImgSearchResult = [];
            this.largeImgSelected= [];
            this.largeImgs=[];
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

:deep(.el-dialog) {

  margin-top: 8vh !important;
  width: 1127px !important;

  .el-dialog__header {
    background-color: #EAE8EB;
  }

  .el-dialog__body {
    padding: 0 0 10px 0;
    text-align: center;
  }
}

:deep(.el-tabs) {
  background-color: #EAE8EB;
  padding: 0 20px 0px 20px;
}

.function-block {
  text-align: left;
  margin: 10px 0;

  .el-button {
    border-radius: 0px;
    font-size: 14px;
  }
}

.function-block-sort {
  position: absolute;
  right: 30px;
}

.search-result-content {
  margin: 0 20px 0 20px;
}

.search-result-type-switch {
  height: 40px;
}

:deep(.el-table-column--selection) {
  .cell {
    padding: 0 14px !important;
  }
}

.search-result-page-switch {
  margin-top: 20px;
  width: 300px;
}

.flex {
  display: flex;
}

.file-icon {
  .iconfont-color {
    font-size: 30px;
  }
}

.file-name {
  margin-left: 30px;
  color: #181818;
  font-size: 14px;
  font-family: Microsoft YaHei UI-Regular, Microsoft YaHei UI;
  font-weight: 400;
  vertical-align: center;
}

.file-desc {
  margin-top: 5px;
  margin-left: 60px;
}

.file-type-icon {
  margin: 0 5px;
  font-size: 20px;
}

.file-type-icon:hover {
  color: #F6891F;
}

.file-type-hide {
  display: none;
}

.el-table__body tr:hover > td .file-type-hide {
  display: block;
}

.file-type-show {
  display: block;
}

.el-table__body tr:hover > td .file-type-show {
  display: none;
}

.el-table__body tr:hover > td .file-name {
  color: #F6891F;
}


:deep(.el-table__cell) {
  border-bottom: 0 solid #FFFFFF !important;
}

.sort-icon {
  margin: 0 10px;
}

.sort-item {
  margin: 5px 0;
}

.rotate_bg {
}

.rotate_bg i.rotateImages {
  -webkit-animation: myRotate 1s linear infinite;
  animation: myRotate 1s linear infinite;
  padding: 0 15px;
}

@-webkit-keyframes myRotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes myRotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  50% {
    -webkit-transform: rotate(180deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

.better-scroll {
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    -webkit-box-shadow: inset 0 0 8px #CFCFCF;
  }

  &::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 5px #CFCFCF;
    border-radius: 8px;
  }
}

.large-img-mode-box {
  display: flex;
  flex-wrap: wrap;

  .large-img-item {
    position: relative;
    width: calc(20% - 10px);
    flex-shrink: 0;
    padding: 30px 12px 10px 12px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 0 10px 10px 0;
    border-radius: 5px;
    box-sizing: border-box;

    .el-image {
      border-radius: 4px;
    }

    &::after {
    }

    .el-checkbox {
      position: absolute;
      top: 5px;
      left: 10px;
      width: 16px;
      height: 16px;
    }

    img {
      position: absolute;
      top: 5px;
      right: 10px;
      color: #F6891F;
    }
  }
}
</style>
