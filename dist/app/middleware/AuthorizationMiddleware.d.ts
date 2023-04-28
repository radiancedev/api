import { Context } from "@bismuthmoe/arcadia";
export declare class AuthorizationMiddleware {
    static authorize(ctx: Context): Promise<{
        status: number;
        error: string;
    } | undefined>;
}
