import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameSlug = searchParams.get('game')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('versions')
      .select(`
        *,
        games:game_id(id, slug, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (gameSlug) {
      // First get the game ID from slug
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id')
        .eq('slug', gameSlug)
        .single()

      if (gameError || !game) {
        return NextResponse.json(
          { error: 'Game not found' },
          { status: 404 }
        )
      }

      query = query.eq('game_id', game.id)
    }

    const { data: versions, error } = await query

    if (error) throw error

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Error fetching versions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { game_id, code_snapshot, created_by } = body

    const { data: version, error } = await supabase
      .from('versions')
      .insert([{ game_id, code_snapshot, created_by }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ version }, { status: 201 })
  } catch (error) {
    console.error('Error creating version:', error)
    return NextResponse.json(
      { error: 'Failed to create version' },
      { status: 500 }
    )
  }
}