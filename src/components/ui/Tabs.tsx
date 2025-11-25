import { createContext, useContext, forwardRef, ElementRef, ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

const TabsContext = createContext<{
  value: string
  onValueChange: (value: string) => void
} | null>(null)

const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component')
  }
  return context
}

interface TabsProps extends ComponentPropsWithoutRef<typeof Tabs> {
  value: string
  onValueChange: (value: string) => void
}

const Tabs = forwardRef<ElementRef<'div'>, TabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    return (
      <TabsContext.Provider value={{ value, onValueChange }}>
        <div ref={ref} className={cn('w-full', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = 'Tabs'

interface TabsListProps extends ComponentPropsWithoutRef<'div'> {}

const TabsList = forwardRef<ElementRef<'div'>, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex h-10 items-center justify-center rounded-md bg-gray-700 p-1 text-gray-400',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends ComponentPropsWithoutRef<'button'> {
  value: string
}

const TabsTrigger = forwardRef<ElementRef<'button'>, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabs()
    const isSelected = value === selectedValue

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isSelected
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-gray-300 hover:bg-gray-600 hover:text-white',
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps extends ComponentPropsWithoutRef<'div'> {
  value: string
}

const TabsContent = forwardRef<ElementRef<'div'>, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { value: selectedValue } = useTabs()
    const isSelected = value === selectedValue

    if (!isSelected) return null

    return (
      <div
        ref={ref}
        className={cn('mt-6 ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2', className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
