import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getGoogleCalendarAuthUrl, getAvailableSlots, getSuggestedSlots, createCalendarEvent } from "@/lib/google-calendar"

async function getCompanyId() {
  let company = await prisma.companyTenant.findFirst()
  if (!company) {
    company = await prisma.companyTenant.create({ data: { name: "Minha Empresa" } })
  }
  return company.id
}

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const url = new URL(req.url)
    const action = url.searchParams.get("action")

    // Get Google Calendar auth URL
    if (action === "auth-url") {
      const authUrl = getGoogleCalendarAuthUrl(companyId)
      return NextResponse.json({ url: authUrl })
    }

    // Get available slots
    if (action === "slots") {
      const days = parseInt(url.searchParams.get("days") || "7")
      const slots = await getAvailableSlots(companyId, days)
      return NextResponse.json({ slots })
    }

    // Get suggested slots (2 on different days)
    if (action === "suggested") {
      const suggestions = await getSuggestedSlots(companyId)
      return NextResponse.json({ suggestions })
    }

    // Default: return config + meetings
    let config = await prisma.calendarConfig.findUnique({ where: { companyId } })
    if (!config) {
      config = await prisma.calendarConfig.create({ data: { companyId } })
    }

    const meetings = await prisma.meeting.findMany({
      where: { companyId, date: { gte: new Date() } },
      orderBy: { date: "asc" },
      include: { lead: true },
    })

    return NextResponse.json({ 
      config: {
        ...config,
        // Don't expose tokens to frontend
        googleAccessToken: undefined,
        googleRefreshToken: undefined,
      }, 
      meetings 
    })
  } catch (error: any) {
    console.error("Calendar GET error:", error?.message)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()
    
    // Remove sensitive fields that shouldn't be updated directly
    const { googleAccessToken, googleRefreshToken, googleTokenExpiry, id, ...data } = body

    const config = await prisma.calendarConfig.upsert({
      where: { companyId },
      update: data,
      create: { companyId, ...data },
    })
    return NextResponse.json(config)
  } catch (error) {
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyId()
    const body = await req.json()

    // Disconnect Google Calendar
    if (body.action === "disconnect") {
      await prisma.calendarConfig.update({
        where: { companyId },
        data: {
          googleConnected: false,
          googleAccessToken: null,
          googleRefreshToken: null,
          googleTokenExpiry: null,
        },
      })
      return NextResponse.json({ success: true })
    }

    // Create meeting
    if (body.action === "create-meeting") {
      const { leadId, datetime, duration, title, attendeeEmail } = body
      
      const meetingDate = new Date(datetime)
      const meetingDuration = duration || 30

      // Create in Google Calendar if connected
      const config = await prisma.calendarConfig.findUnique({ where: { companyId } })
      let calendarEvent = null
      
      if (config?.googleConnected) {
        calendarEvent = await createCalendarEvent(
          companyId,
          title || "Reunião Comercial - ECO by Zen Power",
          meetingDate,
          meetingDuration,
          attendeeEmail,
        )
      }

      // Save meeting in DB
      const meeting = await prisma.meeting.create({
        data: {
          companyId,
          leadId,
          date: meetingDate,
          duration: meetingDuration,
          status: "SCHEDULED",
          notes: calendarEvent?.htmlLink ? `Google Calendar: ${calendarEvent.htmlLink}` : undefined,
        },
      })

      // Update lead status
      await prisma.lead.update({
        where: { id: leadId },
        data: { status: "reuniao_agendada", meetingDate },
      })

      return NextResponse.json({ meeting, calendarEvent })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error: any) {
    console.error("Calendar POST error:", error?.message)
    return NextResponse.json({ error: "Erro" }, { status: 500 })
  }
}
