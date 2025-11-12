"use client"

import { MessageCircle } from "lucide-react"

interface WhatsAppGroupInviteProps {
  userName: string
  onClose: () => void
}

export default function WhatsAppGroupInvite({ userName, onClose }: WhatsAppGroupInviteProps) {
  const whatsappChannelUrl = "https://whatsapp.com/channel/0029Vb6XfBh1SWt6Xg8pqG0Q"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-bold text-gray-800">
            Quer fazer parte do nosso grupo de apoio?
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {userName}, receba mensagens de encorajamento e conteúdos exclusivos direto no seu WhatsApp 💙
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <a
            href={whatsappChannelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Entrar no grupo Atypico 💙
          </a>

          <button
            onClick={onClose}
            className="w-full text-gray-600 hover:text-gray-800 font-semibold py-3 transition-colors"
          >
            Agora não
          </button>
        </div>

        <p className="text-xs text-center text-gray-500">
          Você está fazendo o melhor que pode. Continue assim! 🌱
        </p>
      </div>
    </div>
  )
}
