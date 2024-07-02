<template>
  <div class="register">
    <div class="register-container">
      <h3 class="title">测盟汇管理系统</h3>
      <el-steps :active="activeStep" align-center>
        <el-step title="账号信息"></el-step>
        <el-step title="用户信息"></el-step>
        <el-step title="租户信息"></el-step>
      </el-steps>

      <el-form ref="registerRef" :model="registerForm" :rules="registerRules" class="register-form" v-if="activeStep === 0">
        <el-form-item prop="username">
          <el-input
              v-model="registerForm.username"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="账号"
          >
            <template #prefix><svg-icon icon-class="user" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
              v-model="registerForm.password"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="密码"
              @keyup.enter="handleNext"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              size="large"
              auto-complete="off"
              placeholder="确认密码"
              @keyup.enter="handleNext"
          >
            <template #prefix><svg-icon icon-class="password" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="code" v-if="captchaEnabled">
          <el-row gutter="10">
            <el-col :span="16">
              <el-input
                  size="large"
                  v-model="registerForm.code"
                  auto-complete="off"
                  placeholder="验证码"
                  @keyup.enter="handleNext"
              >
                <template #prefix><svg-icon icon-class="validCode" class="el-input__icon input-icon" /></template>
              </el-input>
            </el-col>
            <el-col :span="8">
              <img :src="codeUrl" @click="getCode" class="register-code-img"/>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handleNext"
          >
            <span v-if="!loading">下一步</span>
            <span v-else>处理中...</span>
          </el-button>
          <el-button
              size="large"
              type="text"
              style="margin-top: 10px;"
              @click="handleBackToLogin"
          >
            返回登录
          </el-button>
        </el-form-item>
      </el-form>

      <el-form ref="userRef" :model="userForm" :rules="userRules" class="register-form" v-if="activeStep === 1">
        <h3 class="title">用户信息</h3>
        <el-form-item prop="phoneNumber">
          <el-input
              v-model="userForm.phoneNumber"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="手机号码"
          >
            <template #prefix><svg-icon icon-class="phone" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
              v-model="userForm.email"
              type="email"
              size="large"
              auto-complete="off"
              placeholder="邮箱"
          >
            <template #prefix><svg-icon icon-class="email" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="sex">
          <el-radio-group v-model="userForm.sex">
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="remark">
          <el-input
              v-model="userForm.remark"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="备注"
          >
            <template #prefix><svg-icon icon-class="remark" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handlePrevious"
          >
            上一步
          </el-button>
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handleNext"
          >
            下一步
          </el-button>
        </el-form-item>
      </el-form>

      <el-form ref="tenantRef" :model="tenantForm" :rules="tenantRules" class="register-form" v-if="activeStep === 2">
        <h3 class="title">租户信息</h3>
        <el-form-item prop="tenantName">
          <el-input
              v-model="tenantForm.tenantName"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="租户名称"
          >
            <template #prefix><svg-icon icon-class="tenant" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item prop="contactPerson">
          <el-input
              v-model="tenantForm.contactPerson"
              type="text"
              size="large"
              auto-complete="off"
              placeholder="联系人"
          >
            <template #prefix><svg-icon icon-class="contact" class="el-input__icon input-icon" /></template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handlePrevious"
          >
            上一步
          </el-button>
          <el-button
              :loading="loading"
              size="large"
              type="primary"
              @click.prevent="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!--  底部  -->
    <div class="el-register-footer">
      <span>Copyright © 2018-2024 ruoyi.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from "element-plus";
import { getCodeImg, register } from "@/api/login";

const router = useRouter();
const { proxy } = getCurrentInstance();

const activeStep = ref(0);

const registerForm = ref({
  username: "",
  password: "",
  confirmPassword: "",
  code: "",
  uuid: ""
});

const userForm = ref({
  phoneNumber: "",
  email: "",
  sex: "",
  remark: ""
});

const tenantForm = ref({
  tenantName: "",
  contactPerson: "",
});

const equalToPassword = (rule, value, callback) => {
  if (registerForm.value.password !== value) {
    callback(new Error("两次输入的密码不一致"));
  } else {
    callback();
  }
};

const registerRules = {
  username: [
    { required: true, trigger: "blur", message: "请输入您的账号" },
    { min: 2, max: 20, message: "用户账号长度必须介于 2 和 20 之间", trigger: "blur" }
  ],
  password: [
    { required: true, trigger: "blur", message: "请输入您的密码" },
    { min: 5, max: 20, message: "用户密码长度必须介于 5 和 20 之间", trigger: "blur" },
    { pattern: /^[^<>"'|\\]+$/, message: "不能包含非法字符：< > \" ' \\\ |", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, trigger: "blur", message: "请再次输入您的密码" },
    { required: true, validator: equalToPassword, trigger: "blur" }
  ],
  code: [{ required: true, trigger: "change", message: "请输入验证码" }]
};

const userRules = {
  phoneNumber: [
    { required: true, trigger: "blur", message: "请输入手机号码" }
  ],
  email: [
    { required: true, trigger: "blur", message: "请输入邮箱" },
    { type: "email", trigger: ["blur", "change"], message: "请输入有效的邮箱地址" }
  ],
  sex: [
    { required: true, trigger: "change", message: "请选择性别" }
  ],
  remark: [
    { required: true, trigger: "blur", message: "请输入备注" }
  ]
};

const tenantRules = {
  tenantName: [
    { required: true, trigger: "blur", message: "请输入租户名称" }
  ],
  contactPerson: [
    { required: true, trigger: "blur", message: "请输入联系人" }
  ],
};

const codeUrl = ref("");
const loading = ref(false);
const captchaEnabled = ref(true);

function handleNext() {
  if (activeStep.value === 0) {
    proxy.$refs.registerRef.validate(valid => {
      if (valid) {
        activeStep.value += 1;
      }
    });
  } else if (activeStep.value === 1) {
    proxy.$refs.userRef.validate(valid => {
      if (valid) {
        activeStep.value += 1;
      }
    });
  }
}

function handlePrevious() {
  activeStep.value -= 1;
}

function handleRegister() {
  proxy.$refs.tenantRef.validate(valid => {
    if (valid) {
      loading.value = true;

      // 构造单一结构体包含所有属性
      const payload = {
        ...registerForm.value,
        ...userForm.value,
        ...tenantForm.value
      };

      register(payload).then(res => {
        const username = registerForm.value.username;
        ElMessageBox.alert("<font color='red'>恭喜你，您的账号 " + username + " 注册成功！</font>", "系统提示", {
          dangerouslyUseHTMLString: true,
          type: "success",
        }).then(() => {
          router.push("/login");
        }).catch(() => {});
      }).catch(() => {
        loading.value = false;
        if (captchaEnabled) {
          getCode();
        }
      });
    }
  });
}


function handleBackToLogin() {
  router.push("/login");
}

function getCode() {
  getCodeImg().then(res => {
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled;
    if (captchaEnabled.value) {
      codeUrl.value = "data:image/gif;base64," + res.img;
      registerForm.value.uuid = res.uuid;
    }
  });
}

getCode();
</script>

<style lang='scss' scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  width: 600px;
  border-radius: 8px;
  padding: 40px;
}
.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.register-form {
  width: 100%;
  .el-input {
    height: 40px;
    input {
      height: 40px;
    }
  }
  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 0px;
  }
}
.register-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}
.register-code {
  width: 33%;
  height: 40px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-register-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.register-code-img {
  height: 40px;
  padding-left: 12px;
}
</style>
