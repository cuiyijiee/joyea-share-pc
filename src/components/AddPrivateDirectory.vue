<template>
    <span style="margin-left: 10px">
        <el-popover
            placement="bottom" width="320"
            v-model="visible.addPrivateDirVisible">
            <el-input v-model="newPrivateDirName"></el-input>
            <div style="text-align: right; margin: 5px 0 0 0">
                <el-button size="mini" type="text" @click="visible.addPrivateDirVisible = false">取消</el-button>
                <el-button type="primary" size="mini" @click="handleAddPrivateDir">确定</el-button>
            </div>
            <el-button
                slot="reference"
                style="margin-right: 10px"
                class="search-button btn-icon-class" size="small">
                <span>
                    <img
                        style="width: 16px; height: 16px; margin-right: 5px"
                        src="../assets/icon_add_directory.svg"/>
                    新建目录
                </span>
            </el-button>
        </el-popover>
    </span>
</template>

<script>

import {newPrivateDir} from "@/api";

export default {
    name: "AddPrivateDirectory",
    props: ['curDirNeid'],
    data() {
        return {
            newPrivateDirName: "",
            visible: {
                addPrivateDirVisible: false
            }
        }
    },
    methods: {
        handleAddPrivateDir() {
            if(this.newPrivateDirName.trim().length <= 0) {
                this.$message.error("新建文件夹名称不能为空！");
                return;
            }
            if(this.newPrivateDirName.indexOf("/") >= 0) {
                this.$message.error("文件夹名称不能含有符号 / ！");
                return;
            }
            newPrivateDir(this.curDirNeid, this.newPrivateDirName).then(resp => {
                if(resp.code === '0') {
                    this.$message.success("目录添加成功！");
                    this.visible.addPrivateDirVisible = false;
                    this.newPrivateDirName = "";
                    this.$emit('onAddSuccess');
                }else{
                    this.$message.success("目录添加失败：" + resp.msg);
                }
            })
        },
    },
    created() {
    }
}
</script>

<style scoped lang="scss">
.el-button {
    border-radius: 0;
}
</style>
