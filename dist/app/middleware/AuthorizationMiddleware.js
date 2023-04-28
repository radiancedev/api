"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SessionType_1 = require("../structures/enums/SessionType");
class AuthorizationMiddleware {
    static async authorize(ctx) {
        let authorized;
        if (ctx.header("Authorization")) {
            if (ctx.header("Authorization")?.startsWith("Bearer ")) {
                let baseToken = ctx.header("Authorization")?.replace("Bearer ", "");
                let token;
                try {
                    token = jsonwebtoken_1.default.verify(baseToken, process.env.JWT_SECRET_KEY);
                }
                catch (e) {
                    return { status: 401, error: "Invalid token" };
                }
                if (token.type === SessionType_1.SessionType.User) {
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
            return { status: 401, error: "Unauthorized" };
        }
    }
}
exports.AuthorizationMiddleware = AuthorizationMiddleware;
