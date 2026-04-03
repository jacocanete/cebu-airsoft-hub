import { jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { c as cn } from "./utils-H80jjgLf.js";
const sizeClasses = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-20 w-20 text-xl",
  "2xl": "h-24 w-24 text-2xl"
};
function AvatarBox({
  name,
  size = "md",
  className
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "flex shrink-0 items-center justify-center border border-border bg-primary/10 font-black text-primary",
        sizeClasses[size],
        className
      ),
      children: name[0].toUpperCase()
    }
  );
}
function UserAvatar({
  name,
  username,
  size = "md",
  linkToProfile = false,
  className
}) {
  if (linkToProfile && username) {
    return /* @__PURE__ */ jsx(
      Link,
      {
        to: "/profile/$username",
        params: { username },
        className: "hover:opacity-80 transition-opacity",
        children: /* @__PURE__ */ jsx(AvatarBox, { name, size, className })
      }
    );
  }
  return /* @__PURE__ */ jsx(AvatarBox, { name, size, className });
}
export {
  UserAvatar as U
};
