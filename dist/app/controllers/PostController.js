"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostController = void 0;
const arcadia_1 = require("@bismuthmoe/arcadia");
const Snowflake_1 = require("../util/Snowflake");
const Entity_1 = require("../structures/Entity");
const USER_MENTION_REGEX = /@([a-zA-Z0-9-_]{1,})/g;
const URL_REGEX = /https?:\/\/([a-zA-Z0-9]{1,}\.([a-zA-Z]{1,}))/g;
class PostController extends arcadia_1.Controller {
    async index(ctx, id) {
    }
    async create(ctx) {
        const errors = [];
        const user = ctx.get("user");
        const args = ctx.body;
        if (ctx.files?.length == 0 && args.content == undefined) {
            errors.push({
                status: 400,
                key: "MISSING_REQUIRED_FIELDS",
                error: "Missing required fields.",
                fields: ["content"]
            });
            ctx.status(errors[0].status);
            return { status: errors[0].status, errors };
        }
        else {
            let expectedType = "application/json";
            if (ctx.files?.length > 0 && ctx.header("Content-Type") !== "multipart/file-data") {
                expectedType = "multipart/file-data";
            }
            else if (ctx.files?.length == 0 && ctx.header("Content-Type") !== "application/json") {
                expectedType = "application/json";
            }
            errors.push({
                status: 400,
                key: "INVALID_CONTENT_TYPE",
                error: "Invalid content type.",
                expected: expectedType,
            });
        }
        let id = Snowflake_1.Snowflake.generate();
        if (args.files?.length > 0) {
            this.uploadFiles(id, args.files);
        }
        return {
            status: 200, data: {
                id: Snowflake_1.Snowflake.generate(),
                author_id: user.id,
                content: args.content,
                sensitive: args.sensitive,
                entities: await this.parseEntities(args.content, ctx.prisma)
            }
        };
    }
    async parseEntities(content, prisma) {
        const entities = {};
        const mentions = content?.matchAll(USER_MENTION_REGEX);
        for (let match of mentions) {
            const username = match[1];
            const mentionedUser = await prisma?.user.findUnique({
                where: {
                    name: username
                }
            });
            const start = match.index;
            const end = start + username.length;
            if (mentionedUser) {
                entities.mentions ??= [];
                entities.mentions.push({
                    id: mentionedUser.id,
                    type: Entity_1.EntityType.Mention,
                    data: {
                        indices: [start, end],
                        name: mentionedUser.name,
                        display_name: mentionedUser.display_name,
                    }
                });
            }
        }
        const urls = content?.matchAll(URL_REGEX);
        for (let match of urls) {
            const url = match[1];
            const start = match.index;
            const end = start + url.length;
            entities.urls ??= [];
            entities.urls.push({
                id: undefined,
                type: Entity_1.EntityType.URL,
                data: {
                    indices: [start, end],
                    url: url,
                }
            });
        }
        return entities;
    }
    async uploadFiles(id, files) {
        let entities = [];
        let formData = new FormData();
        formData.append("identifier", id);
        for (let file of files) {
            formData.append("file", new Blob([file.buffer]), file.originalname);
        }
        let response = await fetch(new URL("/media/v1", process.env.CDN_URL), {
            method: "POST",
            body: formData
        }).then(res => res.json());
        for (let file of response.body.files) {
            entities.push({
                hash: file.hash,
                url: new URL(`/v1/media/`, process.env.CDN_URL).toString(),
            });
        }
        return entities;
    }
}
exports.PostController = PostController;
