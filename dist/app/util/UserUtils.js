"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserUtils = exports.GroupPermissions = void 0;
var GroupPermissions;
(function (GroupPermissions) {
    GroupPermissions[GroupPermissions["VIEW_POSTS"] = 1] = "VIEW_POSTS";
    GroupPermissions[GroupPermissions["CREATE_POSTS"] = 2] = "CREATE_POSTS";
    GroupPermissions[GroupPermissions["USER"] = 3] = "USER";
    GroupPermissions[GroupPermissions["EDIT_POSTS"] = 4] = "EDIT_POSTS";
    GroupPermissions[GroupPermissions["DELETE_POSTS"] = 8] = "DELETE_POSTS";
    GroupPermissions[GroupPermissions["RESTRICT_USERS"] = 16] = "RESTRICT_USERS";
    GroupPermissions[GroupPermissions["SUSPEND_USERS"] = 32] = "SUSPEND_USERS";
    GroupPermissions[GroupPermissions["CONTENT_MODERATOR"] = 63] = "CONTENT_MODERATOR";
    GroupPermissions[GroupPermissions["DELETE_USERS"] = 64] = "DELETE_USERS";
    GroupPermissions[GroupPermissions["EDIT_USERS"] = 128] = "EDIT_USERS";
    GroupPermissions[GroupPermissions["CONTENT_ADMIN"] = 255] = "CONTENT_ADMIN";
    GroupPermissions[GroupPermissions["EDIT_GROUPS"] = 256] = "EDIT_GROUPS";
    GroupPermissions[GroupPermissions["EDIT_USER_GROUPS"] = 512] = "EDIT_USER_GROUPS";
    GroupPermissions[GroupPermissions["SYSTEM_ADMIN"] = 1023] = "SYSTEM_ADMIN";
})(GroupPermissions = exports.GroupPermissions || (exports.GroupPermissions = {}));
class UserUtils {
    constructor() {
        throw new Error('This class cannot be instantiated');
    }
    static getUserPermissions(user) {
        let permissionValue = 0;
        for (const { group } of user.groups) {
            permissionValue |= group.permissions;
        }
        return permissionValue;
    }
    static hasPermission(user, permission) {
        return (this.getUserPermissions(user) & permission) === permission;
    }
}
exports.UserUtils = UserUtils;
