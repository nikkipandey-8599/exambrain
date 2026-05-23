import { Toaster, toast } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 2800,
        className: 'toast-custom',
        success: { icon: '✅', duration: 2500 },
        error: { icon: '❌', duration: 3500 },
        loading: { icon: null, duration: Infinity },
        style: { maxWidth: '340px' }
      }}
    />
  )
}

export const showToast = {
  success: (msg) => toast.success(msg),
  error: (msg) => toast.error(msg),
  info: (msg) => toast(msg, { icon: 'ℹ️' }),
  loading: (msg) => toast.loading(msg),
  dismiss: (id) => toast.dismiss(id),
  promise: (promise, msgs) => toast.promise(promise, msgs)
}
