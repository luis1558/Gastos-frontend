import { classNames } from '../../utils/format'

interface ChoiceOption<T extends string> {
  value: T
  label: string
  description?: string
}

interface ChoiceCardsProps<T extends string> {
  label?: string
  value: T
  options: readonly ChoiceOption<T>[]
  onChange: (value: T) => void
  /** Cards sit side by side from the `sm` breakpoint up; they always stack on phones. */
  columns?: 2 | 3
}

export function ChoiceCards<T extends string>({ label, value, options, onChange, columns = 2 }: ChoiceCardsProps<T>) {
  return (
    <div>
      {label && <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>}
      <div
        role="radiogroup"
        aria-label={label}
        className={classNames('grid grid-cols-1 gap-2', columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}
      >
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(option.value)}
              className={classNames(
                'min-h-11 rounded-lg border px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500',
                selected
                  ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 dark:bg-indigo-900/30 dark:border-indigo-400 dark:ring-indigo-400'
                  : 'border-gray-300 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700',
              )}
            >
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{option.description}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
