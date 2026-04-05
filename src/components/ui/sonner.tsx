import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-400" />,
        info: <InfoIcon className="size-4 text-sky-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-primary" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!bg-card !border !border-border !rounded !text-foreground !shadow-none !font-sans",
          title: "!text-sm !font-semibold !text-foreground",
          description: "!text-xs !text-muted-foreground",
          actionButton:
            "!bg-primary !text-primary-foreground !rounded !text-xs !font-semibold !uppercase !tracking-widest",
          cancelButton:
            "!bg-transparent !border !border-border !text-muted-foreground !rounded !text-xs !font-semibold !uppercase !tracking-widest",
          error: "!border-primary/40",
          success: "!border-emerald-500/30",
          warning: "!border-amber-500/30",
          info: "!border-sky-500/30",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
