/**
 * eiam 部门（组织）API 客户端（WatchAlert 人员组织-组织/部门管理接入 eiam）。
 * 端点契约（eiam/internal/web/department/handler.go）：
 * - GET    /api/iam/department/list         部门树 → [DepartmentNode{..., children:[...]}]
 * - POST   /api/iam/department/create       创建部门 {parent_id, name, sort, leaders, main_leader} → id
 * - POST   /api/iam/department/update       修改部门 {id, parent_id, name, sort, leaders, main_leader} → null
 * - DELETE /api/iam/department/delete/:id   删除部门 → null（被拒 code=4010703）
 * - GET    /api/iam/department/detail/:id   部门详情 → Department
 * - POST   /api/iam/department/members      部门成员 {dept_id, offset, limit, keyword} → {total, members:[User]}
 * - POST   /api/iam/department/assign       分配成员 {dept_id, user_ids} → null
 * - POST   /api/iam/department/remove       移除成员 {dept_id, user_ids} → null
 */
import { eiamRequest } from './request'

// 部门树
export async function listDepartments() {
    return eiamRequest('get', '/api/iam/department/list')
}

// 部门详情
export async function getDepartmentDetail(id) {
    return eiamRequest('get', `/api/iam/department/detail/${id}`)
}

// 创建部门
export async function createDepartment(params) {
    return eiamRequest('post', '/api/iam/department/create', params)
}

// 更新部门
export async function updateDepartment(params) {
    return eiamRequest('post', '/api/iam/department/update', params)
}

// 删除部门
export async function deleteDepartment(id) {
    return eiamRequest('delete', `/api/iam/department/delete/${id}`)
}

// 部门成员列表
export async function listDepartmentMembers(params = {}) {
    return eiamRequest('post', '/api/iam/department/members', params)
}

// 分配部门成员
export async function assignDepartmentUsers(params) {
    return eiamRequest('post', '/api/iam/department/assign', params)
}

// 移除部门成员
export async function removeDepartmentUsers(params) {
    return eiamRequest('post', '/api/iam/department/remove', params)
}
