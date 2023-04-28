"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = void 0;
const arcadia_1 = require("@bismuthmoe/arcadia");
const AuthorizationMiddleware_1 = require("../app/middleware/AuthorizationMiddleware");
const route = new arcadia_1.Route();
exports.Routes = route;
route.group("/api", (route) => {
    route.group("/v1", (route) => {
        route.group("/onboarding", (route) => {
            route.post("/task", "OnboardingController@task");
            route.post("/register", "OnboardingController@register");
        });
        route.group("/posts", (route) => {
            route.post("/", AuthorizationMiddleware_1.AuthorizationMiddleware.authorize, "PostController@create");
            route.get("/posts/:id", "PostController@index");
        });
        route.group("/groups", (route) => {
            route.get("/permissions", "GroupController@permissions");
            route.get("/permissions/:group_id", "GroupController@permissions");
        });
    });
});
