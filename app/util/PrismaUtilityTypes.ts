import { GroupAssignment, Group } from "@prisma/client";

// User Utility Types
export type WithGroups = Group[];
export type WithGroupAssignments = { groups: GroupAssignment[] };
export type WithGroupsAndGroupData = { groups: GroupAssignment & { group: Group }[] };
export type WithGroupData = { groups: { group: Group }[] };