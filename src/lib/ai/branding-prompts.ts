export interface CompanyData {
  name: string
  industry: string
  segment?: string
  mission?: string
  vision?: string
  purpose?: string
  values: string[]
  differentials: string[]
  targetAudience?: string
  mainCompetitors: string[]
  marketPosition?: string
  priceRange?: string
  brandTone: string[]
  brandKeywords: string[]
  inspirations: string[]
  avoidWords: string[]
  currentProblems?: string
  goals?: string
}

export function brandArchetypePrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a senior brand strategist specializing in Jungian archetypes applied to brand positioning. Analyze companies and determine their primary and secondary brand archetypes from the 12 Jungian archetypes. Respond in JSON format with: primaryArchetype (name, percentage, description, traits), secondaryArchetype (name, percentage, description, traits), archetypeBlend, communicationStyle, brandVoiceFromArchetype, examplesOfBrandsWithSameArchetype, howToApply.`,
    user: `Analyze brand archetype for: ${company.name} (${company.industry}). Purpose: ${company.purpose || "N/A"}. Values: ${company.values.join(", ")}. Target: ${company.targetAudience || "N/A"}. Tone: ${company.brandTone.join(", ")}. Keywords: ${company.brandKeywords.join(", ")}. Differentials: ${company.differentials.join(", ")}. Goals: ${company.goals || "N/A"}. Respond in Portuguese (Brazil).`,
  }
}

export function goldenCirclePrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a brand purpose consultant using Simon Sinek's Golden Circle. Respond in JSON: why (statement, explanation, emotionalConnection), how (statement, processes, values), what (statement, products, results), purposeStatement, manifesto, elevatorPitch30s, elevatorPitch60s.`,
    user: `Create Golden Circle for: ${company.name} (${company.industry}). Mission: ${company.mission || "N/A"}. Vision: ${company.vision || "N/A"}. Purpose: ${company.purpose || "N/A"}. Values: ${company.values.join(", ")}. Differentials: ${company.differentials.join(", ")}. Target: ${company.targetAudience || "N/A"}. Problems: ${company.currentProblems || "N/A"}. Goals: ${company.goals || "N/A"}. Respond in Portuguese (Brazil).`,
  }
}

export function brandPositioningPrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a strategic brand positioning consultant using Al Ries and Jack Trout frameworks. Respond in JSON: positioningStatement, tagline, taglineAlternatives, categoryOfOne, uniqueValueProposition, competitiveDifferentiation, brandPromise, reasonsToBelieve, brandEssence, oneLiner.`,
    user: `Create positioning for: ${company.name} (${company.industry}/${company.segment || "General"}). Competitors: ${company.mainCompetitors.join(", ") || "N/A"}. Position: ${company.marketPosition || "N/A"}. Price: ${company.priceRange || "N/A"}. Target: ${company.targetAudience || "N/A"}. Differentials: ${company.differentials.join(", ")}. Purpose: ${company.purpose || "N/A"}. Respond in Portuguese (Brazil).`,
  }
}

export function brandVoicePrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a brand communications specialist. Respond in JSON: voiceAttributes (array of attribute, description, doExample, dontExample), toneSpectrum (formal_casual, serious_playful, respectful_irreverent, matter_of_fact_enthusiastic as 1-10), writingGuidelines, socialMediaVoice, doList, dontList, samplePosts, keyPhrases, vocabularyBank (power_words, connecting_words, action_words).`,
    user: `Create voice guidelines for: ${company.name} (${company.industry}). Tone: ${company.brandTone.join(", ")}. Keywords: ${company.brandKeywords.join(", ")}. Avoid: ${company.avoidWords.join(", ") || "N/A"}. Target: ${company.targetAudience || "N/A"}. Inspirations: ${company.inspirations.join(", ") || "N/A"}. Values: ${company.values.join(", ")}. Respond in Portuguese (Brazil).`,
  }
}

export function brandStoryPrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a storytelling specialist using StoryBrand (Donald Miller). Respond in JSON: storyBrandFramework (hero, problem: {external, internal, philosophical}, guide, plan, callToAction, successResult, failureResult), brandNarrative, originStory, customerStoryTemplate, contentPillars (array of pillar, description, contentIdeas), emotionalHooks.`,
    user: `Create brand story for: ${company.name} (${company.industry}). Purpose: ${company.purpose || "N/A"}. Target: ${company.targetAudience || "N/A"}. Problems: ${company.currentProblems || "N/A"}. Goals: ${company.goals || "N/A"}. Differentials: ${company.differentials.join(", ")}. Values: ${company.values.join(", ")}. Respond in Portuguese (Brazil).`,
  }
}

export function visualIdentityPrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a brand identity designer. Respond in JSON: colorPalette (primary, secondary, accent, neutral, background - each with hex, name, psychology), typography (headline, body, accent - each with family, weight, style), visualStyle (aesthetic, photographyStyle, illustrationStyle, iconStyle, patterns), moodboard, logoGuidelines (style, characteristics, avoid), socialMediaAesthetic (feedStyle, colorUsage, contentFormat). Use Google Fonts.`,
    user: `Create visual identity for: ${company.name} (${company.industry}/${company.segment || "General"}). Tone: ${company.brandTone.join(", ")}. Keywords: ${company.brandKeywords.join(", ")}. Inspirations: ${company.inspirations.join(", ") || "N/A"}. Target: ${company.targetAudience || "N/A"}. Price: ${company.priceRange || "N/A"}. Values: ${company.values.join(", ")}. Respond in Portuguese (Brazil).`,
  }
}

export function competitorAnalysisPrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a competitive intelligence analyst. Respond in JSON: competitorMap (array of name, strengths, weaknesses, positioning), differentiationOpportunities, blueOceanStrategy (eliminate, reduce, raise, create), competitiveAdvantages, marketGaps, recommendations.`,
    user: `Analyze competition for: ${company.name} (${company.industry}). Competitors: ${company.mainCompetitors.join(", ") || "Generic in " + company.industry}. Position: ${company.marketPosition || "N/A"}. Differentials: ${company.differentials.join(", ")}. Price: ${company.priceRange || "N/A"}. Target: ${company.targetAudience || "N/A"}. Respond in Portuguese (Brazil).`,
  }
}

export function brandEcosystemPrompt(company: CompanyData): { system: string; user: string } {
  return {
    system: `You are a brand strategy consultant. Respond in JSON: brandEcosystem (coreProduct, extensions, touchpoints, partnerships, community), actionPlan (immediate, shortTerm, mediumTerm - each array of action, priority, timeframe, impact), kpis (array of metric, target, timeframe), quickWins, investmentPriorities.`,
    user: `Create ecosystem and action plan for: ${company.name} (${company.industry}). Goals: ${company.goals || "Growth"}. Problems: ${company.currentProblems || "N/A"}. Target: ${company.targetAudience || "N/A"}. Competitors: ${company.mainCompetitors.join(", ") || "N/A"}. Values: ${company.values.join(", ")}. Differentials: ${company.differentials.join(", ")}. Create practical, budget-conscious plan. Respond in Portuguese (Brazil).`,
  }
}
