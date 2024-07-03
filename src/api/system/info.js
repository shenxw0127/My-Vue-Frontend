import request from '@/utils/request'

// 查询资讯列表
export function listInfo(query) {
    return request({
        url: '/system/info/list',
        method: 'get',
        params: query
    })
}

// 查询资讯详细
export function getInfo(id) {
    return request({
        url: '/system/info/' + id,
        method: 'get'
    })
}

// 新增资讯
export function addInfo(data) {
    return request({
        url: '/system/info',
        method: 'post',
        data: data
    })
}

// 修改资讯
export function updateInfo(data) {
    return request({
        url: '/system/info',
        method: 'put',
        data: data
    })
}


// 删除资讯
export function delInfo(infoIds) {
    return request({
        url: '/system/info/' + infoIds,
        method: 'delete'
    })
}
