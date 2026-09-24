import { useToast } from "@/components/ui/use-toast";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const bad = props.variant === "destructive";
        const Icon = bad ? AlertTriangle : CheckCircle2;
        return (
          <Toast key={id} {...props}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${bad ? "bg-rose-500" : "bg-cyan-400"}`} />
            <div className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center border ${bad ? "bg-rose-500/10 border-rose-500/20 text-rose-300" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-300"}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="grid gap-0.5 flex-1 min-w-0 text-slate-300">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}