import { prisma } from "@/lib/db"

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const REDIRECT_URI = process.env.NEXTAUTH_URL 
  ? `${process.env.NEXTAUTH_URL}/api/sdr/calendar/callback`
  : "https://brandforge-xenr.vercel.app/api/sdr/calendar/callback"

// Generate OAuth URL for Google Calendar
export function getGoogleCalendarAuthUrl(companyId: string): string {
  const scopes = [
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/calendar.events",
  ]
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: scopes.join(" "),
    access_type: "offline",
    prompt: "consent",
    state: companyId,
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Token exchange failed: ${JSON.stringify(error)}`)
  }

  return res.json()
}

// Refresh access token
async function refreshAccessToken(refreshToken: string): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  })

  if (!res.ok) throw new Error("Failed to refresh token")
  
  const data = await res.json()
  return data.access_token
}

// Get valid access token (refresh if expired)
async function getValidToken(companyId: string): Promise<string | null> {
  const config = await prisma.calendarConfig.findUnique({ where: { companyId } })
  if (!config?.googleConnected || !config?.googleAccessToken) return null

  // Check if token is expired
  if (config.googleTokenExpiry && new Date(config.googleTokenExpiry) < new Date()) {
    if (!config.googleRefreshToken) return null
    
    try {
      const newToken = await refreshAccessToken(config.googleRefreshToken)
      await prisma.calendarConfig.update({
        where: { companyId },
        data: { 
          googleAccessToken: newToken,
          googleTokenExpiry: new Date(Date.now() + 3500 * 1000), // ~1 hour
        },
      })
      return newToken
    } catch {
      return null
    }
  }

  return config.googleAccessToken
}

// Get free/busy info for a time range
export async function getFreeBusy(
  companyId: string, 
  timeMin: Date, 
  timeMax: Date
): Promise<{ start: string; end: string }[]> {
  const token = await getValidToken(companyId)
  if (!token) return []

  const config = await prisma.calendarConfig.findUnique({ where: { companyId } })
  const calendarId = config?.googleCalendarId || "primary"

  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        items: [{ id: calendarId }],
      }),
    })

    if (!res.ok) return []

    const data = await res.json()
    return data.calendars?.[calendarId]?.busy || []
  } catch {
    return []
  }
}

// Get available slots for scheduling
export async function getAvailableSlots(
  companyId: string,
  daysAhead: number = 7
): Promise<{ date: string; time: string; datetime: string }[]> {
  const config = await prisma.calendarConfig.findUnique({ where: { companyId } })
  if (!config) return []

  const now = new Date()
  const endDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000)
  
  // Get busy times from Google Calendar
  const busySlots = config.googleConnected 
    ? await getFreeBusy(companyId, now, endDate)
    : []

  const availableSlots: { date: string; time: string; datetime: string }[] = []
  const duration = config.meetingDuration || 30
  const startHour = parseInt(config.startTime.split(":")[0]) || 9
  const startMin = parseInt(config.startTime.split(":")[1]) || 0
  const endHour = parseInt(config.endTime.split(":")[0]) || 18
  const endMin = parseInt(config.endTime.split(":")[1]) || 0

  const dayMap: Record<string, number> = {
    dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
  }
  const availableDayNumbers = (config.availableDays || ["seg", "ter", "qua", "qui", "sex"])
    .map(d => dayMap[d])
    .filter(d => d !== undefined)

  // Iterate through each day
  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000)
    
    // Skip unavailable days
    if (!availableDayNumbers.includes(date.getDay())) continue

    // Generate slots for this day
    const dayStart = new Date(date)
    dayStart.setHours(startHour, startMin, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(endHour, endMin, 0, 0)

    // If today, start from next available slot
    if (d === 0) {
      const minStart = new Date(now.getTime() + 60 * 60 * 1000) // at least 1 hour from now
      if (minStart > dayStart) {
        // Round up to next slot
        const mins = minStart.getMinutes()
        const roundedMins = Math.ceil(mins / duration) * duration
        dayStart.setHours(minStart.getHours(), roundedMins, 0, 0)
      }
    }

    let slotStart = new Date(dayStart)
    while (slotStart.getTime() + duration * 60000 <= dayEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + duration * 60000)

      // Check if slot conflicts with busy times
      const isConflict = busySlots.some(busy => {
        const busyStart = new Date(busy.start).getTime()
        const busyEnd = new Date(busy.end).getTime()
        return slotStart.getTime() < busyEnd && slotEnd.getTime() > busyStart
      })

      if (!isConflict) {
        availableSlots.push({
          date: date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
          time: slotStart.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          datetime: slotStart.toISOString(),
        })
      }

      slotStart = new Date(slotStart.getTime() + duration * 60000)
    }
  }

  return availableSlots
}

// Get 2 suggested slots on different days
export async function getSuggestedSlots(companyId: string): Promise<{ date: string; time: string; datetime: string }[]> {
  const slots = await getAvailableSlots(companyId, 14)
  if (slots.length === 0) return []

  // Get first available slot
  const first = slots[0]
  
  // Get second slot on a different day
  const secondDaySlots = slots.filter(s => s.date !== first.date)
  const second = secondDaySlots[0] || slots[1]

  return second ? [first, second] : [first]
}

// Create calendar event
export async function createCalendarEvent(
  companyId: string,
  summary: string,
  startTime: Date,
  duration: number,
  attendeeEmail?: string,
  description?: string,
): Promise<{ success: boolean; eventId?: string; htmlLink?: string }> {
  const token = await getValidToken(companyId)
  if (!token) return { success: false }

  const config = await prisma.calendarConfig.findUnique({ where: { companyId } })
  const calendarId = config?.googleCalendarId || "primary"

  const endTime = new Date(startTime.getTime() + duration * 60000)

  const event: any = {
    summary,
    description: description || "Reunião agendada via ECO by Zen Power",
    start: { dateTime: startTime.toISOString(), timeZone: "America/Sao_Paulo" },
    end: { dateTime: endTime.toISOString(), timeZone: "America/Sao_Paulo" },
    reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 15 }] },
  }

  if (attendeeEmail) {
    event.attendees = [{ email: attendeeEmail }]
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    )

    if (!res.ok) return { success: false }

    const data = await res.json()
    return { success: true, eventId: data.id, htmlLink: data.htmlLink }
  } catch {
    return { success: false }
  }
}

// Check if a specific time slot is available
export async function isSlotAvailable(companyId: string, datetime: Date, duration: number = 30): Promise<boolean> {
  const slotEnd = new Date(datetime.getTime() + duration * 60000)
  const busySlots = await getFreeBusy(companyId, datetime, slotEnd)
  return busySlots.length === 0
}

// Find nearest available slot to requested time
export async function findNearestSlot(
  companyId: string, 
  requestedTime: Date, 
  duration: number = 30
): Promise<{ datetime: string; date: string; time: string } | null> {
  // Check 1 hour before and after
  const beforeTime = new Date(requestedTime.getTime() - 60 * 60 * 1000)
  const afterTime = new Date(requestedTime.getTime() + 2 * 60 * 60 * 1000)
  
  const slots = await getAvailableSlots(companyId, 1)
  
  // Filter slots within the range
  const nearbySlots = slots.filter(s => {
    const t = new Date(s.datetime).getTime()
    return t >= beforeTime.getTime() && t <= afterTime.getTime()
  })

  if (nearbySlots.length === 0) return null

  // Find closest to requested time
  nearbySlots.sort((a, b) => {
    const diffA = Math.abs(new Date(a.datetime).getTime() - requestedTime.getTime())
    const diffB = Math.abs(new Date(b.datetime).getTime() - requestedTime.getTime())
    return diffA - diffB
  })

  return nearbySlots[0]
}
