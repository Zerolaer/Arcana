'use client'

import { useState } from 'react'
import { User } from '@supabase/supabase-js'
import { signIn, signUp } from '@/lib/supabase'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Sword, Shield, Zap } from 'lucide-react'

interface AuthFormProps {
  onAuthSuccess: (user: User) => void | Promise<void>
}

export default function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await signIn(formData.email, formData.password)
        
        if (error) {
          toast.error(error.message)
        } else if (data.user) {
          toast.success('Добро пожаловать в мир приключений!')
          onAuthSuccess(data.user)
        }
      } else {
        // Registration validation
        if (formData.password !== formData.confirmPassword) {
          toast.error('Пароли не совпадают')
          return
        }
        
        if (formData.username.length < 3) {
          toast.error('Имя пользователя должно содержать минимум 3 символа')
          return
        }

        const { data, error } = await signUp(formData.email, formData.password, formData.username)
        
        if (error) {
          toast.error(error.message)
        } else if (data.user) {
          toast.success('Регистрация успешна! Добро пожаловать!')
          onAuthSuccess(data.user)
        }
      }
    } catch (error) {
      toast.error('Произошла ошибка. Попробуйте снова.')
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="full-height flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Game Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-4 space-x-2">
            <Sword className="w-8 h-8 text-primary-400" />
            <h1 className="text-4xl font-bold font-game bg-gradient-to-r from-primary-400 via-purple-400 to-primary-400 bg-clip-text text-transparent">
              MMORPG
            </h1>
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-dark-500 text-lg font-medium">
            Классическая MMORPG с современным интерфейсом
          </p>
          
          {/* Feature Icons */}
          <div className="flex justify-center space-x-6 mt-6 text-dark-400">
            <div className="flex flex-col items-center space-y-1">
              <Sword className="w-6 h-6" />
              <span className="text-xs">Классы</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Zap className="w-6 h-6" />
              <span className="text-xs">Скилы</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <Shield className="w-6 h-6" />
              <span className="text-xs">ПВЕ</span>
            </div>
          </div>
        </div>

        {/* Auth Form */}
        <div className="game-panel p-6">
          <div className="flex mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-md transition-colors duration-200 ${
                isLogin
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-dark-200/50 text-dark-400 hover:text-white hover:bg-dark-200/80'
              }`}
            >
              Вход
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-md transition-colors duration-200 ${
                !isLogin
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-dark-200/50 text-dark-400 hover:text-white hover:bg-dark-200/80'
              }`}
            >
              Регистрация
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-dark-400 mb-1">
                  Имя персонажа
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required={!isLogin}
                  className="game-input"
                  placeholder="Введите имя персонажа"
                  value={formData.username}
                  onChange={handleInputChange}
                  minLength={3}
                  maxLength={20}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-400 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="game-input"
                placeholder="Введите email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-400 mb-1">
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  className="game-input pr-10"
                  placeholder="Введите пароль"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-400 mb-1">
                  Подтвердите пароль
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  required={!isLogin}
                  className="game-input"
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength={6}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full game-button py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && <div className="loading-spinner" />}
              <span>{isLogin ? 'Войти в игру' : 'Создать персонажа'}</span>
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 pt-4 border-t border-dark-300/30">
            <p className="text-sm text-dark-500 text-center">
              {isLogin ? (
                <>
                  Нет аккаунта?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    Зарегистрироваться
                  </button>
                </>
              ) : (
                <>
                  Уже есть аккаунт?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    Войти
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Game Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-2 gap-4 text-sm text-dark-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span>Множество классов</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full" />
              <span>Уникальные билды</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full" />
              <span>АФК фарминг</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-400 rounded-full" />
              <span>Без квестов</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
