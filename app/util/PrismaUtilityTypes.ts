import { GroupAssignment, Group } from "@prisma/client";

// User Utility Types
export type WithGroups = { groups: GroupAssignment[] };
export type WithGroupsAndGroupData = { groups: GroupAssignment & { group: Group }[] };