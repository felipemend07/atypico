// Sistema de armazenamento de dados do usuário

export interface UserProfile {
  name: string
  email: string
  whatsapp: string
  createdAt: string
}

export interface InitialAnswers {
  childAge: string
  concerns: string[]
  familyHistory: string
  routineLevel: string
  relationship: string
}

export interface DailyAnswers {
  sleep: string
  reactions: string
  communication: string
  crises: string
  happyMoment: string
}

export interface JourneyData {
  day1?: DailyAnswers
  day2?: DailyAnswers
  day3?: DailyAnswers
}

export interface UserData {
  profile: UserProfile
  initialAnswers: InitialAnswers
  journeyData: JourneyData
  currentDay: number
  day1CompletedAt?: string
  day2CompletedAt?: string
  day3CompletedAt?: string
}

// Salvar perfil do usuário
export function saveUserProfile(profile: UserProfile) {
  if (typeof window === "undefined") return
  
  try {
    const existingData = getUserData()
    const updatedData: UserData = {
      ...existingData,
      profile: {
        ...profile,
        createdAt: profile.createdAt || new Date().toISOString()
      }
    }
    
    localStorage.setItem("atypico-user-data", JSON.stringify(updatedData))
    
    // Também salvar em uma lista de todos os usuários (para analytics futuro)
    saveToUsersList(updatedData)
    
    return updatedData
  } catch (error) {
    console.error("Erro ao salvar perfil:", error)
    return null
  }
}

// Salvar respostas do questionário inicial
export function saveInitialAnswers(answers: InitialAnswers) {
  if (typeof window === "undefined") return
  
  try {
    const existingData = getUserData()
    const updatedData: UserData = {
      ...existingData,
      initialAnswers: answers
    }
    
    localStorage.setItem("atypico-user-data", JSON.stringify(updatedData))
    return updatedData
  } catch (error) {
    console.error("Erro ao salvar respostas iniciais:", error)
    return null
  }
}

// Salvar dados da jornada diária
export function saveJourneyDay(day: number, answers: DailyAnswers) {
  if (typeof window === "undefined") return
  
  try {
    const existingData = getUserData()
    const completedAtKey = `day${day}CompletedAt` as keyof UserData
    
    const updatedData: UserData = {
      ...existingData,
      journeyData: {
        ...existingData.journeyData,
        [`day${day}`]: answers
      },
      currentDay: day < 3 ? day + 1 : 3,
      [completedAtKey]: new Date().toISOString()
    }
    
    localStorage.setItem("atypico-user-data", JSON.stringify(updatedData))
    return updatedData
  } catch (error) {
    console.error("Erro ao salvar dia da jornada:", error)
    return null
  }
}

// Obter dados completos do usuário
export function getUserData(): UserData {
  if (typeof window === "undefined") {
    return {
      profile: {} as UserProfile,
      initialAnswers: {} as InitialAnswers,
      journeyData: {},
      currentDay: 1
    }
  }
  
  try {
    const stored = localStorage.getItem("atypico-user-data")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
  }
  
  return {
    profile: {} as UserProfile,
    initialAnswers: {} as InitialAnswers,
    journeyData: {},
    currentDay: 1
  }
}

// Verificar se usuário já tem perfil cadastrado
export function hasUserProfile(): boolean {
  const data = getUserData()
  return !!(data.profile && data.profile.email)
}

// Limpar dados do usuário
export function clearUserData() {
  if (typeof window === "undefined") return
  
  try {
    localStorage.removeItem("atypico-user-data")
    localStorage.removeItem("atypico-data") // Limpar dados antigos também
  } catch (error) {
    console.error("Erro ao limpar dados:", error)
  }
}

// Salvar na lista de usuários (para analytics e relatórios futuros)
function saveToUsersList(userData: UserData) {
  if (typeof window === "undefined") return
  
  try {
    const usersList = localStorage.getItem("atypico-users-list")
    const users = usersList ? JSON.parse(usersList) : []
    
    // Verificar se usuário já existe na lista
    const existingIndex = users.findIndex(
      (u: UserData) => u.profile.email === userData.profile.email
    )
    
    if (existingIndex >= 0) {
      users[existingIndex] = userData
    } else {
      users.push(userData)
    }
    
    localStorage.setItem("atypico-users-list", JSON.stringify(users))
  } catch (error) {
    console.error("Erro ao salvar na lista de usuários:", error)
  }
}

// Obter estatísticas gerais (para dashboard futuro)
export function getUserStats() {
  if (typeof window === "undefined") return null
  
  try {
    const usersList = localStorage.getItem("atypico-users-list")
    const users: UserData[] = usersList ? JSON.parse(usersList) : []
    
    return {
      totalUsers: users.length,
      completedDay1: users.filter(u => u.day1CompletedAt).length,
      completedDay2: users.filter(u => u.day2CompletedAt).length,
      completedDay3: users.filter(u => u.day3CompletedAt).length,
      completedJourney: users.filter(u => u.day3CompletedAt).length
    }
  } catch (error) {
    console.error("Erro ao obter estatísticas:", error)
    return null
  }
}

// Exportar dados do usuário (para backup ou migração)
export function exportUserData(): string | null {
  const data = getUserData()
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    console.error("Erro ao exportar dados:", error)
    return null
  }
}

// Importar dados do usuário (para restauração)
export function importUserData(jsonData: string): boolean {
  if (typeof window === "undefined") return false
  
  try {
    const data = JSON.parse(jsonData)
    localStorage.setItem("atypico-user-data", JSON.stringify(data))
    return true
  } catch (error) {
    console.error("Erro ao importar dados:", error)
    return false
  }
}
