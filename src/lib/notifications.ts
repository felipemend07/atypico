// Sistema de lembretes automáticos para e-mail e WhatsApp

export interface ReminderData {
  name: string
  email: string
  whatsapp: string
  day1CompletedAt: string
}

export interface ReminderSchedule {
  day: number
  hoursAfterDay1: number
  message: string
}

// Configuração dos lembretes
export const reminderSchedules: ReminderSchedule[] = [
  {
    day: 2,
    hoursAfterDay1: 24,
    message: "Oi {name}, tudo bem? É hora de continuar sua jornada de descoberta com seu filho 💙 Clique aqui para responder o Dia 2."
  },
  {
    day: 3,
    hoursAfterDay1: 48,
    message: "Seu progresso está incrível. Hoje é o último dia da sua jornada Atypica. Vamos juntos?"
  }
]

// Função para agendar lembretes
export function scheduleReminders(data: ReminderData) {
  const day1Date = new Date(data.day1CompletedAt)
  
  reminderSchedules.forEach(schedule => {
    const reminderDate = new Date(day1Date.getTime() + schedule.hoursAfterDay1 * 60 * 60 * 1000)
    const message = schedule.message.replace("{name}", data.name)
    
    // Salvar no localStorage para verificação posterior
    const reminders = getScheduledReminders()
    reminders.push({
      id: `${data.email}-day${schedule.day}`,
      userData: data,
      schedule,
      scheduledFor: reminderDate.toISOString(),
      message,
      sent: false
    })
    
    if (typeof window !== "undefined") {
      localStorage.setItem("atypico-reminders", JSON.stringify(reminders))
    }
  })
}

// Função para obter lembretes agendados
export function getScheduledReminders() {
  if (typeof window === "undefined") return []
  
  try {
    const stored = localStorage.getItem("atypico-reminders")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Função para verificar e enviar lembretes pendentes
export function checkPendingReminders() {
  const reminders = getScheduledReminders()
  const now = new Date()
  
  const updatedReminders = reminders.map((reminder: any) => {
    if (!reminder.sent && new Date(reminder.scheduledFor) <= now) {
      // Aqui você integraria com serviços de e-mail e WhatsApp
      // Por enquanto, apenas marcamos como enviado
      console.log(`Lembrete enviado para ${reminder.userData.name}: ${reminder.message}`)
      
      // Em produção, você faria chamadas para APIs de e-mail e WhatsApp aqui
      // sendEmail(reminder.userData.email, reminder.message)
      // sendWhatsApp(reminder.userData.whatsapp, reminder.message)
      
      return { ...reminder, sent: true, sentAt: now.toISOString() }
    }
    return reminder
  })
  
  if (typeof window !== "undefined") {
    localStorage.setItem("atypico-reminders", JSON.stringify(updatedReminders))
  }
  
  return updatedReminders
}

// Função para criar link direto para o dia específico
export function getDayLink(day: number): string {
  if (typeof window === "undefined") return ""
  return `${window.location.origin}?day=${day}`
}

// Função para enviar e-mail (placeholder - integrar com serviço real)
export async function sendEmailReminder(email: string, name: string, day: number, message: string) {
  // Integração com serviço de e-mail (SendGrid, Resend, etc.)
  console.log(`E-mail para ${email}:`, message)
  
  // Exemplo de payload para API de e-mail:
  const emailData = {
    to: email,
    subject: `Atypico - Continue sua jornada (Dia ${day})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5CF6;">Olá, ${name}! 💜</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #374151;">
          ${message}
        </p>
        <a href="${getDayLink(day)}" 
           style="display: inline-block; background: linear-gradient(to right, #60A5FA, #A78BFA); 
                  color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; 
                  font-weight: bold; margin-top: 20px;">
          Continuar minha jornada
        </a>
        <p style="font-size: 14px; color: #6B7280; margin-top: 30px;">
          Você está fazendo o melhor que pode. Continue assim! 🌱
        </p>
      </div>
    `
  }
  
  // return await fetch('/api/send-email', { method: 'POST', body: JSON.stringify(emailData) })
}

// Função para enviar WhatsApp (placeholder - integrar com serviço real)
export async function sendWhatsAppReminder(whatsapp: string, name: string, day: number, message: string) {
  // Integração com API de WhatsApp (Twilio, WhatsApp Business API, etc.)
  console.log(`WhatsApp para ${whatsapp}:`, message)
  
  const whatsappData = {
    to: whatsapp.replace(/\D/g, ""),
    message: `${message}\n\n${getDayLink(day)}`
  }
  
  // return await fetch('/api/send-whatsapp', { method: 'POST', body: JSON.stringify(whatsappData) })
}
