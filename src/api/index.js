import axios from 'axios'
import store from "@/store";
import constants from "@/constants";
import router from "@/router";
import {Message} from "element-ui";

// 创建axios实例
const service = axios.create({
    timeout: 60 * 60 * 1000 // 请求超时时间
});

service.interceptors.request.use(config => {
    if (store.state.userInfo.token) {
        config.headers['X-TOKEN'] = store.state.userInfo.token;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

service.interceptors.response.use(config => {
    if (config.data) {
        switch (config.data.code) {
            case constants.USER_NOT_AUTH_CODE:
                Message.error("用户信息过期，请重新登录！");
                router.push('/login');
        }
    }
    return config;
}, error => {
    return Promise.reject(error);
})

export default function api(params) {
    return service.post('api', params).then(res => {
        return res.data;
    })
}

export function loginV2(user, pwd) {
    return service.post('apiv2/user/login', {
        username: user, password: pwd
    }).then(res => {
        return res.data;
    })
}

export function getTopSearchKey() {
    return service.get('apiv2/lenovo/topSearch').then(res => {
        return res.data;
    })
}

export function findUploadRecord(curPage, pageSize) {
    return service.post('api/v1/upload/get', {
        curPage, pageSize
    }).then(res => {
        return res.data;
    })
}

export function uploadRecordManage(recordId, allow, refuseReason, uploadPath, uploadPathNeid, srcName, needCount, integral) {
    let data = {
        recordId,
        allow: allow,
        refuseReason: refuseReason,
        uploadPath: uploadPath,
        uploadPathNeid: Number(uploadPathNeid),
        srcName: srcName,
        needCount: needCount,
        integral: integral
    };
    return service.post('api/v1/upload/manage', data).then(res => {
        return res.data;
    })
}

export function uploadFile(file, fileDesc) {

    let formData = new FormData();
    formData.append('file', file)
    formData.append('srcDesc', fileDesc)

    //设置请求头
    let config = {
        headers: {'Content-Type': 'multipart/form-data'}, onUploadProgress: progressEvent => {
            let completed = (progressEvent.loaded / progressEvent.total * 100 | 0) + "%";
            console.log(completed)
        }
    };

    return service.post('upload', formData, config).then(res => {
        return res.data;
    })
}

export function newDownloadTask(userId,fileList,albumId) {
    return service.post("apiv2/download/task/new", {
        albumId: albumId,
        userId:userId,
        downloadTaskItems: fileList
    }).then(resp => {
        return resp.data;
    })
}

export function downloadTaskStatus(taskId) {
    return service.post("apiv2/download/task/status", {
        taskId: taskId
    }).then(resp => {
        return resp.data;
    })
}

export function getTodayDownload(userId) {
    return service.post("apiv2/download/task/today", {
        userId
    }).then(resp => {
        return resp.data;
    })
}

export function queryFileAlready(neid) {
    return service.post("apiv2/download/file/already", {
        neid
    }).then(resp => {
        return resp.data;
    })
}

export function getMyWordList(search, pageSize, pageNum) {
    return service.post("apiv2/esunyun/myword", {
        search: search, pageSize: pageSize, pageNum: pageNum
    }).then(resp => {
        return resp.data;
    })
}

export function addWordToDir(neid, wordList) {
    return service.post("api/v1/word/add", {
        neid: neid, word: wordList
    }).then(resp => {
        return resp.data;
    })
}

export function previewFile(neid) {
    return service.get("apiv2/preview?neid=" + neid)
        .then(resp => {
            return resp.data;
        })
}

export function addRedirectPath(path, directoryType) {
    return service.get("apiv2/addRedirectPath?path=" + path + "&type=" + directoryType)
        .then(resp => {
            return resp.data;
        })
}

export function addTranscodeVideo(neid) {
    return service.post("apiv2/transcode/insert", {
        neid: neid
    }).then(resp => {
        return resp.data;
    })
}

export function deleteTranscodeVideo(id) {
    return service.post("apiv2/transcode/delete", {
        id: id
    }).then(resp => {
        return resp.data;
    })
}

export function listTranscodeVideo(fileName, pageNum, pageSize) {
    return service.post("apiv2/transcode/list", {
        fileName: fileName, pageNum: pageNum, pageSize: pageSize,
    }).then(resp => {
        return resp.data;
    })
}

export function getFileMetadata(directoryType, path, parentDirId,orderBy, sort,filter) {
    return service.post("apiv2/lenovo/fileMetadata", {
        directoryType: directoryType, path: path, parentDirId: parentDirId,orderBy, sort,filter
    }).then(resp => {
        return resp.data;
    })
}

export function ftsSearch(searchKey, offset, limit, searchType, searchOrderType) {
    return service.post("apiv2/lenovo/ftsSearch", {
        searchKey: searchKey, offset: offset, limit: limit,
        searchType: searchType, searchOrderType: searchOrderType
    }).then(resp => {
        return resp.data;
    })
}

export function newPrivateDir(parentDirId, dirName) {
    return service.post("apiv2/privateDir/new", {
        parentDirId: parentDirId, dirName: dirName
    }).then(resp => {
        return resp.data;
    })
}

export function removePrivateDir(dirId) {
    return service.post("apiv2/privateDir/remove", {
        dirId: dirId
    }).then(resp => {
        return resp.data;
    })
}

export function newPrivateDirSrc(parentDirId, srcPath) {
    return service.post("apiv2/privateDir/newSrc", {
        parentDirId: parentDirId, srcPath: srcPath
    }).then(resp => {
        return resp.data;
    })
}

export function batchNewPrivateDirSrc(parentDirId, srcPaths) {
    return service.post("apiv2/privateDir/batchNewSrc", {
        parentDirId: parentDirId, srcPaths: srcPaths
    }).then(resp => {
        return resp.data;
    })
}

export function removePrivateDirSrc(parentDirId, neid) {
    return service.post("apiv2/privateDir/removeSrc", {
        parentDirId: parentDirId, neid: neid
    }).then(resp => {
        return resp.data;
    })
}

export function updateSrcAlias(parentDirId, neid, alias) {
    return service.post("apiv2/privateDir/updateAlias", {
        parentDirId: parentDirId, neid: neid, alias: alias
    }).then(resp => {
        return resp.data;
    })
}

export function renamePrivateDir(dirId, newDirName) {
    return service.post("apiv2/privateDir/rename", {
        dirId: dirId, newDirName: newDirName,
    }).then(resp => {
        return resp.data;
    })
}

export function listJoyeaUser(joyeaName) {
    return service.post("apiv2/joyeaUser/list", {
        joyeaName: joyeaName,
    }).then(resp => {
        return resp.data;
    })
}

export function updatePrivateDirectoryAdmin(dirId, admins) {
    return service.post("apiv2/privateDir/updateAdmin", {
        dirId: dirId, admins: admins,
    }).then(resp => {
        return resp.data;
    })
}

export function getRootDirectory() {
    return service.post("apiv2/directory/root", {}).then(resp => {
        return resp.data;
    })
}

export function getChildDirectory(directoryType, parentDirId) {
    return service.post("apiv2/directory/child", {
        directoryType: directoryType, parentDirId: parentDirId
    }).then(resp => {
        return resp.data;
    })
}
