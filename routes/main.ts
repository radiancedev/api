import { Route } from "@bismuthmoe/arcadia";
import { Router } from "express";
import { Context } from "vm";
import { AuthorizationMiddleware } from "../app/middleware/AuthorizationMiddleware";

const route = new Route();

route.group("/api", (route) => {
    // /api/v1/
    route.group("/v1", (route) => {
        // /api/v1/onboarding/
        route.group("/onboarding", (route) => {
            route.post("/task", "OnboardingController@task");
            route.post("/register", "OnboardingController@register");
        });
        
        // /api/v1/posts/
        route.group("/posts", (route) => {
            route.post("/", AuthorizationMiddleware.authorize, "PostController@create");
            
            route.get("/:id", "PostController@index");
            route.delete("/:id", "PostController@delete")
            route.post("/:id/reply", AuthorizationMiddleware.authorize, "PostController@create");
            route.post("/:id/repost", AuthorizationMiddleware.authorize, "PostController@repost");
        });

        // /api/v1/groups/
        route.group("/groups", (route) => {
            route.get("/permissions", "GroupController@permissions");
            route.get("/permissions/:group_id", "GroupController@permissions");
        });
    });

    route.postprocess((ctx: Context, response?: any) => {
        if (response.status) {
            ctx.status(response.status);
        }

        console.log(response)

        return response;
    })
})

export { route as Routes };