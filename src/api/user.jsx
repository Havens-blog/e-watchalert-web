import http from '../utils/http';
import { message } from 'antd';
import { HandleApiError } from "../utils/lib";

async function getUserList(params) {
    try {
        const res = await http('get', `/api/w8t/user/userList`, params);
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

async function updateUser(params) {
    try {
        const res = await http('post', `/api/w8t/user/userUpdate`, params);
        message.open({
            type: 'success',
            content: '用户更新成功',
        });
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

async function deleteUser(params) {
    try {
        const res = await http('post', `/api/w8t/user/userDelete`,params);
        message.open({
            type: 'success',
            content: '用户删除成功',
        });
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

async function getUserInfo() {
    return await http('get', `/api/system/userInfo`);
}

async function registerUser(params) {
    try {
        const res = await http('post', `/api/system/register`, params);
        message.open({
            type: 'success',
            content: '用户创建成功',
        });
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

async function changeUserPass(params) {
    try {
        const res = await http('post', `/api/w8t/user/userChangePass`, params);
        message.open({
            type: 'success',
            content: '修改密码成功',
        });
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

async function getOidcInfo() {
    try {
        const res = await http('get', `/api/oidc/oidcInfo`);
        return res;
    } catch (error) {
        HandleApiError(error)
        return error
    }
}

// 单点登出：调 eiam POST /api/user/logout 销毁共享会话（BIZ-auth-005）。
async function logoutUser() {
    try {
        const res = await http('post', `/api/user/logout`);
        return res;
    } catch (error) {
        return error
    }
}

// 同步 eiam 用户到 WatchAlert 本地扩展表（承载 join_duty 等应用侧扩展属性）。
// 人员身份以 eiam 为唯一来源；本接口仅维护本地扩展记录，joinDuty 省略时保持原值。
async function syncLocalUsers(users) {
    return await http('post', `/api/w8t/user/userSyncLocal`, { users });
}

export {
    getUserList,
    updateUser,
    deleteUser,
    getUserInfo,
    registerUser,
    changeUserPass,
    getOidcInfo,
    logoutUser,
    syncLocalUsers
}
