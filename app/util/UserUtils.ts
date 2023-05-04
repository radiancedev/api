import { User } from "@prisma/client";
import { WithGroupData } from "./PrismaUtilityTypes";


export enum GroupPermissions {
    // User Permissions
    VIEW_POSTS = 1 << 0,
    CREATE_POSTS = 1 << 1, // Also allows editing & deleting own posts
    USER = VIEW_POSTS | CREATE_POSTS,

    // Content Moderator Permissions
    EDIT_POSTS = 1 << 2,
    DELETE_POSTS = 1 << 3,
    RESTRICT_USERS = 1 << 4,
    SUSPEND_USERS = 1 << 5,
    CONTENT_MODERATOR = USER | EDIT_POSTS | DELETE_POSTS | RESTRICT_USERS | SUSPEND_USERS,
    
    // Content Administrator Permissions
    DELETE_USERS = 1 << 6, // Destructive action
    EDIT_USERS = 1 << 7,
    CONTENT_ADMIN = CONTENT_MODERATOR | DELETE_USERS | EDIT_USERS,
    
    // System Administrator Permissions
    EDIT_GROUPS = 1 << 8,
    EDIT_USER_GROUPS = 1 << 9, // Might move this to lower ranks if need be
    SYSTEM_ADMIN = CONTENT_ADMIN | EDIT_GROUPS | EDIT_USER_GROUPS,
}

export class UserUtils {
    private constructor() {
        throw new Error('This class cannot be instantiated');
    }
    
    static getUserPermissions(user: User & WithGroupData) {
        let permissionValue = 0;

        for (const { group } of user.groups) {
            permissionValue |= group.permissions;
        }

        return permissionValue;
    }

    static hasPermission(user: User & WithGroupData, permission: GroupPermissions) {
        return (this.getUserPermissions(user) & permission) === permission;
    }
}