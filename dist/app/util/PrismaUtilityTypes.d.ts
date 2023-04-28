import { GroupAssignment, Group } from "@prisma/client";
export declare type WithGroups = {
    groups: GroupAssignment[];
};
export declare type WithGroupsAndGroupData = {
    groups: GroupAssignment & {
        group: Group;
    }[];
};
