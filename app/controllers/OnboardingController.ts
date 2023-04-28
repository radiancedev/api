import { Context, Controller } from "@bismuthmoe/arcadia";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import geoip from "geoip-lite";
import { PayloadType } from "../structures/Payload";
import { ActivateAccountPayload, LoginAccountPayload } from "../structures/payloads/AccountPayloads";
import { Snowflake } from "../util/Snowflake";
import { SessionType } from "../structures/enums/SessionType";

interface Flow {
    token: string;
}

export class OnboardingController extends Controller {
    constructor() {
        super();
    }

    async task(ctx: Context) {
        const payload = ctx.body;

        // Check if the payload is valid
        if (!ctx.contains("body", ["type", "data"])) {
            return { status: 400, error: "Invalid payload" };
        }

        // Switch on the payload type
        switch (payload.type) {
            case PayloadType.ActivateAccount:
                return await this._activateAccount(ctx, payload as ActivateAccountPayload);

            case PayloadType.LoginAccount:
                return await this._loginAccount(ctx, payload as LoginAccountPayload);

            default:
                return { status: 400, error: "Invalid payload type" };
        }

    }

    async register(ctx: Context) {
        const errors = [];

        if (!ctx.contains("body", ["name", "password", "email"])) {
            errors.push({
                status: 400,
                key: "MISSING_REQUIRED_FIELDS",
                error: "Missing required fields",
                fields: ctx.missing("body", ["name", "password", "email"])
            })

            ctx.status(errors[0].status);
            return { status: errors[0].status, errors };
        }

        // Check if the username is taken.
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
            })
        }


        if (errors.length > 0) {
            ctx.status(errors[0].status);
            return { status: errors[0].status, errors };
        }

        // Create the user's account
        const data = await ctx.prisma?.user.create({
            data: {
                id: Snowflake.generate(),
                name: ctx.body.name,
                email: ctx.body.email,
                activation_code: crypto.randomBytes(16).toString("hex"),
                password: await argon2.hash(ctx.body.password, {
                    type: argon2.argon2id
                }),
            },
            select: {
                // all fields but password & activation code
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

    /* TASK PAYLOADS */
    private async _activateAccount(ctx: Context, payload: ActivateAccountPayload) {
        if (payload.data.activation_code === undefined || payload.data.user_id === undefined) {
            return { status: 400, error: "Missing activation code or user id" };
        }

        // Get the user by their id and activation code
        const user = await ctx.prisma?.user.findFirst({
            where: {
                id: payload.data.user_id,
                activation_code: payload.data.activation_code
            },
        });

        if (!user || user.activation_code !== payload.data.activation_code || user.activated === true) {
            return { status: 400, error: "Invalid activation code, user id, or the acccount is already activated" };
        }

        // Activate the user's account
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

    private async _loginAccount(ctx: Context, payload: LoginAccountPayload) {
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

        if (!await argon2.verify(user.password, payload.data.password)) {
            ctx.status(403);
            return { status: 400, error: "Invalid login or password" };
        }

        // Get the location of the user
        // temporary fix until this is in the actual server module
        // @ts-ignore
        const location = geoip.lookup(ctx.ip.split(":")[3] === "127.0.0.1" ? "8.8.8.8" : ctx.ip.split(":")[3]);

        // Create a session JWT for the user
        const sessionToken = jwt.sign({
            type: SessionType.User,
            data: {
                id: user.id,
                location: `${location?.region ?? "Unknown"}, ${location?.country ?? "Unknown"}`
            }
        }, process.env.JWT_SECRET_KEY!);


        // Create a session for the user
        const session = await ctx.prisma?.session.create({
            data: {
                id: Snowflake.generate(),
                user_id: user.id,
                session_token: sessionToken,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
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
        }
    }
}