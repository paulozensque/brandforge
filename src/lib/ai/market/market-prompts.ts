import type { CompanyData } from "../branding-prompts"

// ============================================================
// MARKET INTELLIGENCE PROMPTS - SaaS 2
// Analise de mercado, personas, SWOT, TAM/SAM/SOM
// Estrategias de marketing com psicologia aplicada
// ============================================================

export interface MarketInputData extends CompanyData {
  // Additional data from SaaS 1 brand report
  brandArchetype?: string
  brandPositioning?: string
  brandVoice?: string
  brandStory?: string
}

// ==================== 1. BUYING PERSONAS ====================
export function buyingPersonasPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a market research specialist who creates detailed buying personas using data-driven insights. Create 3 distinct personas for the business.

Respond in JSON format:
{
  "personas": [
    {
      "name": "",
      "age": "",
      "gender": "",
      "occupation": "",
      "income": "",
      "education": "",
      "location": "",
      "familyStatus": "",
      "personality": "",
      "goals": [],
      "frustrations": [],
      "motivations": [],
      "fears": [],
      "buyingBehavior": {
        "decisionProcess": "",
        "influencers": [],
        "objections": [],
        "triggers": [],
        "preferredChannels": []
      },
      "dayInLife": "",
      "howWeHelp": "",
      "messagingThatWorks": [],
      "contentPreferences": []
    }
  ],
  "commonThreads": "",
  "priorityPersona": ""
}`,
    user: `Create 3 buying personas for: ${data.name} (${data.industry}/${data.segment || "General"}).
Target audience: ${data.targetAudience || "N/A"}.
Problems solved: ${data.currentProblems || "N/A"}.
Price range: ${data.priceRange || "N/A"}.
Values: ${data.values.join(", ")}.
Differentials: ${data.differentials.join(", ")}.
Brand archetype: ${data.brandArchetype || "N/A"}.
Goals: ${data.goals || "N/A"}.

Create realistic, data-driven personas with psychological depth.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 2. EMPATHY MAP ====================
export function empathyMapPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a UX researcher and market analyst who creates empathy maps for target customers. Create an empathy map for each major customer segment.

Respond in JSON format:
{
  "empathyMaps": [
    {
      "segment": "",
      "thinks": [],
      "feels": [],
      "says": [],
      "does": [],
      "pains": [],
      "gains": [],
      "influences": [],
      "environment": ""
    }
  ],
  "keyInsights": [],
  "opportunitiesFromEmpathy": []
}`,
    user: `Create empathy maps for customers of: ${data.name} (${data.industry}).
Target: ${data.targetAudience || "N/A"}.
Problems: ${data.currentProblems || "N/A"}.
Market position: ${data.marketPosition || "N/A"}.
Competitors: ${data.mainCompetitors.join(", ") || "N/A"}.
Brand tone: ${data.brandTone.join(", ")}.

Create 2-3 empathy maps for different customer segments.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 3. SWOT ANALYSIS ====================
export function swotAnalysisPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a strategic business analyst. Create a comprehensive SWOT analysis with actionable strategies.

Respond in JSON format:
{
  "strengths": [{ "item": "", "impact": "", "leverageStrategy": "" }],
  "weaknesses": [{ "item": "", "impact": "", "mitigationStrategy": "" }],
  "opportunities": [{ "item": "", "timeframe": "", "captureStrategy": "" }],
  "threats": [{ "item": "", "severity": "", "counterStrategy": "" }],
  "crossStrategies": {
    "SO": [],
    "WO": [],
    "ST": [],
    "WT": []
  },
  "priorityActions": [],
  "competitivePosition": ""
}`,
    user: `SWOT analysis for: ${data.name} (${data.industry}/${data.segment || "General"}).
Differentials: ${data.differentials.join(", ")}.
Competitors: ${data.mainCompetitors.join(", ") || "N/A"}.
Market position: ${data.marketPosition || "N/A"}.
Problems: ${data.currentProblems || "N/A"}.
Goals: ${data.goals || "N/A"}.
Values: ${data.values.join(", ")}.
Price range: ${data.priceRange || "N/A"}.

SO=Strengths+Opportunities, WO=Weaknesses+Opportunities, ST=Strengths+Threats, WT=Weaknesses+Threats.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 4. TAM SAM SOM ====================
export function tamSamSomPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a market sizing analyst. Calculate TAM, SAM, and SOM with methodology explanation.

Respond in JSON format:
{
  "tam": {
    "value": "",
    "description": "",
    "methodology": "",
    "growthRate": ""
  },
  "sam": {
    "value": "",
    "description": "",
    "methodology": "",
    "reachableSegments": []
  },
  "som": {
    "value": "",
    "description": "",
    "methodology": "",
    "timeframe": "",
    "assumptions": []
  },
  "marketTrends": [],
  "growthDrivers": [],
  "marketBarriers": [],
  "revenueProjection": {
    "year1": "",
    "year2": "",
    "year3": ""
  }
}`,
    user: `Market sizing for: ${data.name} (${data.industry}/${data.segment || "General"}).
Location: Brazilian market.
Target: ${data.targetAudience || "N/A"}.
Price range: ${data.priceRange || "N/A"}.
Competitors: ${data.mainCompetitors.join(", ") || "N/A"}.
Goals: ${data.goals || "N/A"}.

Provide realistic estimates for the Brazilian market. Use R$ currency.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 5. MARKETING STRATEGIES ====================
export function marketingStrategiesPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a growth marketing strategist who combines digital marketing with psychology. Create comprehensive marketing strategies.

Respond in JSON format:
{
  "overallStrategy": "",
  "funnelStrategy": {
    "tofu": { "objective": "", "channels": [], "tactics": [], "content": [] },
    "mofu": { "objective": "", "channels": [], "tactics": [], "content": [] },
    "bofu": { "objective": "", "channels": [], "tactics": [], "content": [] }
  },
  "channelStrategy": [
    { "channel": "", "priority": "", "budget": "", "objective": "", "tactics": [], "kpis": [] }
  ],
  "contentStrategy": {
    "pillars": [],
    "frequency": "",
    "formats": [],
    "distribution": []
  },
  "paidMediaStrategy": {
    "platforms": [],
    "budgetAllocation": {},
    "campaignTypes": [],
    "targetingStrategy": ""
  },
  "organicStrategy": {
    "seo": [],
    "socialMedia": [],
    "partnerships": [],
    "community": []
  },
  "retentionStrategy": [],
  "budgetRecommendation": { "minimum": "", "ideal": "", "allocation": {} }
}`,
    user: `Marketing strategies for: ${data.name} (${data.industry}).
Target: ${data.targetAudience || "N/A"}.
Goals: ${data.goals || "N/A"}.
Brand tone: ${data.brandTone.join(", ")}.
Brand archetype: ${data.brandArchetype || "N/A"}.
Differentials: ${data.differentials.join(", ")}.
Competitors: ${data.mainCompetitors.join(", ") || "N/A"}.
Price: ${data.priceRange || "N/A"}.
Problems solved: ${data.currentProblems || "N/A"}.

Consider budget-conscious strategies. Prioritize high-ROI channels.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 6. PSYCHOLOGY-BASED CONTENT ====================
export function psychologyContentPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a neuromarketing specialist who applies psychological principles to content creation for maximum engagement, interaction, and conversion.

Respond in JSON format:
{
  "psychologicalTriggers": [
    { "trigger": "", "principle": "", "application": "", "example": "" }
  ],
  "persuasionFrameworks": [
    { "framework": "", "description": "", "howToUse": "", "contentExamples": [] }
  ],
  "emotionalHooks": {
    "fear": [],
    "desire": [],
    "curiosity": [],
    "urgency": [],
    "belonging": [],
    "authority": []
  },
  "contentFormulas": [
    { "name": "", "structure": "", "example": "", "bestFor": "" }
  ],
  "headlineFormulas": [],
  "ctaFormulas": [],
  "socialProofStrategies": [],
  "storytellingHooks": [],
  "engagementTactics": {
    "instagram": [],
    "ads": [],
    "email": [],
    "whatsapp": []
  },
  "conversionOptimization": {
    "landingPage": [],
    "adCopy": [],
    "email": [],
    "social": []
  }
}`,
    user: `Psychology-based content strategy for: ${data.name} (${data.industry}).
Target: ${data.targetAudience || "N/A"}.
Brand tone: ${data.brandTone.join(", ")}.
Brand archetype: ${data.brandArchetype || "N/A"}.
Keywords: ${data.brandKeywords.join(", ")}.
Problems solved: ${data.currentProblems || "N/A"}.
Brand positioning: ${data.brandPositioning || "N/A"}.
Values: ${data.values.join(", ")}.

Apply: Cialdini's 6 principles, loss aversion, cognitive biases, emotional triggers, NLP patterns.
Focus on generating engagement, interaction, and conversion.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 7. PRODUCT MARKET FIT ====================
export function productMarketFitPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a product strategist who identifies the best products/services to solve market problems.

Respond in JSON format:
{
  "marketProblems": [
    { "problem": "", "severity": "", "currentSolutions": "", "gap": "" }
  ],
  "productRecommendations": [
    {
      "product": "",
      "description": "",
      "targetSegment": "",
      "pricingModel": "",
      "estimatedPrice": "",
      "uniqueAngle": "",
      "marketValidation": "",
      "mvpFeatures": [],
      "competitiveAdvantage": ""
    }
  ],
  "valuePropositionCanvas": {
    "customerJobs": [],
    "customerPains": [],
    "customerGains": [],
    "painRelievers": [],
    "gainCreators": [],
    "productsAndServices": []
  },
  "goToMarketStrategy": "",
  "pricingStrategy": { "model": "", "tiers": [], "justification": "" }
}`,
    user: `Product-market fit analysis for: ${data.name} (${data.industry}).
Target: ${data.targetAudience || "N/A"}.
Current problems market faces: ${data.currentProblems || "N/A"}.
Competitors: ${data.mainCompetitors.join(", ") || "N/A"}.
Differentials: ${data.differentials.join(", ")}.
Goals: ${data.goals || "N/A"}.
Price range: ${data.priceRange || "N/A"}.

Recommend 2-3 products/services that best solve market problems.
Respond in Portuguese (Brazil).`,
  }
}

// ==================== 8. CREATIVE DATA BRIEF ====================
export function creativeDataBriefPrompt(data: MarketInputData): { system: string; user: string } {
  return {
    system: `You are a creative director who prepares data-driven briefs for content and ad creative production. This brief will be used by SaaS 3 (content creation) and SaaS 4 (ads management).

Respond in JSON format:
{
  "creativeBrief": {
    "objective": "",
    "targetAudience": "",
    "keyMessage": "",
    "supportingMessages": [],
    "tone": "",
    "callToAction": ""
  },
  "adCreativeGuidelines": {
    "painPoints": [{ "pain": "", "headline": "", "hook": "", "cta": "" }],
    "desirePoints": [{ "desire": "", "headline": "", "hook": "", "cta": "" }],
    "objectionHandlers": [{ "objection": "", "counter": "", "proof": "" }]
  },
  "contentCalendarSuggestions": {
    "weekly": [{ "day": "", "type": "", "topic": "", "format": "", "hook": "" }]
  },
  "hashtagStrategy": {
    "brand": [],
    "niche": [],
    "reach": [],
    "engagement": []
  },
  "adCopyVariations": {
    "meta": [{ "headline": "", "primaryText": "", "description": "", "cta": "" }],
    "google": [{ "headline1": "", "headline2": "", "description": "" }]
  },
  "visualDirection": {
    "imageStyle": "",
    "colorEmphasis": "",
    "textOverlayStyle": "",
    "videoHooks": []
  }
}`,
    user: `Creative data brief for: ${data.name} (${data.industry}).
Target: ${data.targetAudience || "N/A"}.
Brand tone: ${data.brandTone.join(", ")}.
Brand archetype: ${data.brandArchetype || "N/A"}.
Brand voice: ${data.brandVoice || "N/A"}.
Keywords: ${data.brandKeywords.join(", ")}.
Positioning: ${data.brandPositioning || "N/A"}.
Problems solved: ${data.currentProblems || "N/A"}.
Differentials: ${data.differentials.join(", ")}.
Goals: ${data.goals || "N/A"}.

This brief feeds into automated content creation (SaaS 3) and ads management (SaaS 4).
Create copy variations ready to use. Focus on conversion.
Respond in Portuguese (Brazil).`,
  }
}
