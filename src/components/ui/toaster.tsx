
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
          <Toast key={id} {...props} className={`${props.className || ''} max-w-[80%] md:max-w-xs mx-auto opacity-40 scale-65`}>
            <div className="grid gap-1">
              {title && <ToastTitle className="text-xs font-medium">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs opacity-80">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className="fixed bottom-0 right-0 flex flex-col p-1 gap-1 w-full md:max-w-[200px] z-[100]" />
    </ToastProvider>
  )
}
