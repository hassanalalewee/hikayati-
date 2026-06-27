import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        // Ink — primary action (order, submit, confirm)
        default:     'bg-ink-950 text-paper-50 hover:bg-ink-800 active:scale-[0.98]',
        // Teal — trust action (approve, consent, editorial)
        teal:        'bg-teal-600 text-white hover:bg-teal-500 active:scale-[0.98]',
        // Outlined — secondary action
        outline:     'border-[1.5px] border-paper-300 bg-transparent text-ink-950 hover:bg-paper-100',
        // Ghost — minimal action
        ghost:       'bg-transparent text-ink-600 hover:bg-paper-100 hover:text-ink-950',
        // Destructive — delete, cancel
        destructive: 'bg-error-600 text-white hover:bg-red-700',
        // Link style
        link:        'text-teal-600 underline-offset-4 hover:underline bg-transparent',
        // Secondary — soft action
        secondary:   'bg-paper-100 text-ink-950 hover:bg-paper-200',
      },
      size: {
        default: 'h-11 px-6 py-2.5',
        sm:      'h-9 rounded-lg px-4 text-xs',
        lg:      'h-13 rounded-xl px-8 text-base',
        icon:    'h-10 w-10 rounded-xl',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
