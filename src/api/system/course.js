import request from '@/utils/request'

// 查询课程列表
export function listCourse(query) {
    return request({
        url: '/system/course/list',
        method: 'get',
        params: query
    })
}

// 查询课程详细
export function getCourse(courseId) {
    return request({
        url: '/system/course/' + courseId,
        method: 'get'
    })
}

// 新增课程
export function addCourse(data) {
    return request({
        url: '/system/course',
        method: 'post',
        data: data
    })
}

// 修改课程
export function updateCourse(data) {
    return request({
        url: '/system/course',
        method: 'put',
        data: data
    })
}

// 删除课程
export function delCourse(courseId) {
    return request({
        url: '/system/course/' + courseId,
        method: 'delete'
    })
}
// 审核课程
export function auditCourse(courseId) {
    return request({
        url: `/system/course/audit/${courseId}`,
        method: 'put'
    })
}

// 取消审核课程
export function unauditCourse(courseId) {
    return request({
        url: `/system/course/unaudit/${courseId}`,
        method: 'put'
    })
}
export const useCourseStore = defineStore('course', {
    // 省略其他状态和方法
    actions: {
        // 更新课程状态的方法
        updateCourseStatus(courseId, auditStatus) {
            const course = this.courses.find(c => c.courseId === courseId);
            if (course) {
                course.auditStatus = auditStatus;
            }
        }
    }
});