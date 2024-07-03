import request from '../../../../../RuoYi-Vue3-master/src/utils/request.js'

// 查询会议列表
export function listMeeting(query) {
    return request({
        url: '/system/meeting/list',
        method: 'get',
        params: query
    })
}

// 查询会议详细
export function getMeeting(meetingId) {
    return request({
        url: '/system/meeting/' + meetingId,
        method: 'get'
    })
}

// 新增会议
export function addMeeting(data) {
    return request({
        url: '/system/meeting',
        method: 'post',
        data: data
    })
}

// 修改会议
export function updateMeeting(data) {
    return request({
        url: '/system/meeting',
        method: 'put',
        data: data
    })
}

// 删除会议
export function delMeeting(meetingId) {
    return request({
        url: '/system/meeting/' + meetingId,
        method: 'delete'
    })
}