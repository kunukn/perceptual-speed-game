import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/*
 * Combines `clsx` (conditional class joining) with `tailwind-merge`
 * (conflict resolution for Tailwind utilities). The result is a single
 * className string where later Tailwind classes win over earlier ones
 * targeting the same CSS property.
 *
 * Problems solved:
 *
 * 1. Conditional classes without manual string concatenation:
 *      cn('p-2', isActive && 'bg-blue-500', { 'opacity-50': disabled })
 *
 * 2. Tailwind class conflicts when overriding from a parent component.
 *    Plain string joining keeps both classes and the cascade picks the
 *    one that comes last in the generated CSS — not the one written last
 *    in JSX. `twMerge` removes the losing duplicate so overrides work
 *    predictably:
 *      cn('px-2 py-1', 'px-4')        // → 'py-1 px-4'
 *      cn('text-red-500', 'text-sm')  // → 'text-red-500 text-sm' (no conflict)
 *      cn('bg-red-500', 'bg-blue-500')// → 'bg-blue-500'
 *
 * 3. Cleanly merging a `className` prop into a component's base styles:
 *      <div className={cn('rounded border p-2', className)} />
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
