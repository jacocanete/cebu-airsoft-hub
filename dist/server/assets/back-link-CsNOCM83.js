import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
function BackLink({ to, label }) {
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to,
      className: "mb-6 inline-flex items-center gap-1.5 label-military transition-colors hover:text-primary",
      children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
        label
      ]
    }
  );
}
export {
  BackLink as B
};
