import { Context, Controller } from "@bismuthmoe/arcadia";
import { GroupPermissions } from "../util/UserUtils";

export class GroupController extends Controller {
    async index(ctx: Context) {}

    async permissions(ctx: Context, group_id?: string) {
        if (!group_id) {
            // Return every permission
            return {
                status:200,
                data: {
                    permissions: Object.keys(GroupPermissions).reduce((currentObject, key) => {
                        currentObject[key] = GroupPermissions[key as keyof typeof GroupPermissions]
                        return currentObject;
                    }, {} as Record<string, GroupPermissions>)
                }
            }
        } else {
            // Return every permission for the group
            let group = await ctx.prisma?.group.findUnique({
                where: {
                    id: group_id
                }
            });

            if (!group) {
                ctx.status(404);
                return { status: 404, error: "Group not found" };
            }

            return {
                status: 200,
                data: {
                    permissions: Object.keys(GroupPermissions).reduce((currentObject, key) => {
                        if ((group!.permissions & GroupPermissions[key as keyof typeof GroupPermissions]) === GroupPermissions[key as keyof typeof GroupPermissions]) {
                            currentObject[key] = GroupPermissions[key as keyof typeof GroupPermissions];
                        }

                        return currentObject;
                    }, {} as Record<string, GroupPermissions>)
                }
            }
        }
    }
}