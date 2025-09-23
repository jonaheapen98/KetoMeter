import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Create Supabase client with service role key for admin operations
const supabaseUrl = 'https://jqrzjxvlzchyptgsevrh.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  inputType: 'text' | 'image' | 'menu'
  content: string
  imageData?: string // base64 encoded image for image analysis
}

interface KetoAnalysis {
  dishName: string
  ketoScore: number
  scoreComment: string
  breakdown: {
    base: {
      ingredients: string
      status: 'very keto' | 'moderate risk' | 'knocks down score significantly'
      icon: 'green' | 'yellow' | 'red'
    }
    dressing?: {
      description: string
      status: 'very keto' | 'moderate risk' | 'knocks down score significantly'
      icon: 'green' | 'yellow' | 'red'
    }
    additions?: {
      description: string
      status: 'very keto' | 'moderate risk' | 'knocks down score significantly'
      icon: 'green' | 'yellow' | 'red'
    }
  }
  nutritionSnapshot: {
    calories: string
    netCarbs: string
    protein: string
    fat: string
    fiber: string
  }
  healthNotes: string[]
  servingAdvice: {
    type: 'skip' | 'recommend'
    text: string
    icon: 'red' | 'green'
  }[]
  educationalText: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Log the request for debugging
  console.log('Request method:', req.method)
  console.log('Request headers:', Object.fromEntries(req.headers.entries()))

  try {
    const body = await req.json()
    console.log('Request body received:', body)
    
    const { inputType, content, imageData }: AnalysisRequest = body

    if (!inputType) {
      console.log('Missing inputType field')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required field: inputType' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (inputType === 'text' && !content) {
      console.log('Missing content for text analysis')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Missing required field: content for text analysis' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Processing request:', { inputType, content: content ? content.substring(0, 50) + '...' : 'No content provided', imageData: imageData ? `${imageData.length} images` : 'No images' })

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not found')
    }

    // Prepare the prompt based on input type
    let prompt = ''
    
    if (inputType === 'text') {
      prompt = createTextAnalysisPrompt(content)
    } else if (inputType === 'image') {
      prompt = createImageAnalysisPrompt(content, imageData)
    } else if (inputType === 'menu') {
      prompt = createMenuAnalysisPrompt(content)
    }

    // Prepare messages based on input type
    let messages = [];
    
    if ((inputType === 'image' || inputType === 'menu') && imageData && imageData.length > 0) {
      // For image analysis (food or menu), use vision model with image content
      const systemMessage = inputType === 'menu' 
        ? 'You are a keto nutrition expert and restaurant menu analyst. Analyze menu images and categorize items by keto compatibility. You must respond with valid JSON only, no additional text or formatting.'
        : 'You are a keto nutrition expert. Analyze food images and provide detailed nutritional information, keto scores, and recommendations. You must respond with valid JSON only, no additional text or formatting.';
        
      messages = [
        {
          role: 'system',
          content: systemMessage
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            ...imageData.map(img => ({
              type: 'image_url',
              image_url: {
                url: `data:${img.type};base64,${img.base64}`
              }
            }))
          ]
        }
      ];
    } else {
      // For text analysis, use regular model
      messages = [
        {
          role: 'system',
          content: 'You are a keto nutrition expert. Analyze food items and provide detailed nutritional information, keto scores, and recommendations. You must respond with valid JSON only, no additional text or formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];
    }

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: inputType === 'image' ? 'gpt-4o-mini' : 'gpt-4o-mini', // Both support vision
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`)
    }

    const openaiData = await openaiResponse.json()
    const analysisText = openaiData.choices[0].message.content

    // Parse the JSON response
    let analysis: KetoAnalysis
    try {
      analysis = JSON.parse(analysisText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText)
      throw new Error('Invalid response format from OpenAI')
    }

    // Validate the response structure
    validateAnalysisResponse(analysis, inputType)

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in ketometer-analysis function:', error)
    console.error('Error stack:', error.stack)
    
    // Return a 200 status with error details instead of 500
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function createTextAnalysisPrompt(foodDescription: string): string {
  return `You are an expert keto nutritionist and metabolic health specialist with deep understanding of ketosis, insulin response, and nutritional biochemistry. Analyze this food with sophisticated nuance and context.

Food Description: "${foodDescription}"

Provide a comprehensive, nuanced analysis in JSON format. Consider multiple factors beyond just carb count:

{
  "dishName": "Appropriate dish name",
  "ketoScore": 85,
  "scoreComment": "Nuanced assessment considering metabolic impact, insulin response, and keto optimization",
  "breakdown": {
    "summary": "Write a concise, narrative-style breakdown focusing only on what matters for keto. Structure it like: 'The base of the dish—[keto-friendly components]—is highly keto-friendly, providing [benefits]. The [moderate concern] introduces some uncertainty, as [reasoning]. The real concern, however, comes from [main keto blocker], which [impact on keto score].' Focus on the 2-3 most important factors that determine the keto score, not every ingredient."
  },
  "nutritionSnapshot": {
    "servingSize": "Specific serving size (e.g., 'per 100g', 'per 250ml', 'per medium bowl', 'per slice')",
    "calories": "Realistic estimate with units",
    "netCarbs": "Realistic estimate with units (consider glycemic index)",
    "protein": "Realistic estimate with units", 
    "fat": "Realistic estimate with units",
    "fiber": "Realistic estimate with units",
    "sugar": "Natural vs added sugars breakdown",
    "glycemicLoad": "Estimated glycemic impact"
  },
  "metabolicAnalysis": {
    "insulinImpact": "Low/Moderate/High - explain why",
    "ketoCompatibility": "How this affects ketosis",
    "satietyFactor": "How filling/satisfying this is",
    "nutrientDensity": "Overall nutritional value"
  },
  "healthNotes": [
    "Detailed health considerations with scientific reasoning",
    "Metabolic and hormonal impacts",
    "Nutrient bioavailability and absorption",
    "Potential inflammatory or beneficial effects"
  ],
  "servingAdvice": [
    {
      "type": "skip" or "recommend" or "modify",
      "text": "Specific, science-based advice with reasoning",
      "icon": "red" or "green" or "yellow",
      "impact": "Expected effect on keto score"
    }
  ],
  "educationalText": "Comprehensive educational content covering metabolic science, nutritional biochemistry, and practical keto optimization strategies specific to this food",
  "macroAnalysis": {
    "fatRatio": "Percentage of calories from fat",
    "proteinRatio": "Percentage of calories from protein", 
    "carbRatio": "Percentage of calories from carbs",
    "ketoZone": "How close to optimal 70-80% fat, 15-25% protein, 5-10% carbs",
    "macroBalance": "Assessment of macro balance for keto"
  },
  "mealContext": {
    "bestTiming": "Optimal time to eat this food",
    "exerciseContext": "Pre/post workout considerations",
    "fastingCompatibility": "How this fits intermittent fasting",
    "ketoPhase": "Suitable for induction, maintenance, or cycling"
  },
  "optimizationTips": {
    "fatBoosters": ["Ways to increase healthy fats"],
    "proteinEnhancers": ["How to optimize protein quality"],
    "carbMinimizers": ["Ways to reduce carb impact"],
    "ketoHacks": ["Specific keto optimization strategies"]
  },
  "individualFactors": {
    "beginnerFriendly": "Suitable for keto beginners",
    "advancedTips": "Advanced keto considerations",
    "healthConditions": "Considerations for specific health issues",
    "activityLevel": "Recommendations based on exercise level"
  }
}

Advanced Guidelines:
- Consider glycemic index, not just total carbs
- Evaluate insulin response and metabolic flexibility
- Assess nutrient density and bioavailability
- Consider anti-nutrients and inflammatory potential
- Factor in cooking methods and their metabolic effects
- Evaluate protein quality and amino acid profile
- Consider fat quality and omega-3/6 ratios
- Assess micronutrient content and absorption
- Consider individual metabolic variability
- Provide context for different keto approaches (strict, targeted, cyclical)
- Explain the science behind your recommendations
- Consider timing and meal context
- Factor in individual health conditions and goals

Breakdown Analysis Guidelines:
- Write a SINGLE narrative paragraph that tells the keto story of this food
- Focus on the 2-3 most important factors that determine the keto score
- Structure: Start with keto-friendly base → mention moderate concerns → highlight main keto blockers
- DON'T list every ingredient - only mention what actually impacts the keto score
- DO explain WHY certain components help or hurt ketosis
- DO use specific ingredient names when they're the key factors
- DO consider cooking methods and their metabolic effects
- DO make it educational and actionable
- DO focus on what makes THIS food unique in terms of keto impact
- Keep it concise but informative - aim for 2-3 sentences maximum
`
}

function createImageAnalysisPrompt(imageDescription: string, imageData?: string): string {
  return `You are an expert keto nutritionist and metabolic health specialist with deep understanding of ketosis, insulin response, and nutritional biochemistry. Analyze the food images with sophisticated nuance and context.

${imageDescription ? `Additional Description: "${imageDescription}"` : ''}
${imageData ? `Image data is provided for analysis.` : ''}

Provide a comprehensive, nuanced analysis in JSON format. Consider multiple factors beyond just carb count:

{
  "dishName": "Appropriate dish name based on visual analysis",
  "ketoScore": 85,
  "scoreComment": "Nuanced assessment considering metabolic impact, insulin response, and keto optimization",
  "breakdown": {
    "summary": "Write a concise, narrative-style breakdown focusing only on what matters for keto. Structure it like: 'The base of the dish—[keto-friendly components visible]—is highly keto-friendly, providing [benefits]. The [moderate concern] introduces some uncertainty, as [reasoning]. The real concern, however, comes from [main keto blocker], which [impact on keto score].' Focus on the 2-3 most important factors that determine the keto score, not every ingredient."
  },
  "nutritionSnapshot": {
    "servingSize": "Specific serving size based on visual estimation (e.g., 'per 100g', 'per 250ml', 'per medium bowl', 'per slice')",
    "calories": "Realistic estimate with units based on visual portion",
    "netCarbs": "Realistic estimate with units (consider glycemic index)",
    "protein": "Realistic estimate with units", 
    "fat": "Realistic estimate with units",
    "fiber": "Realistic estimate with units",
    "sugar": "Natural vs added sugars breakdown",
    "glycemicLoad": "Estimated glycemic impact"
  },
  "metabolicAnalysis": {
    "insulinImpact": "Low/Moderate/High - explain why based on visual analysis",
    "ketoCompatibility": "How this affects ketosis",
    "satietyFactor": "How filling/satisfying this appears to be",
    "nutrientDensity": "Overall nutritional value based on visible ingredients"
  },
  "healthNotes": [
    "Detailed health considerations with scientific reasoning",
    "Metabolic and hormonal impacts",
    "Nutrient bioavailability and absorption",
    "Potential inflammatory or beneficial effects"
  ],
  "servingAdvice": [
    {
      "type": "skip" or "recommend" or "modify",
      "text": "Specific, science-based advice with reasoning",
      "icon": "red" or "green" or "yellow",
      "impact": "Expected effect on keto score"
    }
  ],
  "educationalText": "Comprehensive educational content covering metabolic science, nutritional biochemistry, and practical keto optimization strategies specific to this food",
  "macroAnalysis": {
    "fatRatio": "Percentage of calories from fat",
    "proteinRatio": "Percentage of calories from protein",
    "carbRatio": "Percentage of calories from carbs",
    "ketoZone": "How close to optimal 70-80% fat, 15-25% protein, 5-10% carbs",
    "macroBalance": "Assessment of macro balance for keto"
  },
  "mealContext": {
    "bestTiming": "Optimal time to eat this food",
    "exerciseContext": "Pre/post workout considerations",
    "fastingCompatibility": "How this fits intermittent fasting",
    "ketoPhase": "Suitable for induction, maintenance, or cycling"
  },
  "optimizationTips": {
    "fatBoosters": ["Ways to increase healthy fats"],
    "proteinEnhancers": ["How to optimize protein quality"],
    "carbMinimizers": ["Ways to reduce carb impact"],
    "ketoHacks": ["Specific keto optimization strategies"]
  },
  "individualFactors": {
    "beginnerFriendly": "Suitable for keto beginners",
    "advancedTips": "Advanced keto considerations",
    "healthConditions": "Considerations for specific health issues",
    "activityLevel": "Recommendations based on exercise level"
  }
}

Visual Analysis Guidelines:
- Identify all visible food items and ingredients
- Estimate portion sizes based on visual cues
- Analyze cooking methods (fried, grilled, steamed, etc.)
- Consider food presentation and preparation style
- Identify potential hidden carbs or sugars
- Assess protein, fat, and vegetable content
- Consider the overall meal composition
- Factor in visual cues for portion control
- Identify keto-friendly substitutions that could be made
- Consider the visual appeal and satiety factors

Breakdown Analysis Guidelines:
- Write a SINGLE narrative paragraph that tells the keto story of this food
- Focus on the 2-3 most important factors that determine the keto score
- Structure: Start with keto-friendly base → mention moderate concerns → highlight main keto blockers
- DON'T list every ingredient - only mention what actually impacts the keto score
- DO explain WHY certain components help or hurt ketosis
- DO use specific ingredient names when they're the key factors
- DO consider cooking methods and their metabolic effects
- DO make it educational and actionable
- DO focus on what makes THIS food unique in terms of keto impact
- Keep it concise but informative - aim for 2-3 sentences maximum
`
}

function createMenuAnalysisPrompt(menuText: string): string {
  return `You are an expert keto nutritionist and restaurant menu analyst. Analyze this restaurant menu and categorize menu items by their keto compatibility.

Menu Text: "${menuText}"

Provide a comprehensive menu analysis in JSON format:

{
  "compatibilitySections": [
    {
      "level": "Highly Compatible",
      "items": [
        {
          "name": "Dish name",
          "ketoScore": 85,
          "reasoning": "Detailed explanation of why this dish is keto-friendly",
          "nutrition": {
            "calories": "Estimated calories",
            "netCarbs": "Estimated net carbs"
          },
          "modifications": [
            "Optional modifications to make it even more keto-friendly"
          ]
        }
      ]
    },
    {
      "level": "Moderately Compatible", 
      "items": [
        {
          "name": "Dish name",
          "ketoScore": 65,
          "reasoning": "Explanation of moderate keto compatibility",
          "nutrition": {
            "calories": "Estimated calories",
            "netCarbs": "Estimated net carbs"
          },
          "modifications": [
            "Specific modifications needed for better keto compatibility"
          ]
        }
      ]
    },
    {
      "level": "Less Compatible",
      "items": [
        {
          "name": "Dish name", 
          "ketoScore": 35,
          "reasoning": "Explanation of why this dish is less keto-friendly",
          "nutrition": {
            "calories": "Estimated calories",
            "netCarbs": "Estimated net carbs"
          },
          "modifications": [
            "Major modifications required for keto compatibility"
          ]
        }
      ]
    },
    {
      "level": "Not Compatible",
      "items": [
        {
          "name": "Dish name",
          "ketoScore": 15,
          "reasoning": "Explanation of why this dish is not keto-friendly",
          "nutrition": {
            "calories": "Estimated calories", 
            "netCarbs": "Estimated net carbs"
          },
          "modifications": [
            "Major changes needed or alternatives to suggest"
          ]
        }
      ]
    }
  ],
  "summary": "Overall assessment of the menu's keto-friendliness and general recommendations",
  "tips": [
    "General tips for ordering keto at this type of restaurant",
    "Common pitfalls to avoid",
    "Best practices for customization"
  ]
}

Analysis Guidelines:
- Categorize ALL visible menu items into appropriate compatibility levels
- Consider hidden carbs, cooking methods, and preparation styles
- Provide realistic keto scores (0-100) based on actual keto impact
- Include specific modifications that can be requested
- Focus on practical advice for restaurant dining
- Consider portion sizes and typical restaurant serving practices
- Account for common restaurant ingredients (oils, seasonings, etc.)
- Provide actionable modifications that restaurants can actually accommodate
- Be realistic about what's achievable in a restaurant setting
- Consider the restaurant type and cuisine style in your analysis
`
}

function validateAnalysisResponse(analysis: any, inputType: string): void {
  if (inputType === 'menu') {
    // Menu analysis validation
    const requiredFields = ['compatibilitySections', 'summary', 'tips']
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    if (!Array.isArray(analysis.compatibilitySections)) {
      throw new Error('compatibilitySections must be an array')
    }
    
    if (!Array.isArray(analysis.tips)) {
      throw new Error('tips must be an array')
    }
    
    // Validate each compatibility section
    for (const section of analysis.compatibilitySections) {
      if (!section.level || !Array.isArray(section.items)) {
        throw new Error('Each compatibility section must have level and items array')
      }
      
      for (const item of section.items) {
        if (!item.name || !item.reasoning) {
          throw new Error('Each menu item must have name and reasoning')
        }
        
        if (typeof item.ketoScore !== 'number' || item.ketoScore < 0 || item.ketoScore > 100) {
          throw new Error('Invalid keto score: must be a number between 0-100')
        }
      }
    }
  } else {
    // Regular food analysis validation
    const requiredFields = [
      'dishName', 'ketoScore', 'scoreComment', 'breakdown', 
      'nutritionSnapshot', 'healthNotes', 'servingAdvice', 'educationalText'
    ]
    
    for (const field of requiredFields) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`)
      }
    }
    
    if (typeof analysis.ketoScore !== 'number' || analysis.ketoScore < 0 || analysis.ketoScore > 100) {
      throw new Error('Invalid keto score: must be a number between 0-100')
    }
    
    if (!Array.isArray(analysis.healthNotes) || !Array.isArray(analysis.servingAdvice)) {
      throw new Error('healthNotes and servingAdvice must be arrays')
    }
  }
}
