'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const ToastProvider = ToastPrimitives.Provider
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn('fixed bottom-0 left-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px]', className)}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all bg-white', className)}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close ref={ref} className={cn('opacity-0 group-hover:opacity-100', className)} {...props}>
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

function Toaster() {
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}

export { Toaster, Toast, ToastClose, ToastTitle, ToastProvider, ToastViewport }
