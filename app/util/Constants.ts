import { Prisma } from "@prisma/client";

/// SAFE USER QUERIES ///
export const SafeUserQuery: Prisma.UserArgs = {
    select: {
        id: true,
        name: true,
        display_name: true,
        biography: true,
        url: true,
        location: true,
        avatar_hash: true,
        banner_hash: true,
        created_at: true,
        groups: {
            select: {
                group: true
            }
        },
    }
} as const;

/// SAFE POST QUERIES ///
export const SafePostQuery: Prisma.PostArgs = {
    select: {
        author: SafeUserQuery,
        replies: true,
        interactions: true,
        original: true,
        parent: true,
        reposts: true
    }
} as const;

export function createRecursiveSafePostQuery(depth: number) {
    if (depth == 0) {
        return SafePostQuery;
    }



    let query: Prisma.PostArgs = {
        select: {
            author: SafeUserQuery,
            interactions: true,
            parent: true,
            reposts: true,
        }
    }
    
    const postKeys: (keyof Prisma.PostSelect)[] = ["replies", "original", "parent", "reposts"];
    const defaults: Prisma.PostSelect = {};

    for (let postKey of postKeys) {
        (defaults[postKey] as Prisma.PostArgs) = {
            select: {}
        };

        (query.select![postKey] as Prisma.PostArgs) = {
            select: {}
        };
    }

    function setQuery(query: Prisma.PostArgs, final: boolean = false) {
        for (let postKey of postKeys) {
            (query.select![postKey] as Prisma.PostArgs) = {
                select: {
                    author: SafeUserQuery,
                    interactions: true,
                    reposts: true,
                    ...Object.assign({}, final == false ? defaults : {
                        replies: true,
                        original: true,
                        parent: true,
                        reposts: true
                    })
                }
            }
        }
    };


    // Create a recursive tree that loops between the replies and original posts as the depth increases
    let currentDepth = 0;
    let currentRepliesQuery = query.select?.replies as Prisma.PostArgs;
    let currentOriginalQuery = query.select?.original as Prisma.PostArgs;
    while (currentDepth < depth - 1) {
        setQuery(currentRepliesQuery);
        setQuery(currentOriginalQuery);

        currentDepth++;
        currentRepliesQuery = query.select?.replies as Prisma.PostArgs;
        currentOriginalQuery = query.select?.original as Prisma.PostArgs;
    };

    setQuery(currentRepliesQuery, true);
    setQuery(currentOriginalQuery, true);

    return query;
}

export const SelectCount = {
    "_count": true
}