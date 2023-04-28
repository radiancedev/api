import { Context, Controller } from "@bismuthmoe/arcadia";
import { Prisma } from "@prisma/client";
export declare class PostController extends Controller {
    index(ctx: Context, id: string): Promise<void>;
    create(ctx: Context): Promise<{
        status: number;
        errors: {
            status: number;
            key: string;
            error: string;
            fields: string[];
        }[];
        data?: undefined;
    } | {
        status: number;
        data: {
            id: string;
            author_id: string;
            content: string | undefined;
            sensitive: boolean | undefined;
            entities: Prisma.InputJsonObject;
        };
        errors?: undefined;
    }>;
    private parseEntities;
    private uploadFiles;
}
