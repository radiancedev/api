import { Context } from "@bismuthmoe/arcadia";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SessionType } from "../structures/enums/SessionType";

interface AuthorizationPayload extends JwtPayload {
    type: SessionType;
    data: { [key: string]: string };
}

export class AuthorizationMiddleware {
    static async authorize(ctx: Context) {
        let authorized;
        // Check if the user is authorized
        // Session token
        if (ctx.header("Authorization")) {
            // Check if it's a bearer token
            if (ctx.header("Authorization")?.startsWith("Bearer ")) {
                let baseToken = ctx.header("Authorization")?.replace("Bearer ", "");
                let token: AuthorizationPayload;
                try {
                    token = jwt.verify(baseToken!, process.env.JWT_SECRET_KEY!) as AuthorizationPayload;
                } catch (e) {
                    return { status: 401, error: "Invalid token" };
                }

                // Check if the token is valid
                if (token.type === SessionType.User) {
                    // Get the session from the database
                    const session = await ctx.prisma?.session.findFirst({
                        where: {
                            session_token: baseToken
                        },
                        include: {
                            user: {
                                include: {
                                    groups: true
                                }
                            }
                        }
                    });

                    if (!session || session.expires_at < new Date()) {
                        return { status: 401, error: "Invalid token" };
                    }

                    // Set the user to the context
                    ctx.set("user", await ctx.prisma?.user.findUnique({
                        where: {
                            id: session.user_id
                        }
                    }));

                    authorized = true;
                }
            }
        }

        if (!authorized) {
            // TODO: add ctx.next();
            return { status: 401, error: "Unauthorized" };
        }
    }
}