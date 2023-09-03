<template>
  <section id="build">
    <!--工具条-->
    <!--header-->
    <div>
      <div class="main-tools">
        <el-input v-model="search.key"
                  class="my-input"
                  placeholder="请输入关键字"
                  @keyup.enter.native="handleSearch">
          <el-button slot="append"
                     class="search-button"
                     icon="el-icon-search"
                     style=""
                     v-on:click="handleSearch"/>
        </el-input>
        <div style="padding:15px 0;color: #808080">热门搜索:
          <span v-for="key in topSearchKey"
                style="padding: 15px;cursor: pointer"
                @click="handleClickTopSearchKey(key)"><u><b>{{ key }}</b></u></span>
        </div>
      </div>
    </div>
    <el-drawer ref="drawer"
               v-model:visible="menuDrawerVisible"
               custom-class="demo-drawer"
               direction="ltr"
               title="目录菜单">
      <div class="demo-drawer__content">
        <lenovo-dir-drawer/>
      </div>
    </el-drawer>
    <div v-if="directoryType.length === 0">
      <space-selector @onDirectoryTypeSelected="handleDirectoryTypeSelected"/>
    </div>
    <!--    <div v-else-if="curDirNeid === '541796009' && toCreateAlbum.list.length === 0"-->
    <div v-else-if="curDirNeid === '541796009' && toCreateAlbum.list.length === 0"
         style="height:1080px;padding: 0 40px;background: #d1d1d1;">
      <div v-loading="dir.loadingDir || loading.search"
           element-loading-background="rgba(209, 209, 209)"
           style="padding: 10px 10px 0 10px;height: 100%; ">
        <el-row :gutter="10"
                align="middle"
                justify="center">
          <el-col v-for="(menu,index) in menuPath"
                  :key="index"
                  class="card-panel-col"
                  :lg="{span: '4-8'}"
                  :md="{span: '4-8'}"
                  :sm="12"
                  :xl="{span: '4-8'}"
                  :xs="12">
            <div class="menu-content"
                 style="border: #000000 3px"
                 @click="handleListLenovoDir(menu.path)">
              <img :src="menu.icon"
                   style=""/>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!--main-->
    <div v-else class="content_main">
      <!--左边目录树-->
      <div class="left-area">
        <directory-tree class="better-scroll"
                        @handleClickItem="handleOpenDir"></directory-tree>
      </div>
      <div class="center-area">
        <!--表格上的操作区-->
        <div class="tools-operate-area">
          <div class="directory-tools">
            <el-button icon="iconfont el-icon-a-icon_getshortchain"
                       size="mini"
                       type="primary"
                       @click="handleGetCurRedirectPath">获取短链
            </el-button>
            <el-button v-if="hasBtnShowPermission(null,'WORD_MANAGER')"
                       size="mini"
                       type="primary"
                       class="btn-icon-class"
                       icon="iconfont el-icon-a-icon_managenext"
                       @click="visible.addWordDialogVisible = !visible.addWordDialogVisible">
              管理小白板
            </el-button>
            <add-src-to-private-dir v-if="hasBtnShowPermission(null,'NEW_PRIVATE_DIR')"
                                    :curDirNeid="curDirNeid"
                                    @onAddSuccess="handleRefreshDir"
                                    @preview="handleClickDirItem"/>
            <add-private-directory v-if="hasBtnShowPermission(null,'NEW_PRIVATE_DIR')"
                                   :curDirNeid="curDirNeid"
                                   @onAddSuccess="handleRefreshDir"/>
            <el-button icon="iconfont el-icon-a-icon_addtolist"
                       size="mini"
                       type="primary"
                       @click="handleBatchAddToList">加入清单
            </el-button>
          </div>
          <!--文件路径显示-->
          <el-row class="adminContentHead">
            <el-col :span="15"
                    style="color:#000000;font-size: 15px;">
              <span style="cursor:pointer;"
                    class="common-btn-style color_back"
                    @click="handleBackMenuPath">
                <img src="../../../assets/icon_back.svg"/>
                返回上一层级
              </span>
              <!--<span
                        style="cursor:pointer;margin: 0 8px;position: relative;top: -0.1em;"
                        @click="handleGoRootPath">|</span>-->
              <span style="cursor:pointer;"
                    :class="{'color_back': dir.currentPath.length}"
                    @click="handleGoRootPath">{{
                  directoryType === 'SELF' ? '细分市场素材库' : '基础素材库'
                }}</span>
              <span v-for="(item,index) in dir.currentPath"
                    v-if="item !== '营销素材展示'"
                    style="display: inline">
                <span style="position: relative;top: -0.025em;margin: 0 4px;font-size: 15px;">/</span>
                <span style="cursor:pointer;"
                      :class="{'color_back': index !== dir.currentPath.length-1}"
                      @click="handleClickDirPath(item,index)">{{ item }}</span>
              </span>
            </el-col>
            <el-col :span="9"
                    style="text-align: right"
                    class="">
              <span style="margin-right: 20px">
                共{{ dir.tableData.length }}个资源
              </span>
              <span class="pointer">
                <el-dropdown trigger="click"
                             @command="sortFilter"
                             :hide-on-click="false">
                  <span class="common-btn-style">
                    <img
                        style="color: #fff; width: 16px; height: 16px; margin-right: 5px"
                        src="../../../assets/icon_Filter.svg"/>
                    排序
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item :icon="sortRegular.regular.icon3"
                                      disabled
                                      :command="{regularName: 'name', icon3: 'el-icon-check', type: 'regular'}">名称排序</el-dropdown-item>
                    <el-dropdown-item
                        divided
                        :class="{'ml19': !sortRegular.sort.icon1}"
                        :icon="sortRegular.sort.icon1"
                        :command="{sortName: 'asc', icon1: 'el-icon-check', type: 'sort'}">升序</el-dropdown-item>
                    <el-dropdown-item
                        :class="{'ml19': !sortRegular.sort.icon2}"
                        :icon="sortRegular.sort.icon2"
                        :command="{sortName: 'desc', icon2: 'el-icon-check', type: 'sort'}">降序</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
              <span
                  @click="isListMode = !isListMode"
                  v-if="isListMode"
                  class="pointer">
                <span
                    class="common-btn-style"
                    style="font-size: 14px;color: #606266">
                  <img
                      style="color: #fff; width: 16px; height: 16px; margin-right: 5px"
                      src="../../../assets/icon_list_mode.svg"/>
                  列表模式
                </span>
              </span>
              <span
                  @click="isListMode = !isListMode"
                  v-if="!isListMode"
                  class="pointer">
                <span
                    class="common-btn-style"
                    style="font-size: 14px; color: #606266">
                  <img
                      style="color: #fff; width: 16px; height: 16px; margin-right: 5px"
                      src="../../../assets/icon_large_img_mode.svg"/>
                  大图模式
                </span>
              </span>
              <span class="pointer">
                <el-dropdown trigger="click"
                             @command="filterTerm"
                             :hide-on-click="false">
                  <span class="common-btn-style">
                    <img
                        style="color: #fff; width: 16px; height: 16px; margin-right: 5px"
                        src="../../../assets/icon_Filter.svg"/>
                    筛选
                  </span>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                        :class="{'ml19': !filterRegular.icon1}"
                        :icon="filterRegular.icon1"
                        :command="{filterName: 'all', icon1: 'el-icon-check'}">全部</el-dropdown-item>
                    <el-dropdown-item
                        :class="{'ml19': !filterRegular.icon2}"
                        :icon="filterRegular.icon2"
                        :command="{filterName: 'dir', icon2: 'el-icon-check'}">文件夹</el-dropdown-item>
                    <el-dropdown-item
                        :class="{'ml19': !filterRegular.icon3}"
                        :icon="filterRegular.icon3"
                        :command="{filterName: 'doc', icon3: 'el-icon-check'}">文档</el-dropdown-item>
                    <el-dropdown-item
                        :class="{'ml19': !filterRegular.icon4}"
                        :icon="filterRegular.icon4"
                        :command="{filterName: 'image', icon4: 'el-icon-check'}">图片</el-dropdown-item>
                    <el-dropdown-item
                        :class="{'ml19': !filterRegular.icon5}"
                        :icon="filterRegular.icon5"
                        :command="{filterName: 'video', icon5: 'el-icon-check'}">视频</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </span>
            </el-col>
          </el-row>
        </div>
        <el-table v-if="isListMode"
                  class="better-scroll"
                  ref="fileTable"
                  v-loading="dir.loadingDir || loading.search"
                  :data="dir.tableData"
                  empty-text="文件夹为空"
                  style="width: 100%;"
                  tooltip-effect="dark"
                  @row-click="handleClickDirItem"
                  @cell-click="handleAddAdmin"
                  @selection-change="handleSelectionChange">
          <!--多选框，屏蔽文件夹，使其不可选中-->
          <el-table-column
              type="selection"
              align="center"
              width="55"
              :selectable="(row) => {return !row.is_dir}"></el-table-column>
          <el-table-column label="文件名"
                           show-overflow-tooltip>
            <template v-slot="scope">
              <div style="">
                <div class="flex">
                  <span class="file-icon">
                    <i v-if="scope.row.is_dir"
                       class="iconfont-color icon-icon_folder"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('doc')"
                       class="iconfont-color icon-icon_file"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('image')"
                       class="iconfont-color icon-icon_pic"></i>
                    <i v-else-if="scope.row.mime_type.startsWith('video')"
                       class="iconfont-color icon-icon_vedio"></i>
                    <i v-else
                       class="el-icon-question"></i>
                  </span>
                  <span v-if="scope.row.mime_type && scope.row.mime_type.startsWith('word')"
                        class="main-file-name">
                  {{ ' ' + scope.row.path }}</span>
                  <span v-else
                        class="main-file-name">
                  {{ ' ' + scope.row.file_name }}</span>
                </div>

                <div v-if="scope.row.desc">
                  <el-tag v-for="(tag,index) in scope.row.desc.split(' ')"
                          size="mini"
                          style="margin-right: 2px"
                          :key="index"
                          type="info">{{ tag.replace(markReg, '') }}
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
              </div>
            </template>
          </el-table-column>
          <!--todo 需求变更，一级目录隐藏此列-->
          <el-table-column
              v-if="(directoryType === 'SELF' && dir.currentPath.length > 0) || (directoryType !== 'SELF' && dir.currentPath.length > 1)"
              label="预览" width="110">
            <template v-slot="scope">
              <el-image v-if="scope.row.mime_type && scope.row.mime_type.startsWith('image')"
                        :onerror="defaultImg"
                        @click="handleGoToPreview(scope.row)"
                        :src="genPreviewUrl(scope.row.neid)"
                        class="preview_img"
                        style="height: 60px;width: 90px;">
              </el-image>
            </template>
          </el-table-column>
          <el-table-column v-if="directoryType === 'SELF' && curDirNeid === '0'"
                           align="left"
                           width="200"
                           label="管理员">
            <template v-slot="scope">
              <PrivateDirectoryAdminManager
                  :ref="`adminManage${scope.row.neid}`"
                  :editable="scope.row.neid === curEditAdminNeid"
                  v-if="scope.row.is_dir && curDirNeid === '0'"
                  :enabled="userInfo.isAdmin && directoryType === 'SELF'"
                  :file-item="scope.row"/>
            </template>
          </el-table-column>
<!--          <el-table-column align="left"-->
<!--                           width="80"-->
<!--                           label="引用次数">-->
<!--            <template v-slot="scope">-->
<!--              <span>{{ scope.row.is_dir ? '-' : scope.row.ref_num }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
          <el-table-column align="left"
                           width="80"
                           label="下载次数">
            <template v-slot="scope">
              <span>{{ scope.row.is_dir ? '-' : scope.row.download_num }}</span>
            </template>
          </el-table-column>
          w
          <el-table-column align="left"
                           label="操作"
                           width="160">
            <template v-slot="scope">
              <div class="flex">
                <RenamePrivateDirectory
                    v-if="hasBtnShowPermission(scope.row,'RENAME') && scope.row.neid !== curEditAdminNeid"
                    :file-item="scope.row"
                    @onModifySuccess="handleRefreshDir"/>
                <span v-if="directoryType === 'SELF' && scope.row.adminUser"
                      class="flex">
                  <span v-if="scope.row.neid === curEditAdminNeid"
                        style="margin-right: 5px">
                    <img src="../../../assets/icon_check_hover.svg"
                         style="width: 32px; height: 32px"
                         @click.stop="handleSave(scope.row.neid)"/>
                  </span>
                  <span v-else-if="scope.row.is_dir && curDirNeid === '0'"
                        style="margin-right: 5px">
                    <img
                        src="../../../assets/icon_user_hover.svg"
                        style="width: 32px; height: 32px"
                        @click.stop="curEditAdminNeid = scope.row.neid"/>
                  </span>
                  <span v-if="scope.row.neid === curEditAdminNeid"
                        style="margin-right: 5px">
                    <img src="../../../assets/icon_close_hover.svg"
                         style="width: 32px; height: 32px"
                         @click.stop="curEditAdminNeid = ''"/>
                  </span>
                </span>
                <el-tooltip v-if="!scope.row.is_dir && !scope.row.mime_type.startsWith('word')"
                    class="item" effect="dark" content="加入清单" placement="top">
                  <span v-if="!scope.row.is_dir && !scope.row.mime_type.startsWith('word')"
                         style="margin-right: 5px">
                    <img style="width: 32px; height: 32px"
                         src="../../../assets/icon_add_hover.svg"
                         @click.stop="handleAdd(scope.row)"/>
                  </span>
                </el-tooltip>
                <el-tooltip v-if="!scope.row.is_dir && !scope.row.mime_type.startsWith('word')"
                    class="item" effect="dark" content="下载" placement="top">
                  <span v-if="!scope.row.is_dir && !scope.row.mime_type.startsWith('word')"
                        style="margin-right: 5px">
                    <img style="width: 32px; height: 32px"
                         src="../../../assets/icon_download.svg"
                         @click.stop="handleDownload(scope.row)"/>
                  </span>
                </el-tooltip>
                <span v-if="hasBtnShowPermission(scope.row,'TRANSCODE')"
                      style="margin-right: 5px">
                  <img
                      src="../../../assets/icon_link_hover.svg"
                      style="width: 32px; height: 32px"
                      @click.stop="handleAddTranscodeVideo(scope.$index, scope.row)"/>
                </span>
                <span v-if="hasBtnShowPermission(scope.row,'RENAME_SRC')"
                      style="margin-right: 5px">
                  <img
                      src="../../../assets/el-icon-edit.svg"
                      style="width: 32px; height: 32px"
                      @click.stop="handleUpdateAlias(scope.$index, scope.row)"/>
                </span>
                <span style="margin-right: 5px" v-if="scope.row.neid !== curEditAdminNeid">
                  <img
                      v-if="hasBtnShowPermission(scope.row,'PRIVATE_DIR_REMOVE_SRC')"
                      src="../../../assets/icon_delete_hover.svg"
                      style="width: 32px; height: 32px"
                      @click.stop="handleRemoveSrc(scope.$index, scope.row)"/>
                </span>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <div v-else
             class="better-scroll"
             style="overflow: auto">
          <div v-if="dir.largeImgModeData.length"
               class="large-img-mode-box">
            <div class="large-img-item"
                 v-for="(item,index) in dir.largeImgModeData"
                 :key="item.neid">
              <el-checkbox
                  @change="handleSelectedLargeImg(item)"
                  :value="largeImgSelected.includes(item.neid)"/>
              <img @click="handleAdd(item,true)"
                   src="../../../assets/icon_add_hover.svg"
                   style="width: 22px; height: 22px"/>
              <el-image
                  :onerror="defaultImg"
                  :preview-src-list="[].concat(genPreviewUrl(item.neid))"
                  :src="genPreviewUrl(item.neid)">
              </el-image>
              <div style="font-size: 11px">{{ item.file_name }}</div>
            </div>
          </div>
          <el-empty v-else
                    description="暂无数据"></el-empty>
        </div>
      </div>
      <div class="right-area">
        <div class="content_div flex">
          <div class="qdbj_list_tit"
               style="width: 100%">
            <span>清单编辑列表（{{ toCreateAlbum.list.length }}）</span>
          </div>
          <div class="right-table-btn">
            <el-table id="toSortTable"
                      ref="table"
                      height="100%"
                      class="qingdan_table better-scroll"
                      :data="toCreateAlbum.list"
                      empty-text="清单内还没有内容"
                      row-key="neid"
                      stripe
                      style="width: 100%">
              <el-table-column
                  class-name="preview_cell"
                  label="预览">
                <template v-slot="scope">
                  <el-image v-if="scope.row.mime_type.startsWith('image')"
                            :onerror="defaultImg"
                            :preview-text="scope.row.path"
                            :src="genPreviewUrl(scope.row.neid)"
                            class="preview_img"
                            style="border-radius:5px;width: 150px; height: 90px;" fit="fill"
                            preview="build_image_list"/>
                  <el-image v-else
                            class="preview_img"
                            :src="handleGetDocumentImage(scope.row.mime_type)"
                            @click="handleGoToPreview(scope.row)"/>
                  <div style="width: 150px">
                    {{ scope.row.path.substr(scope.row.path.lastIndexOf('/') + 1) }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column align="center"
                               label="操作"
                               width="100">
                <template v-slot="scope">
                  <div v-if="!scope.row.isModify"
                       class="color_back"
                       @click.stop="handleDelete(scope.$index, scope.row)">删除
                  </div>
                  <div v-else
                       @click.stop="handleModify(scope.$index,scope.row,false)">取消
                  </div>
                </template>
              </el-table-column>
            </el-table>
            <div :class="{no_display:toCreateAlbum.list.length === 0}"
                 class="load_more_bt qd_list_btns">
              <el-button :loading="loading.saveList"
                         class="load_more_bt"
                         icon="el-icon-folder-add"
                         size="mini"
                         type="primary"
                         @click.stop="handleSaveList">保存
              </el-button>
              <el-button v-loading="loading.downloadLoading"
                         class="load_more_bt"
                         icon="el-icon-suitcase"
                         size="mini"
                         type="primary"
                         @click.stop="handleDownloadSrc(true)">下载
              </el-button>
              <el-button class="load_more_bt"
                         icon="el-icon-delete"
                         size="mini"
                         type="primary"
                         @click.stop="handleClearList">清空
              </el-button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <el-dialog ref="addDialog"
               v-model:visible="toCreateAlbum.descSelectDialogVisible"
               center
               title="选择已有解说词">
      <span class="dialog-footer">
        <img :src="toCreateAlbum.previewUrl"
             class="preview_img"
             style="margin: 0 auto">
      </span>
      <el-table :data="toCreateAlbum.toSelectDesc"
                empty-text="暂无可用解说词"
                style="width: 70%"
                @row-click="handleSelectDesc">
        <el-table-column prop="desc"></el-table-column>
      </el-table>
      <span slot="footer"
            class="dialog-footer">
        <el-button icon="el-icon-circle-plus"
                   style="margin-top: 10px"
                   type="primary"
                   @click.stop="handleCustomDesc">不借鉴</el-button>
      </span>
    </el-dialog>
    <el-dialog :title="'【' + selectListName +'】清单详情'"
               v-model:visible="visible.listDetailDialogVisible">
      <el-table v-loading="loading.listDetailLoading"
                :data="listDetail"
                @selection-change="handleSelectListItem">
        <el-table-column
            type="selection"
            width="55">
        </el-table-column>
        <el-table-column label="预览">
          <template v-slot="scope">
            <el-tooltip :content="scope.row.path"
                        class="item"
                        effect="dark"
                        placement="top">
              <img :onerror="defaultImg"
                   :src="genPreviewUrl(scope.row.neid)"
                   class="preview_img">
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer"
           class="dialog-footer">
        <el-button @click.stop="visible.listDetailDialogVisible = false">取 消</el-button>
        <el-button :disabled="selectListItem.length === 0"
                   type="primary"
                   @click.stop="handleAddListDetailToBuild">添 加
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :title="toPlayVideo.title"
               :visible.sync="visible.videoDialogVisible"
               @close="handleCloseVideo"
               @opened="initVideoPlayer()">
      <video id="myVideo"
             class="video-js vjs-big-play-centered vjs-16-9"
             oncontextmenu="return false">
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a
          web browser that
          <a href="https://videojs.com/html5-video-support/"
             target="_blank">
            supports HTML5 video
          </a>
        </p>
      </video>
    </el-dialog>
    <search-result-dialog
        ref="searchDialog"
        :directoryType="directoryType"
        @addSrcToPrivateDir="handleAddSrcToPrivateDir"
        @batchAddSrcToPrivateDir="batchAddSrcToPrivateDir"
        @goToDir="handleClickSearch"
        @handleAdd="handleAdd"
        @handleBatchAdd="handleBatchAdd"
    >
    </search-result-dialog>
    <el-dialog :close-on-click-modal="false"
               :visible.sync="visible.addWordDialogVisible"
               title="小白板管理"
               @open="handleFilterCurDirWordList">
      <div style="text-align: right">
        <el-button class="search-button"
                   size="small"
                   @click="handleSaveWordToDir">&nbsp;&nbsp;&nbsp;保 存&nbsp;&nbsp;&nbsp;
        </el-button>
      </div>
      <el-row>
        <el-col :span="12">
          <el-input v-model="wordListSearchText"
                    placeholder="请输入关键字"
                    style="width: auto">
          </el-input>
          <el-button icon="el-icon-search"
                     @click="handleGetMyWordList"></el-button>
          <el-table v-loading="wordListLoading"
                    :data="wordListOption" height="400"
                    style="width: 100%">
            <el-table-column label="待选小白板"
                             prop="title">
            </el-table-column>
            <el-table-column fixed="right"
                             label="操作"
                             width="100">
              <template v-slot="scope">
                <el-button size="small"
                           type="text"
                           @click="handleAddWordListRow(scope.row)">添加
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination v-model:current-page="wordListPageNum"
                         :page-size="wordListPageSize"
                         :total=wordListTotal
                         background
                         layout="prev, pager, next"
                         @current-change="handleGetMyWordList">
          </el-pagination>
        </el-col>
        <el-col :span="12">
          <el-table :data="wordListSelected"
                    style="width: 100%">
            <el-table-column label="已选小白板"
                             prop="title">
            </el-table-column>
            <el-table-column fixed="right"
                             label="操作"
                             width="100">
              <template v-slot="scope">
                <el-button size="small"
                           type="text"
                           @click="handleDeleteWordListRow(scope.row)">删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </el-dialog>
    <el-image-viewer
        v-if="imageViewVisible" :initial-index="imageIndex"
        :on-close="()=>{imageViewVisible = false}"
        :url-list="imageViewUrl" :z-index=9999></el-image-viewer>
  </section>
</template>

<script>
import api, {
  addRedirectPath,
  addTranscodeVideo,
  addWordToDir,
  batchNewPrivateDirSrc,
  ftsSearch,
  getFileMetadata,
  getMyWordList,
  getTopSearchKey,
  newPrivateDirSrc,
  newDownloadTask,
  downloadTaskStatus,
  removePrivateDir,
  removePrivateDirSrc,
  updateSrcAlias, queryFileAlready
} from '../../../api'
import genSrcPreviewSrc, {getVideoPreviewUrl} from '../../../utils'
import Sortable from 'sortablejs'
import videojs from 'video.js'
import {getDocumentImage, getFileNameWithoutExtension, getQueryParam, joyeaMenuPath} from '@/utils/JoyeaUtil'
import {mapGetters} from 'vuex'
import LenovoDirSelector from '@/components/LenovoDirSelector'
import LenovoDirDrawer from '@/components/LenovoDirDrawer'
import AddPrivateDirectory from '@/components/AddPrivateDirectory'
import AddSrcToPrivateDir from '@/components/AddSrcToPrivateDir'
import RenamePrivateDirectory from '@/components/RenamePrivateDirectory'
import PrivateDirectoryAdminManager from '@/components/PrivateDirectoryAdminManager'
import SpaceSelector from '@/components/SpaceSelector'
import SearchResultDialog from '@/components/SearchResultDialog'
import DirectoryTree from '@/components/DirectoryTree.vue'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

const videoLoading = require('@/assets/video-loading.jpg')

export default {
  name: 'index',
  components: {
    LenovoDirSelector,
    LenovoDirDrawer,
    AddPrivateDirectory,
    AddSrcToPrivateDir,
    RenamePrivateDirectory,
    PrivateDirectoryAdminManager,
    SpaceSelector,
    SearchResultDialog,
    DirectoryTree,
    ElImageViewer
  },
  data() {
    return {
      curEditAdminNeid: '',
      directoryType: '',
      newPrivateDirName: '',
      parentDirId: '',
      menuDrawerVisible: false,
      dir: {
        currentPath: [],
        tableData: [],
        largeImgModeData: [],
        loadingDir: false
      },
      markReg: /<mark>|<\/mark>/g,
      search: {
        type: '',
        key: '',
        hasNext: false
      },
      loading: {
        search: false,
        searchMore: false,
        searchList: false,
        saveList: false,
        downloadLoading: false,
        listDetailLoading: false
      },
      menuPath: joyeaMenuPath,
      searchResult: [],
      searchListResult: [],
      selectListId: 0,
      selectListName: 0,
      selectListItem: [],
      listDetail: [],
      topSearchKey: [],
      toCreateAlbum: {
        idEditMode: false, // 是否是编辑模式
        editListId: -1,
        name: '', // 清单名称
        list: [], // 资源列表
        modifyRow: '',
        toAddRow: {},
        previewUrl: '',
        descSelectDialogVisible: false,
        toSelectDesc: []
      },
      loadMoreForm: {
        key: '',
        nextOffset: 0
      },
      visible: {
        listDetailDialogVisible: false,
        videoDialogVisible: false,
        videoPrepared: false,
        imageDialogVisible: false,
        searchDialogVisible: false,
        addWordDialogVisible: false,
        addPrivateDirVisible: false
      },
      defaultImg: 'this.src="' + require('@assets/error.png') + '"', // 默认图地址
      player: null,
      toPlayVideo: {
        title: '',
        url: ''
      },
      wordListLoading: false,
      wordListOption: [],
      wordListTotal: 0,
      wordListPageSize: 10,
      wordListPageNum: 1,
      wordListSearchText: '',
      wordListSelected: [],
      curDirNeid: '',
      curDirAdminUser: [],
      videoPreviewPromise: Object,
      videoPreviewAbort: Object,
      isListMode: true,
      sortRegular: {
        regular: {
          regularName: 'name',
          icon3: 'el-icon-check',
          type: 'regular'
        },
        sort: {
          sortName: 'asc',
          icon1: 'el-icon-check',
          type: 'sort'
        }
      }, // 默认升序
      filterRegular: {
        filterName: 'all',
        icon1: 'el-icon-check'
      }, // 默认筛选全部
      toReachPath: '', // 记录面包屑目录
      multipleSelection: [],
      largeImgSelected: [],
      largeImgs: [],
      imageViewVisible: false,
      imageIndex: 0,
      imageViewUrl: [],
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo/userInfo'
    })
  },
  watch: {
    directoryType() {
      this.$EventBus.$emit('directoryTypeChanged', this.directoryType)
    }
  },
  methods: {
    hasBtnShowPermission(fileItem, mode) {
      let hasPermission = false
      try {
        switch (mode) {
          case 'PRIVATE_DIR_REMOVE_SRC':
            hasPermission = this.directoryType === 'SELF' &&
                (this.userInfo.isAdmin || this.curDirAdminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0) &&
                !(fileItem.mime_type && fileItem.mime_type.startsWith('word'))
            break
            // case "PRIVATE_DIR_DOWNLOAD":
            //     hasPermission = this.directoryType === "SELF" && fileItem.is_dir
            //     break;
          case 'NEW_PRIVATE_DIR':
            hasPermission = this.directoryType === 'SELF' &&
                (this.userInfo.isAdmin || this.curDirAdminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0)
            break
          case 'WORD_MANAGER':
            hasPermission = (this.userInfo.isAdmin || this.curDirAdminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0)
            break
          case 'MANAGER':
            hasPermission = this.directoryType === 'SELF' && fileItem.path === '/' + fileItem.file_name &&
                fileItem.is_dir &&
                (this.userInfo.isAdmin || fileItem.adminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0)
            break
          case 'RENAME':
            hasPermission =
                this.directoryType === 'SELF' && fileItem.is_dir &&
                (this.userInfo.isAdmin || this.curDirAdminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0)
            break
          case 'RENAME_SRC':
            hasPermission =
                this.directoryType === 'SELF' && !fileItem.is_dir && fileItem.mime_type !== 'word' &&
                (this.userInfo.isAdmin || this.curDirAdminUser.filter(item => this.userInfo.email === item.joyeaId).length > 0)
            break
          case 'TRANSCODE':
            hasPermission = this.userInfo.isAdmin &&
                !fileItem.is_dir &&
                (fileItem.mime_type && fileItem.mime_type.startsWith('video'))
            break
          default:
            break
        }
      } catch (e) {
        hasPermission = false
      }
      //console.log(mode + " - " + this.userInfo.isAdmin + " - " + this.directoryType + " - " + hasPermission + " - " + JSON.stringify(fileItem));
      return hasPermission
    },
    handleGetCurRedirectPath() {
      const _this = this
      let currentFullPath = ''
      this.dir.currentPath.forEach(tmp => {
        currentFullPath = currentFullPath + '/' + tmp
      })
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
    handleGoToPreview(row) {
      if (row.mime_type.startsWith('video')) {
        this.handlePlayVideo(row)
        return
      } else if (row.mime_type.startsWith('word')) {
        const nextPlusToken = localStorage.getItem('nextx_token')
        const url = 'https://m.nextxx.cn/fullscreen/#/main/pc/boardDetail?access_token=' + nextPlusToken + '&id=' + row.neid
        window.open(url)
        return
      }
      const url = genSrcPreviewSrc(row.neid)
      if (row.mime_type.startsWith('video')) {
      } else if (row.mime_type.startsWith('image')) {
        let imageFileItemNeid = this.dir.tableData.filter(fileItem => {
          return !fileItem.is_dir && fileItem.mime_type.startsWith('image')
        }).map(fileItem => {
          return fileItem.neid
        })
        let currentClickItemIndex = imageFileItemNeid.indexOf(row.neid)
        this.imageViewUrl = imageFileItemNeid.map(fileItemNeid => {
          return genSrcPreviewSrc(fileItemNeid)
        })
        this.imageIndex = currentClickItemIndex
        this.imageViewVisible = true
      } else if (row.mime_type.startsWith('doc')) {
        window.open(url)
      } else {
        this.$message.error('暂不支持的预览类型！')
      }
    },
    handlePlayVideo(row) {
      this.visible.videoDialogVisible = true
      this.visible.videoPrepared = false
      const title = row.path.substr(row.path.lastIndexOf('/') + 1)
      const {
        promise,
        abort
      } = getVideoPreviewUrl(row.neid, 30)
      this.videoPreviewPromise = promise
      this.videoPreviewAbort = abort
      const _this = this
      this.videoPreviewPromise.then(videoUrl => {
        _this.visible.videoPrepared = true
        _this.toPlayVideo.url = videoUrl
        _this.toPlayVideo.title = title
        if (_this.visible.videoDialogVisible) {
          _this.playVideo(videoUrl)
        }
      })
    },
    handleClickTopSearchKey(key) {
      this.handleSearch(key)
    },
    handleGetDocumentImage(mimeType) {
      return getDocumentImage(mimeType)
    },
    initVideoPlayer() {
      const _this = this
      if (this.player == null) {
        videojs(document.getElementById('myVideo'), {
          controls: true, // 是否显示控制条
          preload: 'auto',
          autoplay: false,
          fluid: true, // 自适应宽高
          language: 'zh-CN', // 设置语言
          muted: false, // 是否静音
          inactivityTimeout: false,
          poster: videoLoading,
          controlBar: { // 设置控制条组件
            children: [
              {name: 'playToggle'}, // 播放按钮
              {name: 'currentTimeDisplay'}, // 当前已播放时间
              {name: 'progressControl'}, // 播放进度条
              {name: 'durationDisplay'}, // 总时间
              {
                name: 'volumePanel', // 音量控制
                inline: false // 不使用水平方式
              },
              {name: 'FullscreenToggle'} // 全屏
            ]
          },
          sources: []
        }, function () {
          _this.player = this
        })
      } else {
        _this.player.poster(videoLoading)
      }
    },
    playVideo(videoUrl) {
      const data = {
        src: videoUrl,
        type: 'video/mp4'
      }
      this.player.pause()
      this.player.src(data)
      this.player.load(data)
      this.player.play()
    },
    handleCloseVideo() {
      if (this.videoPreviewAbort) {
        this.videoPreviewAbort()
      }
      if (this.player != null) {
        this.player.reset()
      }
    },
    handleSelectListItem(val) {
      this.selectListItem = val
    },
    handleAddListDetailToBuild() {
      this.selectListItem.forEach(item => {
        this.toCreateAlbum.list.push({
          joyeaDesc: item.desc,
          path: item.path,
          neid: item.neid,
          hash: item.hash,
          rev: item.rev,
          mime_type: item.mime_type,
          filename: item.path.substr(item.path.lastIndexOf('/') + 1),
          bytes: item.bytes,
          isModify: false
        })
      })
      api({
        action: 'referList',
        albumId: this.selectListId
      }).then(response => {
        if (response.result) {
        } else {
          console.log('引用计数失败：' + response.msg)
        }
      })
      this.visible.listDetailDialogVisible = false
    },
    handleSeeListDetail(row) {
      this.visible.listDetailDialogVisible = true
      this.loading.listDetailLoading = true
      this.listDetail = []
      this.selectListItem = []
      this.selectListId = row.album_id
      this.selectListName = row.album_name
      const _this = this
      api({
        action: 'listDetail',
        albumId: row.album_id
      }).then(response => {
        if (response.result) {
          response.list.forEach(item => {
            this.listDetail.push(item)
          })
        } else {
          _this.$notify.error({
            title: '查看出错',
            message: '查看过程出现错误：' + response.msg
          })
          console.log(response.msg)
        }
        this.loading.listDetailLoading = false
      })
    },
    handleSearch(searchKey) {
      if (searchKey !== undefined && typeof (searchKey) === 'string') {
        this.search.key = searchKey
      }
      if (this.search.key.trim().length === 0) {
        this.$message.warning('请输入搜索的关键字！')
        return
      }
      this.$refs.searchDialog.handleSearch(this.search.key)
    },
    handleLoadMore() {
      const _this = this
      if (_this.loadMoreForm.key.trim().length !== 0) {
        _this.loading.searchMore = true
        ftsSearch(_this.loadMoreForm.key, this.loadMoreForm.nextOffset).then(response => {
          if (response.code === '0') {
            _this.search.hasNext = response.obj.has_more
            if (_this.search.hasNext) {
              _this.loadMoreForm.key = _this.search.key
              _this.loadMoreForm.nextOffset = response.obj.next_offset
            }
            // _this.searchResult = [];
            response.obj.content.forEach(item => {
              item.joyeaDesc = ''
              item.isModify = false
              _this.searchResult.push(item)
            })
          } else {
            _this.$notify.error({
              title: '搜索出错',
              message: '搜索过程出现错误：' + response.msg
            })
            console.log(response.msg)
          }
        }).finally(() => {
          _this.loading.searchMore = false
        })
      }
    },
    handleAddTranscodeVideo(index, row) {
      addTranscodeVideo(row.neid).then(resp => {
        if (resp.code === '0') {
          this.$message.success('添加成功！')
        } else {
          this.$message.error('添加失败：' + resp.msg)
        }
      })
    },
    handleRemoveSrc(index, row) {
      if (row.is_dir) {
        this.$confirm('即将删除文件夹【' + row.file_name + '】', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removePrivateDir(row.neid).then(resp => {
            if (resp.code === '0') {
              this.$message.success('删除成功！')
              this.handleRefreshDir()
            } else {
              this.$message.error('删除失败：' + resp.msg)
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      } else {
        this.$confirm('即将删除文件【' + row.file_name + '】', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          removePrivateDirSrc(this.curDirNeid, row.neid).then(resp => {
            if (resp.code === '0') {
              this.$message.success('删除成功！')
              this.handleRefreshDir()
            } else {
              this.$message.error('删除失败：' + resp.msg)
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          })
        })
      }
    },
    handleBatchAddToList() {
      const params = this.isListMode ? this.multipleSelection : this.largeImgs
      this.handleBatchAdd(params)
      // this.multipleSelection = this.largeImgs = this.largeImgSelected = []
    },
    handleSelectedLargeImg(data) {
      if (!this.largeImgSelected.includes(data.neid)) {
        this.largeImgSelected.push(data.neid)
        this.largeImgs.push(data)
      } else {
        const index = this.largeImgSelected.indexOf(data.neid)
        this.largeImgSelected.splice(index, 1)
        this.largeImgs.splice(index, 1)
      }
    },
    handleBatchAdd(multiRow) {
      if (this.directoryType === '') {
        this.$refs.searchDialog.close()
        this.handleDirectoryTypeSelected('LENOVO')
      }
      if (multiRow instanceof Array && multiRow.length > 0) {
        let exist = false
        multiRow.forEach(item => {
          let currentItemExist = this.toCreateAlbum.list.map(item => {
            return item.neid
          }).includes(item.neid)
          if (currentItemExist) {
            exist = true
          }
        })
        if (exist) {
          this.$message.error('所选素材在清单列表中已存在！')
          return
        }
        multiRow.forEach(item => {
          this.handleAdd(item, true)
        })
        this.$message.success('成功添加【' + multiRow.length + '】条数据到清单！')
      }
    },
    handleSave(neid) {
      this.$refs[`adminManage${neid}`].handleSave()
      console.log('this.$refs[`adminManage${neid}`]', this.$refs[`adminManage${neid}`])
      this.curEditAdminNeid = ''
    },
    handleAdd(row, needFilter) {
      let existIndex = -1
      this.toCreateAlbum.list.forEach((item, index) => {
        if (item.neid === row.neid) {
          existIndex = index
        }
      })
      if (existIndex >= 0) {
        // this.toCreateAlbum.list.splice(existIndex,1);
        // this.toCreateAlbum.list.push(row);
        this.$message.error('所选素材在清单列表中已存在！')
      } else {
        this.toCreateAlbum.list.push(row)
      }
    },
    handleDownload(row) {
      queryFileAlready(row.neid).then(response => {
        if (response.obj) {
          window.open(window.location.protocol + "//" + window.location.host + "/apiv2/download/file/download?neid=" + row.neid);
        } else {
          this.$message.warning("文件正在同步中，请稍候重试！");
        }
      })
    },
    handleSelectDesc(row, column, event) {
      this.toCreateAlbum.toAddRow.joyeaDesc = row.desc
      this.toCreateAlbum.list.push(this.toCreateAlbum.toAddRow)
      this.toCreateAlbum.toAddRow = {}
      this.toCreateAlbum.toSelectDesc = []
      this.toCreateAlbum.descSelectDialogVisible = false
    },
    handleCustomDesc() {
      this.toCreateAlbum.toAddRow.joyeaDesc = ''
      this.toCreateAlbum.list.push(this.toCreateAlbum.toAddRow)
      this.toCreateAlbum.toAddRow = {}
      this.toCreateAlbum.toSelectDesc = []
      this.toCreateAlbum.descSelectDialogVisible = false
    },
    handleCollect(index, row) {
      api({
        action: 'srcCollect',
        method: row.collect ? 'unCollect' : 'collect',
        neid: row.neid,
        path: row.path,
        type: row.mime_type,
        size: row.size
      }).then(response => {
        if (response.result) {
          row.collect = !row.collect
          this.$notify.success({
            type: 'success',
            title: '提示',
            message: row.collect ? '收藏成功:' + row.path.substr(row.path.lastIndexOf('/') + 1) : '取消收藏成功:' + row.path.substr(row.path.lastIndexOf('/') + 1)
          })
        } else {
          console.log(response.msg)
        }
      })
    },
    handleModify(index, row, cg) {
      // 点击修改 判断是否已经保存所有操作
      for (const i of this.toCreateAlbum.list) {
        if (i.isModify && i.path !== row.path) {
          this.$message.warning('请先保存当前编辑项')
          return false
        }
      }
      // 是否是取消操作
      if (!cg) {
        if (!this.toCreateAlbum.modifyRow.path) {
        }
        return row.isModify = !row.isModify
      }
      // 提交数据
      if (row.isModify) {
        this.toCreateAlbum.list[index].joyeaDesc = this.toCreateAlbum.modifyRow.joyeaDesc
        row.isModify = false
      } else {
        this.toCreateAlbum.modifyRow = JSON.parse(JSON.stringify(row))
        row.isModify = true
      }
      return false
    },
    handleDelete(index, row) {
      this.toCreateAlbum.list.splice(index, 1)
    },
    genPreviewUrl(neid) {
      return genSrcPreviewSrc(neid)
    },
    handleSaveList() {
      this.$prompt(this.toCreateAlbum.idEditMode ? '当前是编辑模式，重命名清单名称！' : '请输入要保存的清单的名称',
          this.toCreateAlbum.idEditMode ? '编辑提示' : '保存提示',
          {
            confirmButtonText: this.toCreateAlbum.idEditMode ? '重新保存' : '保存清单',
            cancelButtonText: '取消',
            inputValue: this.toCreateAlbum.name
          }
      ).then(action => {
        const listName = action.value
        this.loading.saveList = true
        api({
          action: 'album',
          method: this.toCreateAlbum.idEditMode ? 'reSave' : 'save',
          id: this.toCreateAlbum.editListId,
          name: listName,
          src: this.toCreateAlbum.list
        }).then(response => {
          if (response.result) {
            this.$notify.success({
              title: this.toCreateAlbum.idEditMode ? '编辑结果' : '保存结果',
              message: this.toCreateAlbum.idEditMode ? '重新保存成功' : '保存成功'
            })
          } else {
            this.$notify.error({
              title: '保存结果',
              message: this.toCreateAlbum.idEditMode ? '重新保存失败' : '保存失败'
            })
          }
          this.loading.saveList = false
          this.$router.push('/manage/list')
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '取消保存'
        })
      })
    },
    handleClearList() {
      this.$alert('当前列表还没有保存，确定清空吗？', '清空提示', {
        confirmButtonText: '确定',
        callback: action => {
          this.toCreateAlbum.list = []
        }
      })
    },
    handleOpenDir(directoryType, path) {
      this.directoryType = directoryType
      this.handleListLenovoDir(path)
    },
    handleDownloadSrc(isList, row) {
      const _this = this
      const toDownloadList = []
      let totalBytes = 0
      if (isList) {
        let index = 0
        this.toCreateAlbum.list.forEach(src => {
          totalBytes += src.bytes
          toDownloadList.push({
            index: index += 1,
            filename: src.path.substr(src.path.lastIndexOf('/') + 1),
            neid: src.neid,
            path_type: src.path_type,
            rev: '',
            path: ''
          })
        })
      } else {
        toDownloadList.push({
          filename: row.path.substr(row.path.lastIndexOf('/') + 1),
          rev: row.rev,
          neid: row.neid.toString(),
          path_type: row.path_type,
          path: ''
        })
      }
      const totalKb = totalBytes / 1024
      const totalMb = totalKb / 1024
      const warnMb = 300
      this.$confirm(
          '您已选中【 ' + toDownloadList.length + ' 】个文件，' + (totalMb > warnMb
              ? ('待准备文件列表大小为【 ' + totalMb.toFixed(2) + 'MB 】,文件较大，建议您分批次准备。')
              : ('待准备文件列表大小为【 ' + (totalMb > 1 ? totalMb.toFixed(2) + 'MB' : totalKb.toFixed(2) + 'KB') + ' 】。')) + '准备完成后会在右上角提示您下载!',
          '提示',
          {
            confirmButtonText: '准备',
            cancelButtonText: '取消',
            type: totalMb > warnMb ? 'danger' : 'primary'
          }).then(() => {
        this.loading.downloadLoading = true
        newDownloadTask(
            this.userInfo.email,
            toDownloadList.map(item => {
              return {
                fileIndex: item.index,
                fileNeid: item.neid,
                fileName: item.filename
              }
            })
        ).then(resp => {
          const taskId = resp.obj;
          this.$store.dispatch('downloadStatus/setVisible', true)
          this.$notify.success({
            title: '提示',
            message: '成功创建下载任务'
          })
          let timer = 0
          timer = setInterval(function () {
            downloadTaskStatus(taskId).then(resp => {
              if (resp.obj && resp.obj.finishTime) {
                _this.$notify.success({
                  title: '任务下载提示',
                  message: '您有一个下载任务【' + getFileNameWithoutExtension(resp.obj.taskName) + '.zip】已准备好！'
                })
                clearInterval(timer)
                _this.$store.dispatch('downloadStatus/setVisible', false)
              }
            })
          }, 2 * 1000)
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消下载'
          })
        }).finally(() => {
          this.loading.downloadLoading = false
        })
      })
    },
    sortFilter(value) {
      if (value.type === 'sort') {
        // if(this.sortRegular.sort.sortName === value.sortName) {
        //     this.sortRegular.sort = {}
        // }else {
        this.sortRegular.sort = value
        // }
      } else {
        // if(this.sortRegular.regular === value.regularName) {
        //     this.sortRegular.regular = {}
        // }else {
        this.sortRegular.regular = value
        // }
      }
      this.handleListLenovoDir(this.toReachPath, {
        orderBy: 'name',
        sort: this.sortRegular.sort.sortName,
        filter: this.filterRegular.filterName
      })
    },
    filterTerm(value) {
      // if(this.filterRegular.filterName === value.name) {
      //     this.filterRegular = {}
      // }else {
      this.filterRegular = value
      // }
      this.handleListLenovoDir(this.toReachPath, {
        orderBy: 'name',
        sort: this.sortRegular.sort.sortName,
        filter: this.filterRegular.filterName
      })
    },
    handleClickDirPath(item, index) {
      this.isListMode = true
      let toReachPath = ''
      for (let i = 0; i <= index; i++) {
        toReachPath = toReachPath + '/' + this.dir.currentPath[i]
      }
      this.toReachPath = toReachPath === '' ? '/' : toReachPath
      const filterParams = {
        orderBy: 'name',
        sort: this.sortRegular.sort.sortName,
        filter: this.filterRegular.filterName
      }
      this.handleListLenovoDir(toReachPath === '' ? '/' : toReachPath, filterParams)
    },
    handleDirectoryTypeSelected(type) {
      this.directoryType = type
      this.handleGoRootPath()
      const table = document.querySelector('#toSortTable .el-table__body-wrapper tbody')
      const self = this
      if (table) {
        Sortable.create(table, {
          onEnd({
                  newIndex,
                  oldIndex
                }) {
            const targetRow = self.toCreateAlbum.list.splice(oldIndex, 1)[0]
            self.toCreateAlbum.list.splice(newIndex, 0, targetRow)
          }
        })
      }
    },
    handleListLenovoDir(path, filterParams) {
      this.dir.loadingDir = true
      if (this.directoryType.length === 0) {
        return
      }
      if (!filterParams) {
        filterParams = {
          orderBy: 'name',
          sort: this.sortRegular.sort.sortName,
          filter: this.filterRegular.filterName
        }
      }
      const {
        orderBy,
        sort,
        filter
      } = filterParams
      this.toReachPath = path
      getFileMetadata(this.directoryType, path, '', orderBy, sort, filter).then(response => {
        if (response.code === '0') {
          this.curDirNeid = response.obj.neid
          this.curDirAdminUser = response.obj.adminUser
          console.log('current dir neid:' + this.curDirNeid)
          this.dir.tableData = []
          this.dir.largeImgModeData = []
          this.wordListSelected = []
          this.parentDirId = response.obj.neid
          if (response.obj.content) {
            response.obj.content.forEach(item => {
              item.joyeaDesc = ''
              item.isModify = false
              if (item.mime_type && item.mime_type === 'word' && !this.userInfo.isAdmin) {
              } else {
                this.dir.tableData.push(item)
                if (item.mime_type && item.mime_type.startsWith('image')) {
                  this.dir.largeImgModeData.push(item)
                }
              }
            })
            this.dir.currentPath = []
            response.obj.path.split('/').forEach(item => {
              if (item.length !== 0) {
                this.dir.currentPath.push(item)
              }
            })
          }
        } else {
          this.$notify.error({
            title: '提示',
            message: '文件夹列表获取失败'
          })
          console.log('文件夹列表获取失败' + response.msg)
        }
        this.dir.loadingDir = false
      }).finally(() => {
        // 2021.11.20-侍-要求点开文件夹回到顶部！
        document.getElementById('build').scrollTop = 0
      })
    },

    handleAddAdmin(row) {
      if (this.curEditAdminNeid !== row.neid) {
        this.curEditAdminNeid = row.neid
      } else {
        this.curEditAdminNeid = ''
      }
    },

    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleClickDirItem(row, column, cell) {
      if (column && column.label === '管理员') return
      this.curEditAdminNeid = ''
      this.visible.searchDialogVisible = false
      if (row.is_dir) {
        const filterParams = {
          orderBy: 'name',
          sort: this.sortRegular.sort.sortName,
          filter: this.filterRegular.filterName
        }
        this.toReachPath = row.path
        this.handleListLenovoDir(row.path, filterParams)
      } else {
        this.handleGoToPreview(row)
      }
    },
    handleClickSearch(row, column, event) {
      if (row.is_dir) {
        this.directoryType = 'LENOVO'
        this.handleClickDirItem(row)
      }
    },
    handleGetTopSearchKey() {
      getTopSearchKey().then(resp => {
        this.topSearchKey = resp.data
      })
    },
    handleFilterCurDirWordList() {
      this.handleGetMyWordList()
      this.dir.tableData.forEach(item => {
        if (item.mime_type && item.mime_type.startsWith('word')) {
          this.wordListSelected.push({
            id: item.neid,
            title: item.path
          })
        }
      })
    },
    handleAddWordListRow(row) {
      const existedList = this.wordListSelected.filter(function (item) {
        return item.id === row.id
      })
      if (existedList.length > 0) {
        this.$notify.error({
          title: '提示',
          message: '请勿重复添加！'
        })
      } else {
        this.wordListSelected.push(row)
      }
    },
    handleDeleteWordListRow(row) {
      this.wordListSelected = this.wordListSelected.filter(function (item) {
        return item.id !== row.id
      })
    },
    handleSaveWordToDir() {
      addWordToDir(this.curDirNeid, this.wordListSelected).then(resp => {
        if (resp.code === 2000) {
          this.visible.addWordDialogVisible = false
          this.handleRefreshDir()
        } else {
          this.$notify.error({
            title: '提示',
            message: '保存小白板失败！'
          })
        }
      })
    },
    handleRefreshDir() {
      this.handleClickDirPath(undefined, this.dir.currentPath.length - 1)
    },
    handleGetMyWordList() {
      this.wordListLoading = true
      getMyWordList(this.wordListSearchText, this.wordListPageSize, this.wordListPageNum - 1).then(resp => {
        this.wordListOption = resp.data.data
        this.wordListTotal = resp.data.total
        // this.wordListPageSize = resp.data.pageSize;
        this.wordListPageNum = resp.data.pageNum + 1
      }).finally(() => {
        this.wordListLoading = false
      })
    },
    handleGoRootPath() {
      this.isListMode = true
      const filterParams = {
        orderBy: 'name',
        sort: this.sortRegular.sort.sortName,
        filter: this.filterRegular.filterName
      }
      if (this.directoryType === 'SELF') {
        this.handleListLenovoDir('/', filterParams)
      } else {
        this.handleListLenovoDir('/营销素材展示', filterParams)
      }
    },
    handleBackMenuPath() {
      this.isListMode = true
      if (this.dir.currentPath.length === 0) {
        this.directoryType = ''
      } else if (this.dir.currentPath.length === 1) {
        this.handleGoRootPath()
      } else {
        this.handleClickDirPath(undefined, this.dir.currentPath.length - 2)
      }
    },
    handleAddSrcToPrivateDir(item) {
      newPrivateDirSrc(this.curDirNeid, item.path).then(resp => {
        if (resp.code === '0') {
          this.visible.addSrcVisible = false
          this.$message.success('添加文件成功！')
          this.visible.searchDialogVisible = false
          this.handleRefreshDir()
        } else {
          this.$message.error('添加文件失败：' + resp.msg)
        }
      })
    },
    batchAddSrcToPrivateDir(multiRow) {
      batchNewPrivateDirSrc(this.curDirNeid, multiRow.map(item => item.path)).then(resp => {
        if (resp.code === '0') {
          this.visible.addSrcVisible = false
          this.$message.success('批量添加文件成功！')
          this.handleRefreshDir()
        } else {
          this.$message.error('添加文件失败: ' + resp.msg)
        }
      })
    },
    handleUpdateAlias(index, row) {
      this.$prompt('请输入要修改的文件名', '修改提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: row.file_name
      }).then(({value}) => {
        if (!value || value.length <= 0) {
          this.$message.error('名字不能未空！')
          return
        }
        if (value.indexOf('/') > 0) {
          this.$message.error('名字不能含有字符【/】！')
          return
        }
        updateSrcAlias(this.curDirNeid, row.neid, value).then(resp => {
          if (resp.code === '0') {
            this.$message.success('修改成功！')
            row.file_name = value
          }
        })
      }).catch(() => {
      })
    }
  },
  mounted() {
    const redirectPath = window.localStorage.getItem('redirectPath')
    if (redirectPath) {
      const redirectObj = JSON.parse(redirectPath)
      this.directoryType = redirectObj.type
      this.handleListLenovoDir(redirectObj.path, {
        orderBy: 'name',
        sort: this.sortRegular.sort.sortName,
        filter: this.filterRegular.filterName
      })
      setTimeout(() => {
        window.localStorage.removeItem('redirectPath')
      }, 5000)
    } else {
      // this.handleGoRootPath();
    }
    const toEditList = this.$route.params.toEditList
    if (toEditList) {
      this.toCreateAlbum.idEditMode = true
      this.toCreateAlbum.name = toEditList.name
      this.toCreateAlbum.editListId = toEditList.id
      toEditList.list.forEach(src => {
        // 注意这里直接使用.，视图会不更新，一定要使用this.$set
        this.$set(src, 'joyeaDesc', src.desc)
        this.$set(src, 'isModify', false)
        this.toCreateAlbum.list.push(src)
      })
    }
    this.handleGetTopSearchKey()
    const queryParams = this.$route.query
    if (queryParams && queryParams.directoryType && queryParams.directoryType.trim().length > 0) {
      this.directoryType = queryParams.directoryType
      this.handleGoRootPath()
    }
    const _this = this
    this.$EventBus.$on('switchSpace', function (data) {
      _this.directoryType = data
      if (data && data.trim().length > 0) {
        _this.handleGoRootPath()
      }
    })
    const nextPlusToken = getQueryParam('access_token')
    if (nextPlusToken) {
      localStorage.setItem('nextx_token', nextPlusToken)
    }
  },
  unmounted() {
  }
}
</script>

<style lang="scss" scoped>
@import "../../../style/vars";

.px10_divider {
  padding: 10px;
}

.input-with-select .el-input-group__prepend {
  background-color: #fff;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  padding: 5px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}

.no_display {
  display: none;
}

.qdbj_list_tit {
  padding: 1px;
  background-color: #CFCFCF;
  font-weight: bold;
  border-radius: 5px 5px 0 0;
  padding: 0 10px;
  line-height: 40px;
  box-sizing: border-box;
}

.load_more_bt {
  margin-top: 5px;
  /*width: 100%;*/
  .grey-btn {
    background-color: #CFCFCF;
  }
}

.qd_list_btns {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .el-button {
    border: none;
    font-size: 16px;
    padding: 8px 16px;
  }
}

.adminContentHead {
  font-size: 12px;
  color: gray;
  margin: 10px auto;
  line-height: 30px;
  background-color: #ffffff;

  .el-col {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    align-self: flex-end;

    span {
      flex: none;
    }
  }

  .el-col:nth-of-type(2) {
    justify-content: flex-end;
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

.common-btn-style {
  background-color: rgba(244, 245, 247, 1);
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  margin-right: 10px;
  border-radius: 15px;
  line-height: 30px;
}

.content_div {
  flex-direction: column;
  /*height: 100vh;*/
  /*overflow: hidden;*/
  .qingdan_table {
    /*flex: 1;*/
    /*overflow: auto;*/
    /*max-height: calc(100% - 200px);*/
  }
}

.box-card {
  width: 220px;
  height: 220px;
}

.menu-content {
  margin: 20px auto;
  height: 225px;
  width: 225px;
  background-image: linear-gradient(to bottom right, #ffffff, #c7c7c7);
  text-align: center;
  box-shadow: 4px 4px 2px #888888;
}

.el-icon-folder-opened {
  color: #fec04a;
}

.el-col-lg-4-8 {
  width: 20%;
}

.main-tools {
  padding: 10px $--main-padding 0 $--main-padding;
  background: #E9E9E9;
}

.directory-tools {
  display: flex;
  background-color: #ffffff;

  .el-button {
    border: none;
    font-size: 16px;
  }
}

.flex {
  display: flex;
}

.aic {
  align-items: center;
}

.jcc {
  justify-content: center;
}

.jcb {
  justify-content: space-between;
}

.color_back {
  color: #F6891F;
}

.ml19 {
  margin-left: 19px;
}

::v-deep.el-button .el-icon-plus {
  font-weight: bold !important;
}

::v-deep.el-dropdown-menu__item {
  background-color: white !important;
  color: #606266 !important;
}

.el-button {
  display: flex;
  align-items: center;
  border-radius: 0;
}

.search-button {
  border-radius: 3px;
}

.file-icon {
  .iconfont-color {
    font-size: 30px;
  }
}

.main-file-name {
  color: #181818;
  font-size: 14px;
  font-family: Microsoft YaHei UI-Regular, Microsoft YaHei UI;
  font-weight: 400;
  vertical-align: center;
}

.content_main {
  box-sizing: border-box;
  background-color: #F4F5F7;
  padding: 16px 40px;
  display: flex;
  justify-content: center;
  height: calc(100vh - 160px);
  overflow: hidden;

  .left-area {
    width: 14%;
    float: left;
    padding: 10px;
    background-color: #ffffff;
    border-radius: 5px 0 0 0;
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .directory-tree {
      overflow: auto;
    }
  }

  .center-area {
    float: left;
    width: calc(69.5% - 30px);
    padding: 10px;
    margin-right: 20px;
    border-left: 1px solid #e6e6e6;
    background-color: #ffffff;
    border-radius: 0 5px 0 0;
    height: calc(100% - 20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .el-table {
      overflow: auto;

      &:before {
        display: none;
      }
    }

    ::v-deep thead tr th {
      border-top: 1px solid #EBEEF5;
      padding: 4px 0;
      position: relative;

      .cell {
        border-right: 1px solid #EBEEF5;
      }
    }

    ::v-deep thead tr th:nth-last-of-type(1) {
      .cell {
        border-right: none !important;
      }
    }
  }

  .right-area {
    float: right;
    width: 16.5%;
    max-height: calc(100vh - 160px);

    .content_div {
      height: 100%;
    }

    .right-table-btn {
      background-color: #ffffff;
      display: flex;
      flex-direction: column;
      /*max-height: calc(100vh - 242px);*/
      height: 100%;
      padding-bottom: 10px;
      overflow: hidden;
      border-radius: 0 0 5px 5px;

      .el-table {
        flex: 1;
        overflow: hidden;

        &::before {
          display: none;
        }

        ::v-deep.el-table--scrollable-y .el-table__body-wrapper {
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
      }
    }
  }

  /*}*/
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
}
</style>
