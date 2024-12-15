import {
  type RouteConfig,
  route,
  index,
  layout,
} from "@react-router/dev/routes";

export default [
  index("home/home.tsx"),
  route("login", "user/login.tsx"),
  route("register", "user/register.tsx"),
  layout("navi.tsx", [
    route("console", "console/console.tsx"),
    route("market", "market/market.tsx"),
    route("market/:did", "market/create.tsx"),
    route("community", "community/community.tsx")
  ]),
] satisfies RouteConfig;