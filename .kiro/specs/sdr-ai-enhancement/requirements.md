# Requirements Document

## Introduction

Aprimoramento do SDR AI da plataforma "ECO by Zen Power" para tornar as conversas mais naturais e humanas, adicionar personalidade adaptativa ao assistente, e implementar um sistema de aprendizado contínuo baseado em conversas bem-sucedidas, feedback do usuário e padrões de alta performance. O sistema segue metodologias de qualificação e conversão de The Futur (Chris Do) e King Kong (Sabri Suby).

## Glossary

- **SDR_Engine**: Módulo principal de processamento de IA que gera respostas conversacionais para leads via WhatsApp
- **Learning_System**: Sistema que coleta, analisa e aplica padrões de conversas anteriores para melhorar respostas futuras
- **Conversation_Analyzer**: Componente que avalia conversas concluídas e extrai padrões de sucesso ou falha
- **Prompt_Builder**: Componente responsável por construir o prompt do sistema com contexto dinâmico, personalidade e aprendizados
- **Lead**: Potencial cliente que interage com o SDR via WhatsApp
- **Conversation_Pattern**: Padrão extraído de conversas anteriores contendo estratégias, frases e abordagens eficazes
- **Feedback_Entry**: Registro de correção ou avaliação feita pelo operador humano sobre uma resposta do SDR
- **Conversion_Event**: Evento que indica sucesso comercial (reunião agendada, proposta enviada, venda fechada)
- **Personality_Profile**: Conjunto de características comportamentais do SDR (empatia, assertividade, humor, formalidade)
- **Context_Window**: Janela de mensagens anteriores utilizadas para manter coerência conversacional

## Requirements

### Requirement 1: Conversação Natural e Contextual

**User Story:** As a business owner, I want the SDR AI to respond in a natural, human-like manner, so that leads feel they are talking to a real person and engagement increases.

#### Acceptance Criteria

1. WHEN a Lead sends a message, THE SDR_Engine SHALL generate a response that references or builds upon relevant information from the conversation history within the Context_Window of the last 30 messages, and deliver the response within 15 seconds
2. WHEN a Lead uses informal language or slang, THE SDR_Engine SHALL adapt its language register to match the Lead's communication style while avoiding profanity, offensive content, and discriminatory language
3. WHEN a Lead asks a question unrelated to the qualification flow, THE SDR_Engine SHALL provide a direct answer or indicate it cannot answer that topic, before steering back to the commercial objective within 2 messages
4. THE SDR_Engine SHALL avoid using the same opening phrase or sentence structure in any 3 consecutive responses within the same conversation
5. WHEN a Lead expresses emotion (frustration, excitement, urgency), THE SDR_Engine SHALL include an explicit reference to the detected emotion in its response before proceeding with the qualification flow
6. THE SDR_Engine SHALL limit each response to a maximum of 3 sentences, unless the Lead explicitly asks for detailed information, in which case the response SHALL not exceed 8 sentences
7. IF the conversation history within the Context_Window is unavailable or contains fewer than 1 prior message, THEN THE SDR_Engine SHALL generate a response based only on the current message and the Lead's profile data without referencing prior exchanges

### Requirement 2: Personality and Adaptability

**User Story:** As a business owner, I want to configure the SDR AI personality characteristics, so that it represents my brand voice accurately and adapts to different lead profiles.

#### Acceptance Criteria

1. THE Prompt_Builder SHALL incorporate the Personality_Profile attributes (empatia, assertividade, humor, formalidade), each defined on a scale of 0 to 10, into the system prompt of every generated response such that the tone instructions reference the configured values
2. WHEN AiSettings are updated with new personality parameters, THE Prompt_Builder SHALL apply the changes to all subsequent conversations within 1 second
3. WHILE a conversation has fewer than 3 messages, THE SDR_Engine SHALL use open-ended discovery questions and greet the Lead by name (if available), avoiding direct qualification or sales-oriented language
4. WHILE a Lead has a score above 70, THE SDR_Engine SHALL include a call-to-action proposing a meeting or next commercial step in every response
5. WHEN a Lead has been previously classified as HOT, THE SDR_Engine SHALL propose available meeting times within the first 2 messages of a new conversation instead of asking additional qualification questions
6. WHEN a Lead raises a price or timing objection, THE SDR_Engine SHALL respond by reframing the conversation around cost-of-inaction and return-on-investment before addressing the objection directly
7. WHEN presenting services or differentials, THE SDR_Engine SHALL frame the value in terms of measurable outcomes and results for the Lead rather than listing features or technical details
8. IF a Personality_Profile attribute value is outside the 0 to 10 range, THEN THE Prompt_Builder SHALL reject the update and return an error message indicating the valid range

### Requirement 3: Learning from Successful Conversations

**User Story:** As a business owner, I want the SDR AI to learn from conversations that resulted in conversions, so that it replicates successful patterns in future interactions.

#### Acceptance Criteria

1. WHEN a Conversion_Event occurs (meeting scheduled, status changed to "reuniao_agendada"), THE Conversation_Analyzer SHALL analyze the completed conversation and extract Conversation_Patterns within 60 seconds of the event
2. WHEN analyzing a successful conversation with at least 4 messages exchanged, THE Conversation_Analyzer SHALL identify opening strategies, objection responses, and closing techniques that preceded the Conversion_Event
3. THE Learning_System SHALL store extracted Conversation_Patterns with metadata including conversion type, lead classification, and industry segment
4. WHEN generating a response, THE Prompt_Builder SHALL include up to 3 Conversation_Patterns from successful conversations matching the current Lead's classification and industry segment
5. THE Learning_System SHALL weight Conversation_Patterns by recency and conversion rate, applying a 2x multiplier to patterns from the last 30 days relative to older patterns
6. IF a Conversion_Event triggers analysis but the conversation contains fewer than 4 messages, THEN THE Conversation_Analyzer SHALL skip pattern extraction and log the event without generating Conversation_Patterns
7. IF no matching Conversation_Patterns exist for the current Lead's classification and industry segment, THEN THE Prompt_Builder SHALL fall back to general Conversation_Patterns regardless of segment, selecting the 3 highest-rated patterns by conversion rate

### Requirement 4: Learning from Failed Conversations

**User Story:** As a business owner, I want the SDR AI to learn from lost leads, so that it avoids repeating mistakes that drive potential customers away.

#### Acceptance Criteria

1. WHEN a conversation status changes to COMPLETED without a Conversion_Event AND the conversation contains at least 3 messages, THE Conversation_Analyzer SHALL analyze the conversation for failure patterns within 60 seconds
2. THE Conversation_Analyzer SHALL identify the last SDR message sent before the Lead's final message or disengagement (no response for 7 days) as the potential failure point
3. THE Learning_System SHALL store anti-patterns with metadata including: the SDR message content, the Lead's preceding message, the Lead's final response (if any), lead classification, and conversation phase at failure
4. WHEN generating a response, THE Prompt_Builder SHALL include up to 3 anti-patterns relevant to the current conversation phase and cross-check the proposed response for similar phrasing
5. IF the SDR_Engine generates a response that contains a substring of 10 or more consecutive words matching a known anti-pattern, THEN THE SDR_Engine SHALL regenerate an alternative response up to a maximum of 2 regeneration attempts

### Requirement 5: Human Feedback and Corrections

**User Story:** As a business owner, I want to provide feedback on SDR responses and correct mistakes, so that the AI learns from my expertise and improves accuracy.

#### Acceptance Criteria

1. WHEN an operator submits a Feedback_Entry for a specific message, THE Learning_System SHALL store the original response, the corrected content (maximum 2000 characters), and the conversation context consisting of the last 10 messages preceding the corrected message
2. THE Learning_System SHALL categorize each Feedback_Entry by type: tone correction, factual correction, strategy correction, or response quality, based on the operator's selection at submission time
3. WHEN generating a response for a conversation whose lead classification, industry segment, and conversation phase match a stored Feedback_Entry's context, THE Prompt_Builder SHALL incorporate up to 3 most recent relevant Feedback_Entries as examples of preferred behavior
4. WHEN a Feedback_Entry correction conflicts with the rules field defined in AiSettings (i.e., the correction instructs behavior that the rules explicitly prohibit or vice-versa), THE Learning_System SHALL flag the conflict by displaying a notification to the operator within the SDR settings interface and SHALL not apply the Feedback_Entry until the operator resolves the conflict
5. WHEN the Learning_System detects 5 or more Feedback_Entries of the same feedbackType targeting the same topic within a 30-day period, THE Learning_System SHALL surface a suggested AiSettings update to the operator via the settings interface within 24 hours of reaching the threshold

### Requirement 6: Pattern Recognition and Performance Analytics

**User Story:** As a business owner, I want to see which conversation strategies are working best, so that I can make data-driven decisions about my sales approach.

#### Acceptance Criteria

1. WHEN a conversation reaches a terminal state (lead converted, lead disqualified, or lead unresponsive for more than 7 days), THE Conversation_Analyzer SHALL compute a performance score on a scale of 0 to 100 based on: engagement rate (percentage of messages that received a reply within 24 hours), qualification depth (number of qualification questions answered out of total asked), and outcome (converted = 100%, meeting booked = 70%, disqualified = 30%, unresponsive = 0%)
2. THE Learning_System SHALL identify the top 5 performing conversation openings, objection handlers, and closing techniques ranked by conversion rate per 30-day rolling period, and IF fewer than 5 patterns exist in a category, THEN THE Learning_System SHALL return all available patterns in that category
3. WHEN a new Conversation_Pattern outperforms existing patterns by more than 20% in conversion rate across a minimum of 20 conversations, THE Learning_System SHALL promote it to the priority pattern set
4. THE Learning_System SHALL maintain a minimum of 10 conversations with a successful outcome (lead converted or meeting booked) before applying learned patterns to new conversations
5. THE Learning_System SHALL provide an API endpoint that returns current performance metrics including: average conversion rate, top patterns per category, and improvement trends comparing the current 30-day period against the previous 30-day period
6. IF the Learning_System has fewer than 10 completed conversations available for analysis, THEN THE Learning_System SHALL return a response indicating insufficient data and display the current conversation count out of the 10 required minimum

### Requirement 7: Context-Aware Lead Scoring Enhancement

**User Story:** As a business owner, I want lead scoring to be more accurate and consider conversation quality signals, so that I prioritize the right leads.

#### Acceptance Criteria

1. WHEN scoring a Lead, THE SDR_Engine SHALL evaluate buying signals including: explicit need expression (10 points), budget discussion (15 points), timeline mentions (10 points), and decision-maker confirmation (15 points)
2. WHEN a new message is received from or sent to a Lead, THE SDR_Engine SHALL recalculate the Lead score incrementally based on the content of that message within 5 seconds of message persistence
3. WHEN a Lead mentions competitors or alternative solutions by name or by comparing options, THE SDR_Engine SHALL increase urgency score by 10 points
4. WHEN a Lead asks about pricing or payment terms, THE SDR_Engine SHALL increase intent score by 15 points
5. IF a Lead stops responding for more than 24 hours after 3 or more messages have been exchanged, THEN THE SDR_Engine SHALL reduce the engagement score by 20 points and reclassify the Lead according to the updated total score and the classification thresholds
6. WHEN the SDR_Engine completes a score recalculation, THE SDR_Engine SHALL produce a structured score breakdown containing each evaluated criteria name, its individual point value, and a textual reasoning for that value
7. THE SDR_Engine SHALL maintain a total Lead score in the range of 0 to 100, where 0–30 maps to COLD classification, 31–60 maps to WARM classification, and 61–100 maps to HOT classification
8. IF the SDR_Engine cannot determine a buying signal due to ambiguous message content, THEN THE SDR_Engine SHALL retain the existing score for that criteria unchanged and record the reason as "inconclusive"

### Requirement 8: Conversation State Management

**User Story:** As a business owner, I want the SDR AI to manage conversation state intelligently, so that it picks up where it left off and doesn't repeat questions.

#### Acceptance Criteria

1. THE SDR_Engine SHALL maintain a conversation state object tracking: current phase (greeting, discovery, qualification, proposal, closing), questions asked, questions answered, and objections raised
2. WHEN a Lead returns after a gap of more than 1 hour but less than 30 days, THE SDR_Engine SHALL send a message referencing the last discussed topic and resume from the last active phase without re-asking previously answered questions
3. WHEN a Lead has already provided a substantive response to a qualification question (a reply of at least 5 characters that does not explicitly decline to answer), THE SDR_Engine SHALL mark that question as answered and proceed to the next unanswered one
4. WHILE in the qualification phase, THE SDR_Engine SHALL transition to the proposal phase within 1 message after the last configured qualification question has been answered
5. IF a Lead requests to speak with a human (using phrases such as "falar com humano", "atendente", or "pessoa real"), THEN THE SDR_Engine SHALL set the conversation status to HANDOFF within 5 seconds, send a handoff notification to the assigned responsible, and inform the Lead that a team member will respond within the time window defined in the company's business hours configuration
6. IF a Lead returns after an inactivity gap of 30 days or more, THEN THE SDR_Engine SHALL reset the conversation state to the greeting phase and start a new qualification flow

### Requirement 9: Prompt Construction and Dynamic Context

**User Story:** As a developer, I want the prompt building system to be modular and context-aware, so that responses are grounded in the most relevant information.

#### Acceptance Criteria

1. THE Prompt_Builder SHALL construct prompts with sections assembled in the following fixed order: personality, company context, learned patterns, constraints, current objective, and conversation history
2. WHILE the conversation is in the greeting or discovery phase, THE Prompt_Builder SHALL include CompanyProfile fields: description, services, differentials, and benefits. WHILE the conversation is in the qualification or proposal phase, THE Prompt_Builder SHALL include CompanyProfile fields: serviceDetails, pricingPolicy, averageTicket, painPoints, commonObjections, and objectionAnswers. WHILE the conversation is in the closing phase, THE Prompt_Builder SHALL include CompanyProfile fields: paymentMethods, businessHours, humanHandoffRules, and commercialRules.
3. WHEN the total prompt exceeds 3000 tokens, THE Prompt_Builder SHALL retain the last 10 messages from conversation history and include only Conversation_Patterns with a success rate above 50%, discarding older messages and lower-performing patterns until the prompt fits within the token limit
4. WHEN a Lead's message contains an exact substring match against a FAQ topic keyword from CompanyProfile, THE Prompt_Builder SHALL include up to 3 matching FAQ entries in the company context section
5. THE Prompt_Builder SHALL format the conversation history as a sequence of entries each containing: the message role (Lead or SDR), the message content, the timestamp in ISO 8601 format, and the conversation phase label at the time of the message
6. IF the Prompt_Builder cannot reduce the prompt to 3000 tokens or fewer after applying truncation rules, THEN THE Prompt_Builder SHALL retain at minimum the personality section, the last 5 messages, and the current objective, discarding all other sections

### Requirement 10: Data Model for Learning System

**User Story:** As a developer, I want proper data models to persist learning data, so that the system's knowledge is durable and queryable.

#### Acceptance Criteria

1. THE Learning_System SHALL persist Conversation_Patterns in a database table with fields: id, companyId (foreign key to CompanyTenant), patternType, content (max 5000 characters), sourceConversationId (foreign key to Conversation), conversionType, leadSegment, successRate (decimal value from 0.00 to 100.00), usageCount (integer starting at 0), createdAt, and updatedAt
2. THE Learning_System SHALL persist Feedback_Entries in a database table with fields: id, companyId (foreign key to CompanyTenant), messageId (foreign key to Message), originalContent (max 5000 characters), correctedContent (max 5000 characters), feedbackType, context, appliedCount (integer starting at 0), createdAt
3. THE Learning_System SHALL persist performance metrics in a database table with fields: id, companyId (foreign key to CompanyTenant), metricType, value (decimal), period (string representing a date range in ISO 8601 interval format), metadata (JSON), calculatedAt
4. IF a Conversation_Pattern has not been used in 90 days and has a successRate below 30.00, THEN THE Learning_System SHALL mark it as archived by setting a status field to "ARCHIVED"
5. IF a company already has 100 active Conversation_Patterns and a new pattern insertion is attempted, THEN THE Learning_System SHALL reject the insertion and return an error indicating the active pattern limit has been reached
6. THE Learning_System SHALL evaluate Conversation_Patterns for archival eligibility once every 24 hours per company
