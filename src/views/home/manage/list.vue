<template>
    <div style="padding: 10px 80px 0 80px;">
        <el-empty v-if="albumList.length === 0" :image-size="200" description="您暂时没有创建的清单！"></el-empty>
        <section v-else style="padding: 10px">
            <!--工具条-->
            <el-input placeholder="输入清单名称查找" v-model="search.key" class="input-with-select px10_divider"
                      style="display: none">
                <el-button slot="append" icon="el-icon-search" v-on:click="handleSearch"></el-button>
            </el-input>

            <div class="px10_divider">
                <el-card v-for="(album,index) in albumList" style="margin-bottom: 10px" :key="index">
                    <div slot="header" class="clearfix">
                        <span style="color: #fff;font-weight:bold;">{{ album.name }}</span>
                        <span style="float: right">
                        <el-button icon="el-icon-delete" circle size="mini" @click="handleDelete(index)"/>
                        <el-button icon="el-icon-download" circle size="mini" @click="handleDownloadSrc(true,album)"/>
                        <el-button icon="el-icon-edit" circle size="mini" @click="handleEdit(index)"/>
                    </span>
                    </div>
                    <el-row>
                        <el-col :md="8" :xs="24" v-for="(img,fileIndex) in album.list" :key="fileIndex">
                            <el-card style="padding: 2px;margin: 5px;text-align:center;height: 273px;">
                                <img v-if="img.mime_type.startsWith('video')" :src="handleGetDocumentImage(img.mime_type)"
                                     @click="handleGoToPreview(img)" class="album_img">
                                <img v-else-if="img.mime_type.startsWith('doc')"
                                     :src="handleGetDocumentImage(img.mime_type)"
                                     @click="handleGoToPreview(img)" class="album_img">
                                <img v-else-if="img.mime_type.startsWith('image')" :src="img.url"
                                     class="album_img" :onerror="defaultImg" :preview="album.name"
                                     :preview-text="'解说词：' + (img.desc.length === 0 ? '暂未设置解说词' :img.desc)">
                                <img v-else :src="handleGetDocumentImage(img.mime_type)" @click="handleGoToPreview(img)" class="album_img">
                                <div style="height: 20px;margin-top: 10px">
                                    <el-tooltip class="item" effect="dark"
                                                :content="img.desc.length === 0 ? '暂未设置解说词' : img.desc"
                                                placement="bottom">
                                        <!--                                    <span class="svg_name">{{img.desc.length > 30 ?-->
                                        <!--                                        img.desc.substr(0,30) + "..." : (img.desc.length === 0 ? '暂未设置解说词' : img.desc)}}</span>-->
                                        <span class="svg_name">{{ getFilenameByPath(img.path) }}</span>
                                    </el-tooltip>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-card>
            </div>
            <el-dialog :title="toPlayVideo.title" :visible.sync="visible.videoDialogVisible" @close="handleCloseVideo"
                       @opened="playVideo()">
                <video id="myVideo" class="video-js vjs-big-play-centered vjs-fluid" oncontextmenu="return false">
                    <p class="vjs-no-js">
                        To view this video please enable JavaScript, and consider upgrading to a
                        web browser that
                        <a href="https://videojs.com/html5-video-support/" target="_blank">
                            supports HTML5 video
                        </a>
                    </p>
                </video>
            </el-dialog>
        </section>
    </div>
</template>

<script>

import api, { newDownloadTask, downloadTaskStatus, findMyAlbumList, deleteAlbum } from '../../../api'
import { getDocumentImage, getFileNameWithoutExtension } from '@/utils/JoyeaUtil'
import genSrcPreviewUrl from '../../../utils'
import videojs from 'video.js'
import { mapGetters } from 'vuex'

export default {
    name: 'list',
    data () {
        return {
            domain: window.location.protocol + '//' + window.location.host,
            search: {
                key: ''
            },
            visible: {
                videoDialogVisible: false,
            },
            toPlayVideo: {
                title: '',
                url: ''
            },
            player: null,
            albumList: [],
            defaultImg: 'this.src="' + require('@assets/error.png') + '"' //默认图地址
        }
    },
    computed: {
        ...mapGetters({
            'userInfo': 'userInfo/userInfo'
        })
    },
    methods: {
        getFilenameByPath (path) {
            let paths = path.split('/')
            return paths[paths.length - 1]
        },
        handleCloseVideo () {
            if (this.player != null) {
                this.player.pause()
            }
        },
        playVideo () {
            let _this = this
            if (this.player == null) {
                videojs(document.getElementById('myVideo'), {
                    controls: true, // 是否显示控制条
                    preload: 'auto',
                    autoplay: false,
                    fluid: true, // 自适应宽高
                    language: 'zh-CN', // 设置语言
                    muted: false, // 是否静音
                    inactivityTimeout: false,
                    controlBar: { // 设置控制条组件
                        children: [
                            { name: 'playToggle' }, // 播放按钮
                            { name: 'currentTimeDisplay' }, // 当前已播放时间
                            { name: 'progressControl' }, // 播放进度条
                            { name: 'durationDisplay' }, // 总时间
                            {
                                name: 'volumePanel', // 音量控制
                                inline: false, // 不使用水平方式
                            },
                            { name: 'FullscreenToggle' } // 全屏
                        ]
                    },
                    sources: [ // 视频源
                        {
                            src: _this.toPlayVideo.url,
                            type: 'video/mp4',
                        }
                    ]
                }, function () {
                    _this.player = this
                })
            } else {
                const data = {
                    src: _this.toPlayVideo.url,
                    type: 'video/mp4'
                }
                this.player.pause()
                this.player.src(data)
                this.player.load(data)
                this.player.play()
            }
        },
        handlePlayVideo (url, title) {
            this.visible.videoDialogVisible = true
            this.toPlayVideo.url = url
            this.toPlayVideo.title = title
        },
        handleGoToPreview (row) {
            let previewType = 'pic'    // if video is av
            if (row.mime_type.startsWith('doc')) {
                previewType = 'doc'
            } else if (row.mime_type.startsWith('video')) {
                previewType = 'av'
            }
            let url = genSrcPreviewUrl(row.neid, row.hash, row.rev, previewType, this.userInfo.token)
            if (row.mime_type.startsWith('video')) {
                this.handlePlayVideo(url, row.path.substr(row.path.lastIndexOf('/') + 1),)
            } else if (row.mime_type.startsWith('doc')) {
                window.open(url)
            } else {
                this.$message.error('暂不支持的预览类型！')
            }
        },
        handleGetDocumentImage (mimeType) {
            return getDocumentImage(mimeType)
        },
        handleSearch () {

        },
        listAlbum () {
            findMyAlbumList().then(resp => {
                this.albumList = []
                resp.list.forEach(list => {
                    let imgUrl = []
                    list.src.forEach(src => {
                        imgUrl.push({
                            url: genSrcPreviewUrl(src.srcNeid),
                            desc: src.srcDesc,
                            path: src.srcPath,
                            neid: src.srcNeid,
                            filename: src.srcFileName,
                            bytes: src.srcBytes,
                            mime_type: src.srcType
                        })
                    })
                    this.albumList.push({
                        id: list.albumId,
                        name: list.albumName,
                        shared: list.shared,
                        list: imgUrl
                    })
                })
            })
        },
        handleDelete (index) {
            this.$alert('即将删除清单【 ' + this.albumList[index].name + ' 】！', '删除提示', {
                confirmButtonText: '删除',
                callback: action => {
                    if (action === 'confirm') {
                        deleteAlbum(this.albumList[index].id).then(resp => {
                            this.$message.success('清单【 ' + this.albumList[index].name + ' 】删除成功！')
                            this.albumList.splice(index, 1)
                        }).catch(() => {
                            this.$notify.error({
                                title: '提示',
                                message: '清单【 ' + this.albumList[index].name + ' 】删除失败！'
                            })
                        })
                    }
                }
            })
        },
        handleDownloadSrc (isList, row) {
            let _this = this
            let toDownloadList = []
            let totalBytes = 0
            if (isList) {
                let index = 0
                row.list.forEach(src => {
                    totalBytes += src.bytes
                    toDownloadList.push({
                        index: index += 1,
                        filename: src.path.substr(src.path.lastIndexOf('/') + 1),
                        rev: src.rev,
                        neid: src.neid,
                        path: src.path.replace('+', '%2b'),
                        path_type: src.path_type
                    })
                })
            } else {
                toDownloadList.push({
                    filename: row.path.substr(row.path.lastIndexOf('/') + 1),
                    rev: row.rev,
                    neid: row.neid,
                    path_type: row.path_type
                })
            }
            let totalKb = totalBytes / 1024
            let totalMb = totalKb / 1024
            let warnMb = 300
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
                //this.loading.fullscreenLoading = true;
                newDownloadTask(this.userInfo.email,
                    toDownloadList.map(item => {
                            return {
                                fileIndex: item.index,
                                fileNeid: item.neid,
                                fileName: item.filename
                            }
                        }
                    ),
                    row.id
                ).then(response => {
                    let taskId = response.obj
                    console.log('获取到下载ID：' + taskId)
                    this.$store.dispatch('downloadStatus/setVisible', true)
                    this.$notify.success({
                        title: '提示',
                        message: '成功创建下载任务'
                    })
                    let timer = 0
                    timer = setInterval(function () {
                        downloadTaskStatus(taskId).then(response => {
                            if (response.obj && response.obj.finishTime) {
                                _this.$notify.success({
                                    title: '任务下载提示',
                                    message: '您有一个下载任务【' + getFileNameWithoutExtension(response.obj.taskName) + '.zip】已准备好！'
                                })
                                clearInterval(timer)
                                _this.$store.dispatch('downloadStatus/setVisible', false)
                            }
                        })
                    }, 2 * 1000)
                })
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消下载'
                })
            })
        },
        handleEdit (index) {
            console.log(this.albumList[index])
            this.$alert('你即将前往编辑页面，编辑【 ' + this.albumList[index].name + ' 】清单', '提示', {
                confirmButtonText: '确定',
                callback: action => {
                    if (action === 'confirm') {
                        this.$router.push({
                            name: 'build',
                            params: {
                                toEditList: this.albumList[index]
                            }
                        })
                    }
                }
            })
        }
    },
    mounted () {
        this.listAlbum()
    }
}
</script>

<style scoped lang="scss">

.album_img {
    height: 200px;
}

.px10_divider {
    margin-top: 10px;
}

#list {
    overflow-x: auto;
    list-style: none;
    white-space: nowrap;
    width: auto;
}

::-webkit-scrollbar {
    width: 0 !important
}

.svg_name {
    white-space: normal;
    color: #606266;
    font-weight: 500;
    font-size: 14px;
}

.item {
    display: inline-block;
    padding-right: 20px;
    //width: 80%;
}

ul {
    margin-block-start: 0;
    margin-block-end: 0;
    padding-inline-start: 20px;
}

.no_display {
    display: none;
}

</style>