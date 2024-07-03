<template>
  <div class="app-container">
    <!-- Form Section -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <!-- Form Items -->
      <el-form-item label="会议名称" prop="meetingName">
        <el-input
            v-model="queryParams.meetingName"
            placeholder="请输入会议名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="创建人" prop="creator">
        <el-input
            v-model="queryParams.creator"
            placeholder="请输入创建人"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="会议状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="会议状态" clearable style="width: 200px">
          <el-option label="进行中" value="0" />
          <el-option label="已结束" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
            v-model="queryParams.startTime"
            type="datetime"
            placeholder="选择开始时间"
            style="width: 200px"
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
            v-hasPermi="['system:post:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:post:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:post:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:post:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- Table Section -->
    <el-table v-loading="loading" :data="meetingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="会议名称" align="center" prop="meetingName" />
      <el-table-column label="创建人" align="center" prop="creator" />
      <el-table-column label="会议状态" align="center" prop="status">
        <template #default="scope">
          <span v-if="scope.row.status === '0'">进行中</span>
          <span v-else-if="scope.row.status === '1'">已结束</span>
        </template>
      </el-table-column>
      <el-table-column label="会议内容" align="center" prop="content">
        <template #default="scope">
          <div v-html="filterImages(scope.row.content)"></div>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:meeting:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:meeting:remove']">删除</el-button>
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

    <!-- 添加或修改会议对话框 -->
    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="meetingRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="会议名称" prop="meetingName">
              <el-input v-model="form.meetingName" placeholder="请输入会议名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建人" prop="creator">
              <el-input v-model="form.creator" placeholder="请输入创建人" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="会议封面" prop="coverImage">
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
          </el-col>
          <el-col :span="24">
            <el-form-item label="会议内容" prop="content">
              <editor v-model="form.content" :min-height="192"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="选择开始时间" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="选择结束时间" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Meeting">
import { listMeeting, addMeeting, delMeeting, getMeeting, updateMeeting } from "@/api/system/meeting";
import { ref, reactive, toRefs, getCurrentInstance } from 'vue';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';
import 'quill/dist/quill.snow.css';

const { proxy } = getCurrentInstance();
const { sys_normal_disable } = useDict("sys_normal_disable");

const meetingList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const imageFileList = ref([]);
// const uploadUrl = '/system/meeting/upload'; // 确保这个URL和后端一致

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    meetingName: undefined,
    creator: undefined,
    status: undefined,
    startTime: undefined
  },
  rules: {
    meetingName: [{ required: true, message: "会议名称不能为空", trigger: "blur" }],
    creator: [{ required: true, message: "创建人不能为空", trigger: "blur" }],
    startTime: [{ required: true, message: "开始时间不能为空", trigger: "blur" }],
    endTime: [{ required: true, message: "结束时间不能为空", trigger: "blur" }],
    content: [{ required: true, message: "会议内容不能为空", trigger: "blur" }]
  }
});

const editorOption = {
  placeholder: '请输入内容',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block']
    ]
  }
};

const { queryParams, form, rules } = toRefs(data);

/** 图片上传处理 */
function handleImageUpload(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Data = e.target.result;
    console.log('Base64 Image Length:', base64Data.length); // 添加这行代码

    // 删除旧的封面
    imageFileList.value = [];
    form.value.coverImage = '';

    // 添加新的封面
    form.value.coverImage = base64Data;
    imageFileList.value.push({ name: file.name, url: base64Data });
    console.log('Image uploaded, form.coverImage:', form.value.coverImage);
  };
  reader.readAsDataURL(file);
  return false;
}

/** 图片移除处理 */
function handleImageRemove(file, fileList) {
  imageFileList.value = fileList;
  if (fileList.length === 0) {
    form.value.coverImage = '';  // 如果移除所有图片，清空表单字段
  }
}

/** 图片预览处理 */
function handlePictureCardPreview(file) {
  const imgWindow = window.open(file.url);
  imgWindow.document.write('<img src="' + file.url + '" />');
}

function filterImages(content) {
  return content ? content.replace(/<img[^>]*>/g, '') : '';
}

function getList() {
  loading.value = true;
  listMeeting(queryParams.value).then(response => {
    meetingList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

function cancel() {
  open.value = false;
  reset();
}

function reset() {
  form.value = {
    meetingId: undefined,
    meetingName: undefined,
    creator: undefined,
    status: "0",
    content: undefined,
    coverImage: undefined,
    startTime: undefined,
    endTime: undefined,
    remark: undefined
  };
  imageFileList.value = [];
  proxy.resetForm("meetingRef");
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.meetingId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加会议";
}

function handleUpdate(row) {
  reset();
  const meetingId = row.meetingId || ids.value;
  getMeeting(meetingId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改会议";
    if (form.value.coverImage) {
      imageFileList.value = [{ name: '', url: form.value.coverImage }];
    }
  });
}

function submitForm() {
  proxy.$refs["meetingRef"].validate(valid => {
    if (valid) {
      if (form.value.meetingId != undefined) {
        updateMeeting(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMeeting(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

function handleDelete(row) {
  const meetingIds = row.meetingId || ids.value;
  proxy.$modal.confirm('是否确认删除会议编号为"' + meetingIds + '"的数据项？').then(function() {
    return delMeeting(meetingIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

function handleExport() {
  proxy.download("system/meeting/export", {
    ...queryParams.value
  }, `meeting_${new Date().getTime()}.xlsx`);
}

getList();
</script>
