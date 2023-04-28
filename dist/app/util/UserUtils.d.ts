import { User } from "@prisma/client";
import { WithGroupsAndGroupData } from "./PrismaUtilityTypes";
export declare enum GroupPermissions {
    VIEW_POSTS = 1,
    CREATE_POSTS = 2,
    USER = 3,
    EDIT_POSTS = 4,
    DELETE_POSTS = 8,
    RESTRICT_USERS = 16,
    SUSPEND_USERS = 32,
    CONTENT_MODERATOR = 63,
    DELETE_USERS = 64,
    EDIT_USERS = 128,
    CONTENT_ADMIN = 255,
    EDIT_GROUPS = 256,
    EDIT_USER_GROUPS = 512,
    SYSTEM_ADMIN = 1023
}
export declare class UserUtils {
    private constructor();
    static getUserPermissions(user: User & WithGroupsAndGroupData): number;
    static hasPermission(user: User & WithGroupsAndGroupData, permission: GroupPermissions): boolean;
}
