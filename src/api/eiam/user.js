/**
 * eiam 用户 API 客户端（WatchAlert 人员组织-用户管理接入 eiam）。
 * 端点契约（eiam/internal/web/user/handler.go + vo.go）：
 * - POST   /api/iam/user/list           分页用户列表 {offset,limit,keyword,usernames,ids} → {total, users:[UserVO]}
 * - POST   /api/iam/user/create         创建用户 SignupRequest {username,email,nickname,avatar,job_title,phone,status,password,confirm_password}
 * - POST   /api/iam/user/update         修改用户 {id, username,email,nickname,avatar,job_title,phone,status} → null
 * - DELETE /api/iam/user/delete/:id     删除用户 → null
 * - POST   /api/iam/user/batch_delete   批量删除 {ids} → null
 * - GET    /api/iam/user/detail?id=     用户详情 → RetrieveUser {user, tenants, ...}
 */
import { eiamRequest } from './request'

// 分页用户列表
export async function listUsers(params = {}) {
    return eiamRequest('post', '/api/iam/user/list', params)
}

// 创建用户
export async function createUser(params) {
    return eiamRequest('post', '/api/iam/user/create', params)
}

// 更新用户
export async function updateUser(params) {
    return eiamRequest('post', '/api/iam/user/update', params)
}

// 删除用户
export async function deleteUser(id) {
    return eiamRequest('delete', `/api/iam/user/delete/${id}`)
}

// 批量删除用户
export async function batchDeleteUsers(ids) {
    return eiamRequest('post', '/api/iam/user/batch_delete', { ids })
}

// 用户详情
export async function getUserDetail(id) {
    return eiamRequest('get', '/api/iam/user/detail', { id })
}
