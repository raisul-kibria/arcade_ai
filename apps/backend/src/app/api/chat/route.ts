import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  baseURL: process.env.OPENAI_API_BASE!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game_slug, version_id, user_prompt } = body

    if (!game_slug || !user_prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: game_slug, user_prompt' },
        { status: 400 }
      )
    }

    // Fetch game and version data
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('slug', game_slug)
      .single()

    if (gameError || !game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }

    let codeSnapshot = {}
    if (version_id) {
      const { data: version, error: versionError } = await supabase
        .from('versions')
        .select('code_snapshot')
        .eq('id', version_id)
        .single()

      if (!versionError && version) {
        codeSnapshot = version.code_snapshot
      }
    }

    // Construct system prompt based on game type
    const systemPrompt = getSystemPrompt(game_slug)
    
    // Create chat completion request
    const completion = await openai.chat.completions.create({
      model: 'qwen2.5-coder-32b-instruct',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Current game code: ${JSON.stringify(codeSnapshot, null, 2)}\n\nUser request: ${user_prompt}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const response = completion.choices[0]?.message?.content

    if (!response) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      )
    }

    // Parse AI response to determine if it's a simple modification or complex request
    const analysisResult = analyzeAIResponse(response, user_prompt)

    // Log the interaction
    await logChatInteraction(game.id, version_id, user_prompt, response, analysisResult)

    return NextResponse.json(analysisResult)

  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function getSystemPrompt(gameSlug: string): string {
  const basePrompt = `You are an expert Phaser.js game development assistant that helps users modify retro arcade games. You specialize in making targeted, safe modifications to game code.

IMPORTANT GUIDELINES:
1. Only suggest modifications that are safe and won't break the game
2. Focus on simple parameter changes (colors, speeds, sizes, scoring)
3. For complex requests, provide suggestions instead of code changes
4. Always respond in JSON format
5. Keep modifications under 200 lines of changes
6. Ensure all changes maintain game functionality

Response format:
- For simple changes: {"simple": true, "patch": "unified_diff_format", "description": "what_changed"}
- For complex requests: {"simple": false, "suggestions": ["suggestion1", "suggestion2", "suggestion3"]}

Game-specific knowledge:`

  switch (gameSlug) {
    case 'snake':
      return basePrompt + `
This is a Snake game. Common modifications:
- Speed: Adjust movement speed (config.speed)
- Colors: Snake color, food color, background color
- Grid size: Size of game grid cells
- Wrap around: Enable/disable wall wrapping
- Scoring: Points per food eaten`

    case 'tetris':
      return basePrompt + `
This is a Tetris game. Common modifications:
- Drop speed: How fast pieces fall
- Colors: Tetromino colors, background colors
- Grid size: Board dimensions and cell size
- Scoring: Points per line cleared
- Level progression: Speed increase rate`

    case 'space-shooter':
      return basePrompt + `
This is a Space Shooter game. Common modifications:
- Player speed: Movement speed
- Bullet speed: Projectile velocity
- Enemy spawn rate: How often enemies appear
- Colors: Player, bullet, enemy colors
- Scoring: Points per enemy destroyed`

    default:
      return basePrompt + `
This is a generic arcade game. Focus on common game parameters like speed, colors, and scoring.`
  }
}

function analyzeAIResponse(response: string, userPrompt: string): any {
  try {
    // Try to parse as JSON first
    const parsed = JSON.parse(response)
    if (parsed.simple !== undefined) {
      return parsed
    }
  } catch (e) {
    // If not JSON, analyze the response content
  }

  // Check for complexity indicators
  const complexityIndicators = [
    'new feature', 'add feature', 'implement', 'create new',
    'major change', 'restructure', 'rewrite', 'complex',
    'cannot', 'unable', 'too complex', 'beyond scope'
  ]

  const isComplex = complexityIndicators.some(indicator => 
    response.toLowerCase().includes(indicator) || 
    userPrompt.toLowerCase().includes(indicator)
  )

  if (isComplex) {
    return {
      simple: false,
      suggestions: [
        "Try adjusting game speed or colors instead",
        "Modify scoring system or difficulty",
        "Change visual elements like sizes or positions",
        "Consider simpler parameter adjustments"
      ]
    }
  }

  // For simple responses, try to extract useful information
  return {
    simple: true,
    patch: null,
    description: "AI provided guidance but no specific code changes",
    response: response
  }
}

async function logChatInteraction(gameId: string, versionId: string | null, userPrompt: string, aiResponse: string, result: any) {
  try {
    // Create mod_logs table if it doesn't exist and log the interaction
    await supabase.rpc('log_chat_interaction', {
      game_id: gameId,
      version_id: versionId,
      user_prompt: userPrompt,
      ai_response: aiResponse,
      result_type: result.simple ? 'simple' : 'complex',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to log chat interaction:', error)
    // Don't fail the request if logging fails
  }
}