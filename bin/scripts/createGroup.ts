import { Snowflake } from "../../app/util/Snowflake";
import type { ScriptContext } from "../scriptHandler";

export const name = "Create group script";
export const choices = [{
    type: "input",
    name: "name",
    message: "What is the name of the group?"
},
{
    type: "input",
    name: "color",
    message: "What is the color of the group?",
    default: "#FFFFFF"
},
{
    type: "input",
    name: "icon",
    message: "What is the icon asset file name on the CDN?"
},
{
    type: "input",
    name: "assignments",
    message: "Do you want to assign this group to anybody? (separate ids with a comma)",
}];

export async function execute(ctx: ScriptContext) {
    const group = await ctx.orm.group.create({
        data: {
            id: Snowflake.generate(),
            name: ctx.choices?.name,
            color: ctx.choices?.color,
            icon_asset: ctx.choices?.icon
        }
    });

    if (ctx.choices?.assignments) {
        let ids = ctx.choices.assignments.split(",").map((id: string) => id.trim());
    
        let users = await ctx.orm.user.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        });

        await ctx.orm.group.update({
            where: {
                id: group.id
            },
            data: {
                assignments: {
                    createMany: {
                        data: users.map(user => {
                            return {
                                user_id: user.id
                            }
                        })
                    }
                }
            }
        });
    }
}