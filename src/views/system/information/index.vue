<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="新闻标题" prop="title">
        <el-input
            v-model="queryParams.title"
            placeholder="请输入新闻标题"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input
            v-model="queryParams.author"
            placeholder="请输入作者"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="新闻简介" prop="summary">
        <el-input
            v-model="queryParams.summary"
            placeholder="请输入新闻简介"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:info:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:info:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:info:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="编号" align="center" prop="infoId" />
      <el-table-column label="新闻标题" align="center" prop="title" />
      <el-table-column label="作者" align="center" prop="author" />
      <el-table-column label="新闻简介" align="center" prop="summary">

      </el-table-column>
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:info:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:info:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改资讯对话框 -->
    <el-dialog :title="title" v-model="open" width="800px" append-to-body>
      <el-form ref="infoRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="新闻标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入新闻标题" />
        </el-form-item>
        <el-form-item label="新闻图片" prop="image">
          <!-- 资讯图片上传组件 -->
          <el-upload
              multiple
              :before-upload="handleImageUpload"
              list-type="picture-card"
              :file-list="imageFileList"
              :on-remove="handleImageRemove"
              :auto-upload="true"
              :on-preview="handlePictureCardPreview"
          >
            <el-icon class="avatar-uploader-icon"><plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="新闻内容" prop="content">
          <!-- 富文本编辑器组件 -->
          <el-form-item>
            <editor v-model="form.content" :min-height="192"/>
          </el-form-item>
        </el-form-item>
      </el-form>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入新闻作者" />
      </el-form-item>
      <el-form-item label="新闻简介" prop="summary">
        <el-input v-model="form.summary" placeholder="请输入新闻简介" />
      </el-form-item>
      <el-form-item label="租户" prop="tenant">
        <el-input v-model="form.tenant" placeholder="请输入租户" />
      </el-form-item>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Info">
import { listInfo, addInfo, delInfo, getInfo, updateInfo } from "@/api/system/info";
import { ref, reactive, toRefs, getCurrentInstance } from "vue";
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const { proxy } = getCurrentInstance();

const infoList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const imageFileList = ref([]);
const quillEditorRef = ref(null);
const styles = ref({
  height: '400px',
});

const data = reactive({
  form: {
    id: null,
    title: '',
    summary: '',
    image: '',
    content: '',
    author: '',
    tenant: ''
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    author: undefined,
    tenant: undefined
  },
  rules: {
    title: [{ required: true, message: "新闻标题不能为空", trigger: "blur" }],
    content: [{ required: true, message: "新闻内容不能为空", trigger: "blur" }],
    summary: [{ required: true, message: "新闻简介不能为空", trigger: "blur" }],
    image: [{ required: true, message: "新闻图片不能为空", trigger: "blur" }],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询资讯列表 */
function getList() {
  loading.value = true;
  listInfo(queryParams.value).then(response => {
    infoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单重置 */
function reset() {
  form.value = {
    id: null,
    title: '',
    summary: '',
    image: '',
    content: '',
    author: '',
    tenant: ''
  };
  imageFileList.value = [];
  proxy.resetForm("infoRef");
}
function handleTextChange({ editor }) {
  form.value.content = editor.root.innerHTML;  // 将编辑器内容转换为HTML格式
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.infoId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加资讯";
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.infoId || ids.value;

  getInfo(id).then(response => {
    form.value = response.data;
    imageFileList.value.push({ name: '图片', url: form.value.image });

    console.log(response.data)
    console.log(imageFileList)
    console.log('---------------------------------------------------------')
    open.value = true;
    title.value = "修改资讯";
  });
}

function submitForm() {
  proxy.$refs["infoRef"].validate(valid => {
    if (valid) {
      const quillInstance = quillEditorRef.value && quillEditorRef.value.getQuill();
      if (quillInstance) {
        form.value.content = quillInstance.root.innerHTML;
      }
      const submitData = {
        infoId: form.value.infoId,
        title: form.value.title,
        summary: form.value.summary,
        image: form.value.image,
        content: form.value.content,
        author: form.value.author,
        tenant: form.value.tenant
      };

      let jsonForm = JSON.stringify(submitData);
      if (form.value.infoId != null) {
        updateInfo(jsonForm).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addInfo(jsonForm).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const informationIds = row.infoId ? [row.infoId] : ids.value;
  proxy.$modal.confirm('是否确认删除资讯编号为 "' + informationIds.join(", ") + '" 的数据项？').then(function() {
    return delInfo(informationIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 图片上传处理 */
function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    // 删除旧的图片
    imageFileList.value = [];
    form.value.image = '';

    // 添加新的图片
    form.value.image = e.target.result;  // 将Base64字符串存储到表单字段中
    imageFileList.value.push({ name: file.name, url: e.target.result });

    console.log('Image uploaded, form.image:', form.value.image);  // 添加调试代码
  };
  reader.readAsDataURL(file);
  return false;  // 阻止默认的上传行为
}

/** 图片移除处理 */
function handleImageRemove(file, fileList) {
  imageFileList.value = fileList;
  if (fileList.length === 0) {
    form.value.image = '';  // 如果移除所有图片，清空表单字段
  }
}

/** 图片预览处理 */
function handlePictureCardPreview(file) {
  const imgWindow = window.open(file.url);
  imgWindow.document.write('<img src="' + file.url + '" />');
}

getList();
</script>

<style scoped>
.upload-demo .el-icon-plus {
  font-size: 28px;
}
</style>
