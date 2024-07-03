// src/store/course.js
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