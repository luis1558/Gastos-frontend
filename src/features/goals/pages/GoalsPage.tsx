import { useState } from 'react'
import { FiPlus, FiTarget, FiEdit2 } from 'react-icons/fi'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Loading } from '../../../components/ui/Loading'
import { PageHeader } from '../../../components/ui/PageHeader'
import { ChoiceCards } from '../../../components/ui/ChoiceCards'
import { formatCurrency } from '../../../utils/format'
import type { Goal } from '../../../types/models'
import { useGoalOverview, useGoals } from '../hooks'
import { GoalCard } from '../components/GoalCard'
import { NewGoalModal } from '../components/NewGoalModal'
import { ContributionModal } from '../components/ContributionModal'
import { OpeningBalanceModal } from '../components/OpeningBalanceModal'

const FILTERS = [
  { value: 'active', label: 'Activas' },
  { value: 'completed', label: 'Cumplidas' },
] as const

export function GoalsPage() {
  const [filter, setFilter] = useState<'active' | 'completed'>('active')
  const [newOpen, setNewOpen] = useState(false)
  const [balanceOpen, setBalanceOpen] = useState(false)
  const [contributing, setContributing] = useState<Goal | null>(null)

  const { data: overview } = useGoalOverview()
  const { data: goals, isLoading } = useGoals(filter)

  const available = Number(overview?.available ?? 0)

  return (
    <div>
      <PageHeader
        title="Metas"
        action={
          <Button onClick={() => setNewOpen(true)} size="sm" className="min-h-11 sm:min-h-0">
            <FiPlus size={16} className="mr-1" /> Nueva meta
          </Button>
        }
      />

      {overview && (
        <Card className="mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Disponible para gastar</p>
          <p className={`text-3xl font-bold ${available >= 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-600'}`}>
            {formatCurrency(available)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Saldo total</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(Number(overview.balance))}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Apartado en metas</p>
              <p className="font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(Number(overview.reserved))}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            El dinero apartado sigue en tu cuenta, pero no cuenta como disponible.
          </p>
          {available < 0 && (
            <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
              Tu saldo es menor a lo apartado. Revisa tus metas o ajusta tu saldo inicial.
            </p>
          )}
          <button
            type="button"
            onClick={() => setBalanceOpen(true)}
            className="mt-3 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <FiEdit2 size={14} aria-hidden="true" /> Ajustar saldo inicial
          </button>
        </Card>
      )}

      <div className="mb-4 max-w-xs">
        <ChoiceCards inline value={filter} options={FILTERS} onChange={setFilter} />
      </div>

      {isLoading ? (
        <Loading />
      ) : goals && goals.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onContribute={setContributing} />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={<FiTarget size={32} />}
            title={filter === 'active' ? 'Aún no tienes metas' : 'Todavía no has cumplido ninguna meta'}
            description={
              filter === 'active'
                ? 'Aparta dinero para una cuota, un pago o algo que quieras comprar.'
                : 'Cuando marques una meta como cumplida aparecerá aquí.'
            }
            action={
              filter === 'active' ? (
                <Button onClick={() => setNewOpen(true)}>
                  <FiPlus size={16} className="mr-1" /> Crear mi primera meta
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      <NewGoalModal isOpen={newOpen} onClose={() => setNewOpen(false)} />
      <ContributionModal goal={contributing} available={available} onClose={() => setContributing(null)} />
      {overview && <OpeningBalanceModal overview={overview} isOpen={balanceOpen} onClose={() => setBalanceOpen(false)} />}
    </div>
  )
}
