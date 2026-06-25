/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';
import { IssueCategory, IssuePriority, ImpactAssessment, SmartCityAnalytics } from '../../src/types';

// Initialize Gemini SDK with named parameters & recommended headers
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const isRealApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && GEMINI_API_KEY !== '';

let ai: GoogleGenAI | null = null;

if (isRealApiKey) {
  ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export interface AIAnalysisResult {
  category: IssueCategory;
  priority: IssuePriority;
  impact: ImpactAssessment;
  analytics: SmartCityAnalytics;
  title: string;
  description?: string;
  municipalityReport?: string;
  suggestedAuthority?: string;
  preventiveMeasures?: string;
  authenticityScore?: number;
}

// Prompt template designed to output stable, parseable JSON aligned with types
const ANALYSIS_PROMPT = `You are the core intelligence of Community Hero, a civic Smart City AI assistant.
Your task is to analyze a citizen-submitted hyperlocal issue description (and optionally an image if provided) and categorize, prioritize, assess impact, predict smart metrics, suggest actions, and verify report authenticity.

Output a highly accurate assessment in JSON format strictly matching this schema:
{
  "title": "A short, descriptive, professional title for the issue",
  "category": "garbage" | "road_damage" | "water_leakage" | "streetlight" | "drainage" | "public_safety" | "stray_animals" | "environmental" | "community_request" | "infrastructure" | "emergency",
  "priority": "critical" | "high" | "medium" | "low",
  "description": "An improved, detailed, and clear explanation of the issue, expanding on what is visible in the image and described by the user.",
  "municipalityReport": "A formal, structured public report draft ready to send to local municipal supervisors, detailing the location, impact vectors, safety liabilities, and request for action.",
  "suggestedAuthority": "The specific local agency best suited (e.g. 'Department of Sanitation', 'Bureau of Public Works', 'Water Resources Board', 'Municipal Lighting Division', 'Animal Care & Control Services', 'Environmental Protection Agency')",
  "preventiveMeasures": "2-3 highly practical, short-term or long-term preventative measures for the community and authorities to prevent this specific issue from happening again.",
  "authenticityScore": number (an integer from 0 to 100 representing the estimated likelihood that this is a real, high-veracity incident, based on image analysis and description detail)",
  "impact": {
    "severity": "A brief explanation of why this priority/category was selected and what hazards it causes.",
    "populationAffected": number (estimated number of residents affected, e.g., 50 to 5000),
    "areaRisk": "high" | "medium" | "low",
    "communityImpactScore": number (1 to 100 representing scale of community disruption)
  },
  "analytics": {
    "resolutionETA": "Estimated timeframe e.g. '12 Hours', '3 Days', '1 Week'",
    "escalationRisk": "high" | "medium" | "low",
    "areaHealthScore": number (1 to 100 representing neighborhood sanitary/safety score post-incident, lower means worse),
    "smartPriorityIndex": number (1 to 100, calculated mathematically based on danger, population, and severity),
    "citizenSatisfactionPrediction": number (1 to 100, predicted satisfaction if fixed within the resolutionETA)
  }
}

Guidelines:
- CRITICAL Priority: Open manholes, active flooding, fire hazards, exposed live wires, emergency situations.
- HIGH Priority: Large potholes on fast roads, major water main leaks, non-functional streetlights on dangerous intersections.
- MEDIUM Priority: Garbage dump, overgrown public park, cosmetic damage.
- LOW Priority: Minor cosmetic or quiet-street infrastructure.

Here is the citizen's report:
`;

export async function analyzeIssue(description: string, imageUrl?: string): Promise<AIAnalysisResult> {
  // Graceful fallback heuristics if Gemini is not configured
  const fallbackResult = (): AIAnalysisResult => {
    const descLower = description.toLowerCase();
    let category: IssueCategory = 'community_request';
    let priority: IssuePriority = 'medium';
    let title = 'Community Request';

    if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('dump') || descLower.includes('refuse')) {
      category = 'garbage';
      title = 'Garbage Accumulation';
      priority = 'medium';
    } else if (descLower.includes('pothole') || descLower.includes('road') || descLower.includes('damage') || descLower.includes('cracks')) {
      category = 'road_damage';
      title = 'Potholes / Road Damage';
      priority = 'high';
    } else if (descLower.includes('leak') || descLower.includes('water') || descLower.includes('pipe') || descLower.includes('burst')) {
      category = 'water_leakage';
      title = 'Water Main Leakage';
      priority = 'high';
    } else if (descLower.includes('street') || descLower.includes('light') || descLower.includes('bulb') || descLower.includes('dark')) {
      category = 'streetlight';
      title = 'Broken Streetlight';
      priority = 'medium';
    } else if (descLower.includes('drain') || descLower.includes('flood') || descLower.includes('clog')) {
      category = 'drainage';
      title = 'Drainage Blockage';
      priority = descLower.includes('flood') ? 'critical' : 'high';
    } else if (descLower.includes('wire') || descLower.includes('safety') || descLower.includes('manhole') || descLower.includes('danger')) {
      category = 'public_safety';
      title = 'Public Safety Hazard';
      priority = descLower.includes('manhole') || descLower.includes('wire') ? 'critical' : 'high';
    } else if (descLower.includes('dog') || descLower.includes('animal') || descLower.includes('cat') || descLower.includes('stray')) {
      category = 'stray_animals';
      title = 'Stray Animal Concern';
      priority = 'low';
    } else if (descLower.includes('emergency') || descLower.includes('fire') || descLower.includes('live')) {
      category = 'emergency';
      title = 'Emergency Safety Threat';
      priority = 'critical';
    }

    const smartPriorityIndex = priority === 'critical' ? 95 : priority === 'high' ? 80 : priority === 'medium' ? 50 : 25;

    return {
      title,
      category,
      priority,
      impact: {
        severity: `Automatically assessed as ${priority} priority based on community safety heuristics.`,
        populationAffected: priority === 'critical' ? 800 : priority === 'high' ? 400 : 150,
        areaRisk: priority === 'critical' ? 'high' : priority === 'high' ? 'medium' : 'low',
        communityImpactScore: smartPriorityIndex
      },
      analytics: {
        resolutionETA: priority === 'critical' ? '6 Hours' : priority === 'high' ? '24 Hours' : '3 Days',
        escalationRisk: priority === 'critical' ? 'high' : priority === 'high' ? 'medium' : 'low',
        areaHealthScore: Math.max(20, 100 - smartPriorityIndex),
        smartPriorityIndex,
        citizenSatisfactionPrediction: 88
      }
    };
  };

  if (!ai) {
    return fallbackResult();
  }

  try {
    const contents: any[] = [ANALYSIS_PROMPT + `\n\n"${description}"`];

    // If there is an image, we can fetch it or append it to contents if base64 or URL
    if (imageUrl && imageUrl.startsWith('data:image')) {
      const commaIdx = imageUrl.indexOf(',');
      if (commaIdx !== -1) {
        const mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
        const base64Data = imageUrl.substring(commaIdx + 1);
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['title', 'category', 'priority', 'impact', 'analytics', 'description', 'municipalityReport', 'suggestedAuthority', 'preventiveMeasures', 'authenticityScore'],
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            description: { type: Type.STRING },
            municipalityReport: { type: Type.STRING },
            suggestedAuthority: { type: Type.STRING },
            preventiveMeasures: { type: Type.STRING },
            authenticityScore: { type: Type.INTEGER },
            impact: {
              type: Type.OBJECT,
              required: ['severity', 'populationAffected', 'areaRisk', 'communityImpactScore'],
              properties: {
                severity: { type: Type.STRING },
                populationAffected: { type: Type.INTEGER },
                areaRisk: { type: Type.STRING },
                communityImpactScore: { type: Type.INTEGER }
              }
            },
            analytics: {
              type: Type.OBJECT,
              required: ['resolutionETA', 'escalationRisk', 'areaHealthScore', 'smartPriorityIndex', 'citizenSatisfactionPrediction'],
              properties: {
                resolutionETA: { type: Type.STRING },
                escalationRisk: { type: Type.STRING },
                areaHealthScore: { type: Type.INTEGER },
                smartPriorityIndex: { type: Type.INTEGER },
                citizenSatisfactionPrediction: { type: Type.INTEGER }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const fallback = fallbackResult();
    return {
      title: parsed.title || 'Civic Issue',
      category: parsed.category || 'community_request',
      priority: parsed.priority || 'medium',
      description: parsed.description || description,
      municipalityReport: parsed.municipalityReport || `OFFICIAL CIVIC HAZARD REPORT\nIncident: ${parsed.title || 'Civic Issue'}\nSeverity: ${parsed.priority || 'medium'}\nDetail: ${description}`,
      suggestedAuthority: parsed.suggestedAuthority || 'Department of Public Works',
      preventiveMeasures: parsed.preventiveMeasures || 'Engage regular sanitation sweeps and perform proactive safety inspections.',
      authenticityScore: typeof parsed.authenticityScore === 'number' ? parsed.authenticityScore : 85,
      impact: parsed.impact || fallback.impact,
      analytics: parsed.analytics || fallback.analytics
    };
  } catch (error) {
    console.error('⚠️ Gemini AI analysis failed, falling back to heuristics:', error);
    return fallbackResult();
  }
}

/**
 * Suggests preventive actions and volunteer collaboration templates based on issue
 */
export async function generateAIAssistantAdvice(category: IssueCategory, priority: string, description: string): Promise<string> {
  if (!ai) {
    return `Ensure proper cordoning of the area. Citizen safety should be prioritized. For ${category} issues, kindly engage with the civic authority line and notify nearest volunteers.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `You are Community Hero AI. Provide a helpful, constructive, 2-sentence civic action guide for the neighborhood on how to manage this issue: "${description}" (Category: ${category}, Priority: ${priority}). Suggest one safe, proactive action for citizens/volunteers and one tip for local authorities.`
    });
    return response.text || 'Notify public authorities immediately and request updates via the tracking dashboard.';
  } catch (error) {
    return 'Coordinate with local volunteers to log progress, and ensure emergency contacts are alerted.';
  }
}

/**
 * Handles conversational queries for the AI Civic Assistant
 */
export async function generateCivicAssistantChat(
  message: string,
  history: { role: 'user' | 'model'; text: string }[] = [],
  activeIssuesSummary?: string
): Promise<string> {
  if (!ai) {
    return `I am operating in fallback mode. I can answer general questions: for reporting issues, please click the "File Incident Report" tab in the left sidebar. If you have an emergency, dial 911 immediately. How can I help you today?`;
  }

  try {
    const systemPrompt = `You are the primary AI Civic Assistant of "Community Hero". Your purpose is to assist citizens, volunteers, and local authorities with neighborhood issues.
Here is the current state of local issues in our neighborhood:
${activeIssuesSummary || 'No issues currently reported.'}

Instructions:
1. Answer civic questions (e.g., guidelines for recycling, street sweeping schedules, local hazard regulations).
2. Offer report filing guidance (help draft titles and formal descriptions based on user's plain words).
3. Suggest appropriate authority departments for specific problems.
4. Track or retrieve statuses of existing issues in the summary above if asked.
5. If the user mentions an immediate life threat (like active fire, active assault, live electrical wires with fire), advise them to dial emergency services (911/112) immediately and explicitly.
6. Keep answers concise, highly professional, encouraging, and civic-focused. Do not use markdown titles; use clean bullet points or bold text.`;

    // Map simple history structure into Gemini's standard content objects
    const contents: any[] = [{ role: 'user', parts: [{ text: systemPrompt }] }];
    
    // Add history
    history.forEach(item => {
      contents.push({
        role: item.role === 'user' ? 'user' : 'model',
        parts: [{ text: item.text }]
      });
    });

    // Add latest message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents
    });

    return response.text || 'I am ready to assist you. What hyperlocal or civic question do you have?';
  } catch (error) {
    console.error('Error in Gemini Chat assistant:', error);
    return 'I had a minor hiccup communicating with my core intelligence. Please feel free to re-ask or describe the issue you are facing.';
  }
}

/**
 * Fraud detection engine: Detects AI generated images, duplicate images, duplicate reports, fake GPS, and spam
 */
export async function detectCivicFraud(
  description: string,
  imageUrl?: string,
  locationAddress?: string,
  coordinates?: { lat: number; lng: number },
  existingReports: { title: string; description: string; imageUrl?: string; address: string }[] = []
): Promise<{
  isAiGenerated: boolean;
  isDuplicateImage: boolean;
  isDuplicateReport: boolean;
  isFakeGps: boolean;
  isSpam: boolean;
  authenticityScore: number;
  analysisReason: string;
}> {
  const fallbackResult = {
    isAiGenerated: false,
    isDuplicateImage: false,
    isDuplicateReport: false,
    isFakeGps: false,
    isSpam: false,
    authenticityScore: 92,
    analysisReason: 'Verification passed. Details match expected hyperlocal report syntax.'
  };

  // Run duplicate text heuristic
  const isSpamText = description.length < 5 || /test|asdf|qwerty/i.test(description) || description.repeat(3).length > 200 && new Set(description.split(' ')).size < 3;
  
  const matchesDuplicateReport = existingReports.some(rep => {
    const similarity = (rep.description.toLowerCase().includes(description.toLowerCase()) || description.toLowerCase().includes(rep.description.toLowerCase())) && description.length > 10;
    return similarity;
  });

  if (!ai) {
    const score = isSpamText ? 20 : matchesDuplicateReport ? 35 : 90;
    return {
      ...fallbackResult,
      isSpam: isSpamText,
      isDuplicateReport: matchesDuplicateReport,
      authenticityScore: score,
      analysisReason: isSpamText 
        ? 'Heuristic flagged spam: report details are too short or contain gibberish characters.' 
        : matchesDuplicateReport 
          ? 'Heuristic flagged duplicate: a similar report description already exists at a nearby address.' 
          : 'Local verification passed. Core AI is temporarily disconnected.'
    };
  }

  try {
    const existingSummary = existingReports.map((r, idx) => `[${idx}] Title: "${r.title}", Address: "${r.address}", Desc: "${r.description}"`).join('\n');
    
    const contents: any[] = [];
    
    const prompt = `You are the Fraud Detection Engine of Community Hero. Evaluate the submission's integrity.
Analyze the report's text and optional attached image for:
1. AI Generated Image: Look for typical synthesis artifacts, unusual textures, floating objects, impossible physics, or hyper-realistic airbrushed aesthetics.
2. Duplicate Image: If the user uploaded an image, compare its content conceptually to see if it is a recycle of a stock photo or standard web image.
3. Duplicate Report: Check if this report description or location is virtually identical to any of these existing reports:
---
${existingSummary || 'None.'}
---
4. Fake GPS / Coordinates Mismatch: Evaluate if the reported location address "${locationAddress || 'Unknown'}" (Coordinates: lat=${coordinates?.lat || 0}, lng=${coordinates?.lng || 0}) is geographically congruent. (e.g. coordinates pointing to the middle of the ocean, or coordinates in San Francisco while address says "London, UK").
5. Spam: Check if description is nonsensical gibberish, standard commercial advertising, or unrelated political rant.

Output a highly detailed analysis in JSON format strictly matching this schema:
{
  "isAiGenerated": boolean,
  "isDuplicateImage": boolean,
  "isDuplicateReport": boolean,
  "isFakeGps": boolean,
  "isSpam": boolean,
  "authenticityScore": number (0 to 100 representing the credibility of this report, lower if fraud elements are detected),
  "analysisReason": "A concise, professional explanation summarizing your findings regarding image authenticity, spam, GPS accuracy, and duplicate checks."
}

Citizen Report Details:
Description: "${description}"
Address: "${locationAddress || 'Not specified'}"
Coordinates: Lat=${coordinates?.lat || 0}, Lng=${coordinates?.lng || 0}`;

    contents.push(prompt);

    if (imageUrl && imageUrl.startsWith('data:image')) {
      const commaIdx = imageUrl.indexOf(',');
      if (commaIdx !== -1) {
        const mimeType = imageUrl.substring(5, imageUrl.indexOf(';'));
        const base64Data = imageUrl.substring(commaIdx + 1);
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['isAiGenerated', 'isDuplicateImage', 'isDuplicateReport', 'isFakeGps', 'isSpam', 'authenticityScore', 'analysisReason'],
          properties: {
            isAiGenerated: { type: Type.BOOLEAN },
            isDuplicateImage: { type: Type.BOOLEAN },
            isDuplicateReport: { type: Type.BOOLEAN },
            isFakeGps: { type: Type.BOOLEAN },
            isSpam: { type: Type.BOOLEAN },
            authenticityScore: { type: Type.INTEGER },
            analysisReason: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      isAiGenerated: !!parsed.isAiGenerated,
      isDuplicateImage: !!parsed.isDuplicateImage,
      isDuplicateReport: !!parsed.isDuplicateReport,
      isFakeGps: !!parsed.isFakeGps,
      isSpam: !!parsed.isSpam,
      authenticityScore: typeof parsed.authenticityScore === 'number' ? parsed.authenticityScore : 85,
      analysisReason: parsed.analysisReason || 'Automated verification check completed.'
    };
  } catch (error) {
    console.error('⚠️ Fraud detection engine failed, falling back to heuristics:', error);
    return {
      ...fallbackResult,
      isSpam: isSpamText,
      isDuplicateReport: matchesDuplicateReport,
      authenticityScore: isSpamText ? 20 : matchesDuplicateReport ? 45 : 85,
      analysisReason: 'Civic engine performed a local integrity scan. Core AI model timed out.'
    };
  }
}
