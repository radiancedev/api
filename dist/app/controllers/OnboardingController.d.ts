import { Context, Controller } from "@bismuthmoe/arcadia";
export declare class OnboardingController extends Controller {
    constructor();
    task(ctx: Context): Promise<{
        status: number;
        message: string;
        data: {
            user: Omit<import(".prisma/client").User, "password" | "email" | "activation_code"> | undefined;
        };
        error?: undefined;
    } | {
        status: number;
        message: string;
        data: {
            user: {
                groups?: import(".prisma/client").GroupAssignment[] | undefined;
                location?: string | null | undefined;
                id?: string | undefined;
                url?: string | null | undefined;
                name?: string | undefined;
                activated?: boolean | undefined;
                created_at?: Date | undefined;
                entities?: import(".prisma/client").Prisma.JsonValue | undefined;
                display_name?: string | null | undefined;
                biography?: string | null | undefined;
                avatar_hash?: string | null | undefined;
                banner_hash?: string | null | undefined;
            };
            session: {
                location: string;
                id: string;
                created_at: Date;
                session_token: string;
                expires_at: Date;
            } | undefined;
        };
        error?: undefined;
    } | {
        status: number;
        error: string;
    }>;
    register(ctx: Context): Promise<{
        status: number;
        errors: {
            status: number;
            key: string;
            error: string;
            fields: string[];
        }[];
        message?: undefined;
        data?: undefined;
    } | {
        status: number;
        errors: {
            status: number;
            key: string;
            error: string;
        }[];
        message?: undefined;
        data?: undefined;
    } | {
        status: number;
        message: string;
        data: {
            id: string;
            activation_code: string | null;
        } | undefined;
        errors?: undefined;
    }>;
    private _activateAccount;
    private _loginAccount;
}
