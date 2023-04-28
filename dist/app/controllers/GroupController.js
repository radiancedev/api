"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupController = void 0;
const arcadia_1 = require("@bismuthmoe/arcadia");
const UserUtils_1 = require("../util/UserUtils");
class GroupController extends arcadia_1.Controller {
    async index(ctx) { }
    async permissions(ctx, group_id) {
        if (!group_id) {
            return {
                status: 200,
                data: {
                    permissions: Object.keys(UserUtils_1.GroupPermissions).reduce((currentObject, key) => {
                        currentObject[key] = UserUtils_1.GroupPermissions[key];
                        return currentObject;
                    }, {})
                }
            };
        }
        else {
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
                    permissions: Object.keys(UserUtils_1.GroupPermissions).reduce((currentObject, key) => {
                        if ((group.permissions & UserUtils_1.GroupPermissions[key]) === UserUtils_1.GroupPermissions[key]) {
                            currentObject[key] = UserUtils_1.GroupPermissions[key];
                        }
                        return currentObject;
                    }, {})
                }
            };
        }
    }
}
exports.GroupController = GroupController;
