/**
 * eiam 租户 API 客户端（WatchAlert 租户管理接入 eiam）。
 * 端点契约（eiam/internal/web/tenant/handler.go + vo.go）：
 * - POST   /api/iam/tenant/list           分页租户列表 {offset,limit,keyword} → {total, tenants:[TenantVO]}
 * - POST   /api/iam/tenant/create         创建租户 {name, code} → id
 * - POST   /api/iam/tenant/update         修改租户 {id, name, code, domain, status} → null
 * - DELETE /api/iam/tenant/delete/:id     删除租户 → null
 * - GET    /api/iam/tenant/detail/:id     租户详情 → TenantVO {id,name,code,domain,status,ctime}
 * - POST   /api/iam/tenant/members        租户成员 {offset,limit,keyword} → {total, members:[MemberVO]}
 * - POST   /api/iam/tenant/assign         分配成员 {user_id} → null
 * - POST   /api/iam/tenant/unassign       移除成员 {user_id} → null
 * - GET    /api/iam/tenant/list/mine      我的租户列表
 */
import { eiamRequest } from './request'

// 全量/分页租户列表
export async function listTenants(params = {}) {
    return eiamRequest('post', '/api/iam/tenant/list', params)
}

// 我的租户列表（免权限，会话注入）
export async function listMyTenants(params = {}) {
    return eiamRequest('get', '/api/iam/tenant/list/mine', params)
}

// 租户详情
export async function getTenantDetail(id) {
    return eiamRequest('get', `/api/iam/tenant/detail/${id}`)
}

// 创建租户
export async function createTenant(params) {
    return eiamRequest('post', '/api/iam/tenant/create', params)
}

// 更新租户
export async function updateTenant(params) {
    return eiamRequest('post', '/api/iam/tenant/update', params)
}

// 删除租户
export async function deleteTenant(id) {
    return eiamRequest('delete', `/api/iam/tenant/delete/${id}`)
}

// 租户成员列表（tenantId 可选：超管查看指定租户时传，注入 X-Active-Tenant-ID 跨租户覆写）
export async function listTenantMembers(params = {}, tenantId) {
    const headers = tenantId ? { 'X-Active-Tenant-ID': String(tenantId) } : undefined
    return eiamRequest('post', '/api/iam/tenant/members', params, headers)
}

// 分配租户成员（tenantId 可选：超管为指定租户分配成员时传）
export async function assignTenantUser(params, tenantId) {
    const headers = tenantId ? { 'X-Active-Tenant-ID': String(tenantId) } : undefined
    return eiamRequest('post', '/api/iam/tenant/assign', params, headers)
}

// 移除租户成员（tenantId 可选：超管为指定租户移除成员时传）
export async function unassignTenantUser(params, tenantId) {
    const headers = tenantId ? { 'X-Active-Tenant-ID': String(tenantId) } : undefined
    return eiamRequest('post', '/api/iam/tenant/unassign', params, headers)
}

// 切换租户空间（body {tenant_id}；成功后 eiam 重签 session + 下发新 cookie，需整页 reload）
export async function switchTenant(tenantId) {
    return eiamRequest('post', '/api/iam/tenant/switch', { tenant_id: tenantId })
}
