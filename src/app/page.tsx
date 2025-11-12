"use client"

import { useState, useEffect } from "react"
import { Heart, Sparkles, Calendar, TrendingUp, CheckCircle2, ArrowRight, Infinity } from "lucide-react"
import RegistrationForm from "@/components/custom/RegistrationForm"
import WhatsAppGroupInvite from "@/components/custom/WhatsAppGroupInvite"
import { 
  saveUserProfile, 
  saveInitialAnswers, 
  saveJourneyDay, 
  getUserData, 
  hasUserProfile,
  clearUserData,
  type UserProfile,
  type InitialAnswers as StorageInitialAnswers,
  type DailyAnswers as StorageDailyAnswers,
  type JourneyData as StorageJourneyData
} from "@/lib/storage"
import { scheduleReminders, checkPendingReminders } from "@/lib/notifications"

type Step = "welcome" | "initial-questionnaire" | "registration" | "journey" | "report" | "premium"

interface InitialAnswers {
  childAge: string
  concerns: string[]
  familyHistory: string
  routineLevel: string
  relationship: string
}

interface DailyAnswers {
  sleep: string
  reactions: string
  communication: string
  crises: string
  happyMoment: string
}

interface JourneyData {
  day1?: DailyAnswers
  day2?: DailyAnswers
  day3?: DailyAnswers
}

export default function AtypicoApp() {
  const [step, setStep] = useState<Step>("welcome")
  const [currentDay, setCurrentDay] = useState(1)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [initialAnswers, setInitialAnswers] = useState<Partial<InitialAnswers>>({})
  const [journeyData, setJourneyData] = useState<JourneyData>({})
  const [currentDayAnswers, setCurrentDayAnswers] = useState<Partial<DailyAnswers>>({})
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showWhatsAppInvite, setShowWhatsAppInvite] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Garantir que está montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Carregar dados do localStorage apenas no cliente
  useEffect(() => {
    if (!mounted) return
    
    try {
      // Verificar lembretes pendentes
      checkPendingReminders()
      
      // Carregar dados do usuário
      const userData = getUserData()
      
      if (userData.profile && userData.profile.email) {
        setUserProfile(userData.profile)
      }
      
      if (userData.initialAnswers && Object.keys(userData.initialAnswers).length > 0) {
        setInitialAnswers(userData.initialAnswers as InitialAnswers)
      }
      
      if (userData.journeyData && Object.keys(userData.journeyData).length > 0) {
        setJourneyData(userData.journeyData as JourneyData)
      }
      
      setCurrentDay(userData.currentDay || 1)
      
      // Se tem perfil e respostas iniciais, mas não completou a jornada, ir para journey
      if (hasUserProfile() && userData.initialAnswers && Object.keys(userData.initialAnswers).length > 0) {
        if (!userData.day3CompletedAt) {
          setStep("journey")
        } else {
          setStep("report")
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    }
  }, [mounted])

  // Perguntas do questionário inicial
  const initialQuestions = [
    {
      key: "childAge",
      question: "Qual é a idade do seu filho(a)?",
      type: "select",
      options: ["0-2 anos", "3-5 anos", "6-8 anos", "9-12 anos", "Acima de 12 anos"]
    },
    {
      key: "concerns",
      question: "Quais comportamentos mais te preocupam?",
      type: "multiple",
      options: [
        "Dificuldade de comunicação",
        "Pouco contato visual",
        "Reações intensas a estímulos",
        "Dificuldade com mudanças de rotina",
        "Movimentos repetitivos",
        "Dificuldade de interação social"
      ]
    },
    {
      key: "familyHistory",
      question: "Há histórico de autismo ou neurodivergência na família?",
      type: "select",
      options: ["Sim", "Não", "Não sei"]
    },
    {
      key: "routineLevel",
      question: "Como é a rotina atual da criança?",
      type: "select",
      options: ["Muito estruturada", "Moderadamente estruturada", "Pouco estruturada", "Sem rotina definida"]
    },
    {
      key: "relationship",
      question: "Qual sua relação com o tema?",
      type: "select",
      options: ["Já tenho diagnóstico", "Suspeito de algo", "Apenas observando", "Buscando entender melhor"]
    }
  ]

  // Perguntas diárias
  const dailyQuestions = [
    {
      key: "sleep",
      question: "Como foi o sono da criança hoje?",
      placeholder: "Ex: Dormiu bem a noite toda, acordou várias vezes..."
    },
    {
      key: "reactions",
      question: "Como ela reagiu a barulhos, cheiros ou lugares novos?",
      placeholder: "Ex: Ficou incomodada com o barulho da TV..."
    },
    {
      key: "communication",
      question: "Como foi a comunicação ou contato visual hoje?",
      placeholder: "Ex: Olhou nos meus olhos ao conversar..."
    },
    {
      key: "crises",
      question: "Houve crises, choros ou reações intensas?",
      placeholder: "Ex: Teve uma crise na hora de trocar de roupa..."
    },
    {
      key: "happyMoment",
      question: "Qual foi o momento mais feliz do dia juntos?",
      placeholder: "Ex: Brincamos de esconde-esconde e ela riu muito..."
    }
  ]

  // Handler para completar o registro
  const handleRegistrationComplete = (data: { name: string; email: string; whatsapp: string }) => {
    const profile: UserProfile = {
      ...data,
      createdAt: new Date().toISOString()
    }
    
    setUserProfile(profile)
    saveUserProfile(profile)
    
    // Salvar respostas iniciais também
    if (Object.keys(initialAnswers).length > 0) {
      saveInitialAnswers(initialAnswers as StorageInitialAnswers)
    }
    
    // Mostrar convite para grupo do WhatsApp
    setShowWhatsAppInvite(true)
  }

  // Handler para fechar convite do WhatsApp e ir para jornada
  const handleWhatsAppInviteClose = () => {
    setShowWhatsAppInvite(false)
    setStep("journey")
  }

  // Tela de boas-vindas
  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Infinity className="w-10 h-10 text-purple-400" strokeWidth={2.5} />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Atypico
          </h1>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800">
            Você está fazendo o melhor que pode
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            E isso é um ótimo começo. Estamos aqui para te acompanhar nessa jornada de compreensão e amor.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-start gap-4 text-left">
            <Heart className="w-6 h-6 text-pink-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Acolhimento primeiro</h3>
              <p className="text-gray-600 text-sm">Linguagem empática, sem julgamentos ou rótulos</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <Calendar className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Jornada de 3 dias</h3>
              <p className="text-gray-600 text-sm">Perguntas simples sobre o dia a dia do seu filho</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 text-left">
            <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-1">Relatório personalizado</h3>
              <p className="text-gray-600 text-sm">Análise de padrões e recomendações práticas</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStep("initial-questionnaire")}
          className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
        >
          Começar agora
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-sm text-gray-500">
          Cada passo é uma vitória. Vamos juntos? 💜
        </p>
      </div>
    </div>
  )

  // Questionário inicial
  const InitialQuestionnaire = () => {
    const question = initialQuestions[currentQuestion]
    const [selectedOptions, setSelectedOptions] = useState<string[]>(
      Array.isArray(initialAnswers[question.key as keyof InitialAnswers]) 
        ? (initialAnswers[question.key as keyof InitialAnswers] as string[])
        : []
    )

    const handleNext = () => {
      const newAnswers = {
        ...initialAnswers,
        [question.key]: question.type === "multiple" ? selectedOptions : selectedOptions[0]
      }
      setInitialAnswers(newAnswers)

      if (currentQuestion < initialQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedOptions([])
      } else {
        // Questionário inicial completo - ir para registro
        setStep("registration")
        setCurrentQuestion(0)
      }
    }

    const toggleOption = (option: string) => {
      if (question.type === "multiple") {
        setSelectedOptions(prev =>
          prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
        )
      } else {
        setSelectedOptions([option])
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Conhecendo você</span>
              <span>{currentQuestion + 1} de {initialQuestions.length}</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / initialQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option) => (
                <button
                  key={option}
                  onClick={() => toggleOption(option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedOptions.includes(option)
                      ? "border-purple-400 bg-purple-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-purple-200 hover:bg-purple-50/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedOptions.includes(option)
                        ? "border-purple-400 bg-purple-400"
                        : "border-gray-300"
                    }`}>
                      {selectedOptions.includes(option) && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-gray-700">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={selectedOptions.length === 0}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {currentQuestion < initialQuestions.length - 1 ? "Próxima" : "Continuar"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            O que você observa hoje pode ser o começo de mais entendimento amanhã 🌱
          </p>
        </div>
      </div>
    )
  }

  // Jornada de 3 dias
  const JourneyScreen = () => {
    const question = dailyQuestions[currentQuestion]
    const [answer, setAnswer] = useState(
      currentDayAnswers[question.key as keyof DailyAnswers] || ""
    )

    const handleNext = () => {
      const newDayAnswers = {
        ...currentDayAnswers,
        [question.key]: answer
      }
      setCurrentDayAnswers(newDayAnswers)

      if (currentQuestion < dailyQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setAnswer("")
      } else {
        // Salvar dia completo
        const newJourneyData = {
          ...journeyData,
          [`day${currentDay}`]: newDayAnswers
        }
        setJourneyData(newJourneyData)
        
        // Salvar no storage
        saveJourneyDay(currentDay, newDayAnswers as StorageDailyAnswers)
        
        // Se completou o Dia 1, agendar lembretes
        if (currentDay === 1 && userProfile) {
          scheduleReminders({
            name: userProfile.name,
            email: userProfile.email,
            whatsapp: userProfile.whatsapp,
            day1CompletedAt: new Date().toISOString()
          })
        }
        
        if (currentDay < 3) {
          setCurrentDay(currentDay + 1)
          setCurrentQuestion(0)
          setCurrentDayAnswers({})
          setAnswer("")
        } else {
          setStep("report")
        }
      }
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-8">
          {/* Day indicator */}
          <div className="flex justify-center gap-4">
            {[1, 2, 3].map((day) => (
              <div
                key={day}
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  day === currentDay
                    ? "bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-lg"
                    : day < currentDay
                    ? "bg-green-100 text-green-600"
                    : "bg-white/50 text-gray-400"
                }`}
              >
                {day < currentDay ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Calendar className="w-5 h-5" />
                )}
                <span className="font-semibold">Dia {day}</span>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Dia {currentDay} - Observações</span>
              <span>{currentQuestion + 1} de {dailyQuestions.length}</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / dailyQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
              {question.question}
            </h2>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={question.placeholder}
              className="w-full min-h-[150px] p-4 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none resize-none text-gray-700"
            />

            <button
              onClick={handleNext}
              disabled={!answer.trim()}
              className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {currentQuestion < dailyQuestions.length - 1 
                ? "Próxima pergunta" 
                : currentDay < 3 
                ? "Finalizar dia" 
                : "Ver relatório"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Você está fazendo um trabalho incrível. Continue assim! 💙
          </p>
        </div>
      </div>
    )
  }

  // Relatório final
  const ReportScreen = () => {
    const patterns = [
      "Observamos que a rotina estruturada pode trazer mais conforto",
      "O contato visual e comunicação são áreas que merecem atenção carinhosa",
      "Momentos de alegria e conexão estão presentes no dia a dia",
      "Reações a estímulos sensoriais aparecem com frequência"
    ]

    const recommendations = [
      "Mantenha uma rotina previsível e visual (use calendários com imagens)",
      "Crie momentos de conexão sem pressão (brincadeiras que seu filho goste)",
      "Observe os gatilhos sensoriais e adapte o ambiente quando possível",
      "Celebre cada pequena conquista - elas são grandes vitórias"
    ]

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Seu relatório está pronto
            </h1>
            <p className="text-lg text-gray-600">
              Você completou 3 dias de observação. Isso é maravilhoso! 🎉
            </p>
          </div>

          {/* Emotional message */}
          <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-8 shadow-xl">
            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 text-pink-500 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Você está fazendo o melhor que pode
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  E isso é um ótimo começo. Cada observação, cada momento de atenção, cada pergunta que você faz 
                  mostra o quanto você se importa. Você não está sozinho(a) nessa jornada.
                </p>
              </div>
            </div>
          </div>

          {/* Patterns */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Padrões observados
              </h2>
            </div>
            <div className="space-y-4">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700">{pattern}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-semibold text-gray-800">
                Recomendações práticas
              </h2>
            </div>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-purple-400 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Professional advice */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              💡 Próximo passo importante
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Se você notou repetições desses comportamentos ou tem dúvidas, considere buscar uma avaliação 
              profissional com um neuropediatra ou psicólogo especializado. Quanto antes começar o acompanhamento, 
              mais ferramentas você terá para apoiar seu filho.
            </p>
          </div>

          {/* Premium CTA */}
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl p-8 shadow-2xl text-white">
            <div className="text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Continue acompanhando o progresso
              </h2>
              <p className="text-lg opacity-90">
                Com o plano Premium, você recebe orientações semanais personalizadas, 
                dicas práticas por IA e apoio emocional diário.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">R$ 19,90</div>
                  <div className="text-sm opacity-75">por mês</div>
                </div>
                <button
                  onClick={() => setStep("premium")}
                  className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Conhecer o Premium
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-4 pt-8">
            <p className="text-gray-600">
              Cada passo é uma vitória. Você está no caminho certo. 💜
            </p>
            <button
              onClick={() => {
                clearUserData()
                setStep("welcome")
                setCurrentDay(1)
                setCurrentQuestion(0)
                setInitialAnswers({})
                setJourneyData({})
                setCurrentDayAnswers({})
                setUserProfile(null)
              }}
              className="text-purple-400 hover:text-purple-600 font-semibold underline"
            >
              Começar nova jornada
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Premium screen
  const PremiumScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-purple-400 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Atypico Premium
          </h1>
          <p className="text-lg text-gray-600">
            Continue sua jornada com apoio contínuo e personalizado
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl space-y-6">
          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-gray-800 mb-2">R$ 19,90</div>
            <div className="text-gray-600">por mês</div>
          </div>

          <div className="space-y-4">
            {[
              "Diário comportamental contínuo (após os 3 dias)",
              "Relatórios semanais de evolução",
              "Dicas práticas personalizadas por IA",
              "Orientações emocionais diárias",
              "Histórico completo e comparação de progresso",
              "Suporte prioritário"
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <button className="w-full bg-gradient-to-r from-blue-400 to-purple-400 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            Assinar agora
          </button>

          <button
            onClick={() => setStep("report")}
            className="w-full text-purple-400 hover:text-purple-600 font-semibold"
          >
            Voltar ao relatório
          </button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Cancele quando quiser. Sem compromisso. 💜
        </p>
      </div>
    </div>
  )

  // Não renderizar até estar montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Infinity className="w-12 h-12 text-purple-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  // Render current step
  return (
    <>
      {step === "welcome" && <WelcomeScreen />}
      {step === "initial-questionnaire" && <InitialQuestionnaire />}
      {step === "registration" && (
        <RegistrationForm onComplete={handleRegistrationComplete} />
      )}
      {step === "journey" && <JourneyScreen />}
      {step === "report" && <ReportScreen />}
      {step === "premium" && <PremiumScreen />}
      
      {/* WhatsApp Group Invite Modal */}
      {showWhatsAppInvite && userProfile && (
        <WhatsAppGroupInvite 
          userName={userProfile.name} 
          onClose={handleWhatsAppInviteClose} 
        />
      )}
    </>
  )
}
