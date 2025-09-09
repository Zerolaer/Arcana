'use client'

import { Sword, Shield, Zap } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export default function LoadingScreen({ message = 'Загрузка...' }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-dark-100 to-dark-200">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 text-center">
        {/* Game Logo */}
        <div className="flex justify-center items-center mb-8 space-x-3">
          <div className="relative">
            <Sword className="w-12 h-12 text-primary-400 animate-float" />
            <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl animate-glow" />
          </div>
          <h1 className="text-5xl font-bold font-game bg-gradient-to-r from-primary-400 via-purple-400 to-primary-400 bg-clip-text text-transparent">
            MMORPG
          </h1>
          <div className="relative">
            <Shield className="w-12 h-12 text-purple-400 animate-float" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl animate-glow" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* Loading Animation */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
          
          {/* Progress Bar */}
          <div className="w-64 h-2 bg-dark-200/50 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary-600 to-purple-600 rounded-full animate-pulse" 
                 style={{ 
                   width: '100%',
                   animation: 'loadingBar 2s ease-in-out infinite'
                 }} />
          </div>
        </div>

        {/* Loading Message */}
        <p className="text-xl text-dark-400 font-medium mb-8 animate-pulse">
          {message}
        </p>

        {/* Loading Icons */}
        <div className="flex justify-center space-x-8 text-dark-500">
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Sword className="w-8 h-8 animate-bounce" />
              <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-lg animate-glow" />
            </div>
            <span className="text-sm">Загрузка классов</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Zap className="w-8 h-8 animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-lg animate-glow" style={{ animationDelay: '0.3s' }} />
            </div>
            <span className="text-sm">Загрузка скилов</span>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="relative">
              <Shield className="w-8 h-8 animate-bounce" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-lg animate-glow" style={{ animationDelay: '0.6s' }} />
            </div>
            <span className="text-sm">Загрузка мира</span>
          </div>
        </div>

        {/* Tip */}
        <div className="mt-12 max-w-md mx-auto">
          <p className="text-sm text-dark-500 font-medium mb-2">💡 Совет:</p>
          <p className="text-xs text-dark-600">
            Каждый класс имеет уникальные способности и стиль игры. 
            Выберите тот, который соответствует вашему игровому стилю!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
