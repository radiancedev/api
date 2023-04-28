import { Context, Controller } from "@bismuthmoe/arcadia";
import { GroupPermissions } from "../util/UserUtils";
export declare class GroupController extends Controller {
    index(ctx: Context): Promise<void>;
    permissions(ctx: Context, group_id?: string): Promise<{
        status: number;
        data: {
            permissions: Record<string, GroupPermissions>;
        };
        error?: undefined;
    } | {
        status: number;
        error: string;
        data?: undefined;
    }>;
}
