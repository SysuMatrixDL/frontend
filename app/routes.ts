import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("home/home.tsx"),
  route("login", "user/login.tsx"),
  route("register", "user/register.tsx")
] satisfies RouteConfig;