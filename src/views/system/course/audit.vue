<template>
  <div class="app-container">
    <!-- 搜索表单 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="课程名称" prop="courseName">
        <el-input
            v-model="queryParams.courseName"
            placeholder="请输入课程名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="课程作者" prop="courseAuthor">
        <el-input
            v-model="queryParams.courseAuthor"
            placeholder="请输入课程作者"
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

    <el-table v-loading="loading" :data="courseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="课程编号" align="center" prop="courseId" />
      <el-table-column label="课程名称" align="center" prop="courseName" />
      <el-table-column label="课程作者" align="center" prop="courseAuthor" />
      <el-table-column label="审核状态" align="center" prop="auditStatus">
        <template #default="scope">
          <el-tag :type="scope.row.auditStatus ? 'success' : 'info'">
            {{ scope.row.auditStatus ? '已审核' : '未审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
              v-if="!scope.row.auditStatus"
              type="success"
              icon="Check"
              @click="handleAudit(scope.row)"
              v-hasPermi="['system:course:audit']"
          >审核通过</el-button>
          <el-button
              v-else
              type="danger"
              icon="Close"
              @click="handleUnaudit(scope.row)"
              v-hasPermi="['system:course:audit']"
          >取消审核</el-button>
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
  </div>
</template>

<script setup name="AuditCourse">
import { listCourse, auditCourse, unauditCourse } from "@/api/system/course";
import { ref, reactive, toRefs, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

const courseList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    courseName: undefined,
    courseAuthor: undefined
  }
});

const { queryParams } = toRefs(data);

/** 查询课程列表 */
function getList() {
  loading.value = true;
  listCourse(queryParams.value).then(response => {
    courseList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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
/** 审核按钮操作 */
function handleAudit(row) {
  auditCourse(row.courseId).then(() => {
    proxy.$modal.msgSuccess("审核通过");
    getList(); // 审核成功后重新获取列表
  }).catch(() => {
    proxy.$modal.msgError("审核失败"); // 审核失败，不调用getList
  });
}
/** 取消审核按钮操作 */
function handleUnaudit(row) {
  unauditCourse(row.courseId).then(() => {
    proxy.$modal.msgSuccess("取消审核成功");
    getList(); // 取消审核成功后重新获取列表
  }).catch(() => {
    proxy.$modal.msgError("取消审核失败"); // 取消审核失败，不调用getList
  });
}
/** 处理选择变化 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.courseId);
}

getList();
</script>

<style scoped>
</style>
