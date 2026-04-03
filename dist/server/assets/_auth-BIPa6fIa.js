import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
function AuthLayout() {
  return /* @__PURE__ */ jsx(Outlet, {});
}
export {
  AuthLayout as component
};
