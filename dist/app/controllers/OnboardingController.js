"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnboardingController = void 0;
const arcadia_1 = require("@bismuthmoe/arcadia");
const argon2_1 = __importDefault(require("argon2"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const geoip_lite_1 = __importDefault(require("geoip-lite"));
const Payload_1 = require("../structures/Payload");
const Snowflake_1 = require("../util/Snowflake");
const SessionType_1 = require("../structures/enums/SessionType");
class OnboardingController extends arcadia_1.Controller {
    constructor() {
        super();
    }
    async task(ctx) {
        const payload = ctx.body;
        if (!ctx.contains("body", ["type", "data"])) {
            return { status: 400, error: "Invalid payload" };
        }
        switch (payload.type) {
            case Payload_1.PayloadType.ActivateAccount:
                return await this._activateAccount(ctx, payload);
            case Payload_1.PayloadType.LoginAccount:
                return await this._loginAccount(ctx, payload);
            default:
                return { status: 400, error: "Invalid payload type" };
        }
    }
    async register(ctx) {
        const errors = [];
        if (!ctx.contains("body", ["name", "password", "email"])) {
            errors.push({
                status: 400,
                key: "MISSING_REQUIRED_FIELDS",
                error: "Missing required fields",
                fields: ctx.missing("body", ["name", "password", "email"])
            });
            ctx.status(errors[0].status);
            return { status: errors[0].status, errors };
        }
        const existingUser = await ctx.prisma?.user.findUnique({
            where: {
                name: ctx.body.name
            }
        });
        if (existingUser) {
            errors.push({
                status: 400,
                key: "USERNAME_TAKEN",
                error: "This username is taken",
            });
        }
        if (errors.length > 0) {
            ctx.status(errors[0].status);
            return { status: errors[0].status, errors };
        }
        const data = await ctx.prisma?.user.create({
            data: {
                id: Snowflake_1.Snowflake.generate(),
                name: ctx.body.name,
                email: ctx.body.email,
                activation_code: crypto_1.default.randomBytes(16).toString("hex"),
                password: await argon2_1.default.hash(ctx.body.password, {
                    type: argon2_1.default.argon2id
                }),
            },
            select: {
                id: true,
                activation_code: true
            }
        });
        return {
            status: 200,
            message: "Your account has been successfully created, but you need to activate it. Please provide the activation code sent to your email.",
            data
        };
    }
    async _activateAccount(ctx, payload) {
        if (payload.data.activation_code === undefined || payload.data.user_id === undefined) {
            return { status: 400, error: "Missing activation code or user id" };
        }
        const user = await ctx.prisma?.user.findFirst({
            where: {
                id: payload.data.user_id,
                activation_code: payload.data.activation_code
            },
        });
        if (!user || user.activation_code !== payload.data.activation_code || user.activated === true) {
            return { status: 400, error: "Invalid activation code, user id, or the acccount is already activated" };
        }
        const safeUser = ctx.prisma?.omit(await ctx.prisma?.user.update({
            where: {
                id: user.id
            },
            data: {
                activated: true,
                activation_code: null
            }
        }), ["email", "password", "activation_code"]);
        return {
            status: 200, message: "Your account has been successfully activated", data: {
                user: safeUser
            }
        };
    }
    async _loginAccount(ctx, payload) {
        if (payload.data.login === undefined || payload.data.password === undefined) {
            return { status: 400, error: "Missing login or password" };
        }
        const user = await ctx.prisma?.user.findFirst({
            where: {
                OR: [{
                        name: payload.data.login
                    },
                    {
                        email: payload.data.login
                    }]
            },
            include: {
                groups: true
            }
        });
        if (!user) {
            ctx.status(400);
            return { status: 400, error: "This account does not exist" };
        }
        if (!await argon2_1.default.verify(user.password, payload.data.password)) {
            ctx.status(403);
            return { status: 400, error: "Invalid login or password" };
        }
        const location = geoip_lite_1.default.lookup(ctx.ip.split(":")[3] === "127.0.0.1" ? "8.8.8.8" : ctx.ip.split(":")[3]);
        const sessionToken = jsonwebtoken_1.default.sign({
            type: SessionType_1.SessionType.User,
            data: {
                id: user.id,
                location: `${location?.region ?? "Unknown"}, ${location?.country ?? "Unknown"}`
            }
        }, process.env.JWT_SECRET_KEY);
        const session = await ctx.prisma?.session.create({
            data: {
                id: Snowflake_1.Snowflake.generate(),
                user_id: user.id,
                session_token: sessionToken,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
                location: `${location?.region ?? "Unknown"}, ${location?.country ?? "Unknown"}`
            },
            select: {
                id: true,
                session_token: true,
                created_at: true,
                expires_at: true,
                location: true
            }
        });
        return {
            status: 200,
            message: "You have successfully logged in",
            data: {
                user: {
                    ...ctx.prisma?.omit(user, ["password", "email", "activation_code"])
                },
                session: session
            }
        };
    }
}
exports.OnboardingController = OnboardingController;
