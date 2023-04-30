import { Context, Controller } from "@bismuthmoe/arcadia";
import { User, Prisma, Post } from "@prisma/client";
import { WithGroupsAndGroupData } from "../util/PrismaUtilityTypes";
import { Snowflake } from "../util/Snowflake";
import { EntitiesBody, EntityType } from "../structures/Entity";
import { MediaEntity } from "../structures/entities/MediaEntity";
import { ORM } from "@bismuthmoe/arcadia/dist/orm/ORM";
import { createRecursiveSafePostQuery, SafeUserQuery } from "../util/Constants";
import { GroupPermissions, UserUtils } from "../util/UserUtils";

interface PostCreateArguments {
    content?: string;
    sensitive?: boolean;
    reply: {
        to: string;
        exclude: string[];
    };
}

const USER_MENTION_REGEX = /@([a-zA-Z0-9-_]{1,})/g;
const URL_REGEX = /https?:\/\/([a-zA-Z0-9]{1,}\.([a-zA-Z]{1,}))/g;

export class PostController extends Controller {
    async index(ctx: Context, id: string) {
        const post = await ctx.orm.post.findFirst({
            where: {
                id: id
            },
            select: createRecursiveSafePostQuery(3).select
        });

        if (!post) {
            return {
                status: 404,
                error: {
                    key: "POST_NOT_FOUND",
                    error: "Post not found."
                }
            };
        }

        return { status: 200, data: post };
    }

    async create(ctx: Context, parentId?: string) {
        const user: User & WithGroupsAndGroupData = ctx.get("user");
        let args: PostCreateArguments = ctx.body;

        if (ctx.header("Content-Type")?.includes("multipart/form-data")) {
            // TODO: check if this is valid
            args = JSON.parse(ctx.body.payload);
        }


        if (ctx.files?.length == 0 && args.content == undefined) {
            return {
                status: 400,
                error: {
                    key: "MISSING_REQUIRED_FIELDS",
                    error: "Missing required fields.",
                    fields: ["content"]
                }
            };
        } else {
            if (ctx.files?.length > 0 && !ctx.header("Content-Type")?.includes("multipart/form-data")) {
                return {
                    status: 400,
                    error: {
                        key: "INVALID_CONTENT_TYPE",
                        error: "Invalid content type.",
                        expected: "multipart/form-data",
                    }
                };
            }
        }

        let id = Snowflake.generate();
        let entities = await this.parseEntities(ctx.orm, args.content)
        let data: Prisma.PostUncheckedCreateInput = {
            id: id,
            author_id: user.id,
            content: args.content,
            sensitive: args.sensitive
        }

        if (parentId) {
            // Check if the parent post exists
            const parentPost = await ctx.orm.post.findUnique({
                where: {
                    id: parentId
                }
            });

            if (!parentPost) {
                return {
                    status: 400,
                    error: {
                        key: "POST_NOT_FOUND",
                        error: "The post you are trying to reply to does not exist.",
                    }
                };
            }

            data.is_reply = true;
            data.parent_id = parentPost.id;
        }

        if (args.reply) {
            if (parentId && parentId != args.reply.to) {
                // Potentially, I could rework this to allow replying to replies
                // but the current implementation does allow that already.
                return {
                    status: 400,
                    error: {
                        key: "INVALID_ARGUMENTS",
                        error: "Cannot supply a reply object and a parent post ID at the same time.",
                    }
                };
            }

            if (!args.reply.to) {
                return {
                    status: 400,
                    error: {
                        key: "MISSING_REQUIRED_FIELDS",
                        error: "Missing required fields.",
                        fields: ["reply[\"to\"]"]
                    }
                };
            }

            const parentPost = await ctx.orm.post.findUnique({
                where: {
                    id: args.reply.to
                },
            });

            if (!parentPost) {
                return {
                    status: 404,
                    error: {
                        key: "POST_NOT_FOUND",
                        error: "The post you are trying to reply to does not exist.",
                    }
                };
            }

            // Add the reply to the data
            data.is_reply = true;
            data.parent_id = args.reply.to;
        }

        if (ctx.files?.length! > 0) {
            let { entities: cdnEntities, errors: cdnErrors } = await this.uploadFiles(id, ctx.files! as Express.Multer.File[]);

            if (cdnErrors.length == 0) {
                entities.media = cdnEntities;
            }
        }

        data.entities = entities as Prisma.InputJsonObject;

        const post = await ctx.orm.post.create({
            data,
            include: {
                parent: data.is_reply ? true : false,
            }
        });

        return {
            status: 200,
            data: {
                post
            }
        };
    }

    async repost(ctx: Context, parentId: string) {
        const user: User & WithGroupsAndGroupData = ctx.get("user");
        let args: { content?: string; } = ctx.body; // TODO: Make this a type

        if (ctx.header("Content-Type")?.includes("multipart/form-data")) {
            // Media uploads are not supported for reposts (at the moment)
            return {
                status: 400,
                error: {
                    key: "INVALID_CONTENT_TYPE",
                    error: "Invalid content type.",
                    expected: "applicaition/json",
                }
            };
        }

        const parentPost = await ctx.orm.post.findUnique({
            where: {
                id: parentId
            }
        });

        if (!parentPost) {
            return {
                status: 404,
                error: {
                    key: "POST_NOT_FOUND",
                    error: "The post you are trying to reply to does not exist.",
                }
            };
        }

        // Create the post
        let id = Snowflake.generate();
        let data: Prisma.PostUncheckedCreateInput = {
            id: id,
            author_id: user.id,
            content: args.content,
            sensitive: parentPost.sensitive,
            entities: await this.parseEntities(ctx.orm, args.content) as Prisma.InputJsonObject
        }

        data.is_repost = true;
        data.original_post_id = parentPost.id;

        const post = await ctx.orm.post.create({
            data,
            include: {
                original: true
            }
        });

        return {
            status: 200,
            data: {
                post
            }
        };
    }

    async delete(ctx: Context, id: string) {
        const user: User & WithGroupsAndGroupData = ctx.get("user");

        const post = await ctx.orm.post.findUnique({
            where: {
                id: id
            }
        });

        if (!post) {
            return {
                status: 404,
                error: {
                    key: "POST_NOT_FOUND",
                    error: "The post you are trying to delete does not exist.",
                }
            };
        }

        if (post.author_id != user.id && UserUtils.hasPermission(user, GroupPermissions.DELETE_POSTS) == false) {
            return {
                status: 403,
                error: {
                    key: "MISSING_PERMISSIONS",
                    error: "You do not have permission to delete this post, as you are not the author of it.",
                }
            };
        }

        // Delete the post and all of its children
        await this.deletePost(ctx.orm!, post);
        
        return {
            status: 200,
            data: {
                post: post
            }
        };
    }

    private async parseEntities(orm: ORM, content?: string): Promise<EntitiesBody> {
        // Parse entities from the text and context
        const entities: EntitiesBody = {};

        if (!content) {
            return entities;
        }

        /// Parse mentions ///
        // Get every mention in the text
        const mentions = content?.matchAll(USER_MENTION_REGEX);

        for (let match of mentions!) {
            const username = match[1];
            const mentionedUser = await orm.user.findUnique({
                where: {
                    name: username
                }
            });

            // start & end of the mention
            const start = match.index!;
            const end = start + username.length;

            if (mentionedUser) {
                entities.mentions ??= [];
                entities.mentions.push({
                    id: mentionedUser.id,
                    type: EntityType.Mention,
                    data: {
                        indices: [start, end],
                        name: mentionedUser.name,
                        display_name: mentionedUser.display_name,
                    }
                });
            }
        }

        /// Parse Urls ///
        const urls = content?.matchAll(URL_REGEX);

        for (let match of urls!) {
            const url = match[1];
            const start = match.index!;
            const end = start + url.length;

            entities.urls ??= [];
            entities.urls.push({
                id: undefined!,
                type: EntityType.URL,
                data: {
                    indices: [start, end],
                    url: url,
                }
            })
        }

        return entities;
    }

    private async uploadFiles(id: string, files: Express.Multer.File[]): Promise<{ entities: MediaEntity[], errors: CdnError[] }> {
        let entities: MediaEntity[] = [];
        let errors: CdnError[] = [];
        let formData = new FormData();

        formData.append("identifier", id);

        for (let file of files) {
            formData.append("file", new Blob([file.buffer], { type: file.mimetype }), file.originalname);
        }

        console.log("owo");

        let response = await fetch(new URL("/v1/media", process.env.CDN_URL).toString(), {
            method: "POST",
            body: formData
        }).then(res => res.json());

        console.dir("wan");

        for (let error of response.data.errors) {
            if (error.data?.allowed)
                delete error.data?.allowed;

            errors.push(error);
        }
        console.dir("2");

        for (let file of response.data.files) {
            entities.push({
                id: file.id,
                type: EntityType.Media,
                data: {
                    hash: file.hash,
                    url: new URL(`/v1/media/${id}/${file.hash}`, process.env.CDN_URL).toString(),
                }
            })
        }
        console.dir("3");

        return { entities, errors };
    }

    private async deletePost(prisma: ORM, post: Post) {
        const children = await prisma.post.findMany({
            where: {
                OR: [{
                    parent: {
                        id: post.id
                    }
                },
                {
                    original: {
                        id: post.id
                    }
                }]
            }
        });

        for (const child of children) {
            await this.deletePost(prisma, child);
        }
        
        // Delete the interactions
        await prisma.interaction.deleteMany({
            where: {
                post_id: post.id
            }
        });

        // Delete the post itself
        await prisma.post.delete({
            where: {
                id: post.id
            }
        });
    }
}

type CdnError = {
    key: string;
    error: string;
    data: Omit<any, 'allowed'>
}