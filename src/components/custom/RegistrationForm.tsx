"use client"

import { useState } from "react"
import { ArrowRight, Heart } from "lucide-react"

interface RegistrationFormProps {
  onComplete: (data: { name: string; email: string; whatsapp: string }) => void
}

export default function RegistrationForm({ onComplete }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Por favor, digite seu nome"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Por favor, digite seu e-mail"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Por favor, digite um e-mail válido"
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = "Por favor, digite seu WhatsApp"
    } else if (!/^\d{10,11}$/.test(formData.whatsapp.replace(/\D/g, ""))) {
      newErrors.whatsapp = "Por favor, digite um WhatsApp válido (DDD + número)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onComplete(formData)
    }
  }

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Heart className="w-12 h-12 text-pink-400 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Estamos quase lá!
          </h1>
          <p className="text-lg text-gray-600">
            Crie seu perfil para receber seu relatório e iniciar sua jornada de 3 dias gratuita.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                errors.name
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-purple-400"
              } focus:outline-none text-gray-700`}
              placeholder="Como você gostaria de ser chamado(a)?"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                errors.email
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-purple-400"
              } focus:outline-none text-gray-700`}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <label htmlFor="whatsapp" className="block text-sm font-semibold text-gray-700">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => {
                const formatted = formatWhatsApp(e.target.value)
                setFormData({ ...formData, whatsapp: formatted })
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-300 ${
                errors.whatsapp
                  ? "border-red-300 focus:border-red-400"
                  : "border-gray-200 focus:border-purple-400"
              } focus:outline-none text-gray-700`}
              placeholder="(11) 99999-9999"
            />
            {errors.whatsapp && (
              <p className="text-sm text-red-500">{errors.whatsapp}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Começar minha jornada
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Cada resposta é um passo para compreender melhor seu filho 💜
        </p>
      </div>
    </div>
  )
}
