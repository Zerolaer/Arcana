'use client'

import { lazy, Suspense } from 'react'
import { Character } from '@/types/game'
import ErrorBoundary from '../../UI/ErrorBoundary'
import { Loader2 } from 'lucide-react'

// Lazy load heavy components
const CharacterPanelUnified = lazy(() => import('./CharacterPanelUnified'))
const InventoryPanel = lazy(() => import('./InventoryPanel'))
const SkillsPanelNew = lazy(() => import('./SkillsPanelNew'))
const LocationPanel = lazy(() => import('./LocationPanel'))
const CombatPanel = lazy(() => import('./CombatPanel'))

// Loading component
const PanelLoader = ({ name }: { name: string }) => (
  <div className="flex-1 flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Loader2 className="w-8 h-8 text-primary-400 animate-spin mx-auto mb-3" />
      <p className="text-gray-400">Загрузка {name}...</p>
    </div>
  </div>
)

// Wrapper with error boundary and suspense
const LazyWrapper = ({ 
  children, 
  fallback, 
  panelName 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  panelName: string
}) => (
  <ErrorBoundary fallback={fallback}>
    <Suspense fallback={<PanelLoader name={panelName} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
)

// Lazy panel components
interface LazyPanelProps {
  character: Character
  onUpdateCharacter: (updates: Partial<Character>) => Promise<boolean>
  isLoading: boolean
}

export const LazyCharacterPanel = (props: LazyPanelProps) => (
  <LazyWrapper panelName="характеристик">
    <CharacterPanelUnified {...props} />
  </LazyWrapper>
)

export const LazyInventoryPanel = (props: LazyPanelProps) => (
  <LazyWrapper panelName="инвентаря">
    <InventoryPanel {...props} />
  </LazyWrapper>
)

export const LazySkillsPanel = (props: LazyPanelProps) => (
  <LazyWrapper panelName="навыков">
    <SkillsPanelNew {...props} />
  </LazyWrapper>
)

export const LazyLocationPanel = (props: LazyPanelProps) => (
  <LazyWrapper panelName="локаций">
    <LocationPanel {...props} />
  </LazyWrapper>
)


export const LazyCombatPanel = (props: LazyPanelProps) => (
  <LazyWrapper panelName="боя">
    <CombatPanel {...props} />
  </LazyWrapper>
)
