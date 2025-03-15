
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={`${props.className || ''} max-w-[90%] md:max-w-sm mx-auto opacity-85`}>
            <div className="grid gap-1">
              {title && <ToastTitle className="text-xs font-medium">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs opacity-90">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-full md:max-w-sm z-[100]" />
    </ToastProvider>
  )
}
