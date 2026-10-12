/**
 * eiam 角色 API 客户端（WatchAlert 人员组织-角色管理接入 eiam）。
 * 端点契约（eiam/internal/web/role/handler.go + vo.go）：
 * - POST   /api/iam/role/list           分页角色列表 {offset,limit,keyword} → {total, roles:[Role]}
 * - POST   /api/iam/role/create         创建角色 {name, code, desc} → 新角色
 * - POST   /api/iam/role/update         修改角色 {id, name, code, desc} → null
 * - DELETE /api/iam/role/delete/:id     删除角色 → null
 * - POST   /api/iam/role/batch_delete   批量删除 {ids} → null
 * - GET    /api/iam/role/detail/:code   角色详情 → Role
 */
import { eiamRequest } from './request'

// 分页角色列表
export async function listRoles(params = {}) {
    return eiamRequest('post', '/api/iam/role/list', params)
}

// 创建角色
export async function createRole(params) {
    return eiamRequest('post', '/api/iam/role/create', params)
}

// 更新角色
export async function updateRole(params) {
    return eiamRequest('post', '/api/iam/role/update', params)
}

// 删除角色
export async function deleteRole(id) {
    return eiamRequest('delete', `/api/iam/role/delete/${id}`)
}

// 批量删除角色
export async function batchDeleteRoles(ids) {
    return eiamRequest('post', '/api/iam/role/batch_delete', { ids })
}

// 角色详情
export async function getRoleDetail(code) {
    return eiamRequest('get', `/api/iam/role/detail/${code}`)
}
