<template>
  <div>
    <el-upload
      class="upload-demo"
      ref="upload"
      action="https://jsonplaceholder.typicode.com/posts/"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :file-list="fileList"
      :auto-upload="false">
      <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
      <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
      <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: 'Test',
  data () {
    return {
      fileList: []
    }
  },
  methods: {
    handleRedirect () {
      let requestUrl = 'http://223.240.79.0:8002//speech-api/v1/pb/third/login'
      let channel = 'zhyl'
      let domainUrl = 'http://10.186.100.90:8001/'
      let userId = '18326616992'
      let secretKey = 'xPufPiNUNinUy69B'

      let timestamp = new Date().getTime()
      let query = `channel=${channel}&domainUrl=${domainUrl}&timestamp=${timestamp}&userid=${userId}`
      let queryValue = `${channel}${domainUrl}${timestamp}${userId}${secretKey}`
      let url = `${requestUrl}?${query}&sign=${this.$md5(queryValue)}`
      console.log(url)
      window.location.href = url
    },
    submitUpload () {
      this.$refs.upload.submit()
      console.log('submit upload!')
      console.log(this.fileList)
    },
    handleRemove (file, fileList) {
      console.log(file, fileList)
    },
    handlePreview (file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var arrayBuffer = reader.result;
        // 将这四个字节的内容，视作一个32位整数
        var view = new DataView(arrayBuffer);
        var magic0 = view.getInt8(0) & 0xff;
        var magic1 = view.getInt8(1) & 0xff;
        var magic2 = view.getInt8(2) & 0xff;
        var magic3 = view.getInt8(3) & 0xff;
        if((magic0 === 132 || magic0 === 135 || magic0 === 136) && magic1 === 125 && magic2 === 28) {
          console.log("the file is encrypted!")
        }else{
          console.log("the file not encrypted!")
        }
      }
      console.log("onload2")
      reader.readAsArrayBuffer(file.raw);
      console.log("onload3")
    },
  }
}
</script>

<style scoped>

</style>
