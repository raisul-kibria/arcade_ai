import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const gameId = searchParams.get('game_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    let query = supabase
      .from('scores')
      .select(`
        *,
        users:user_id(email),
        versions:version_id(id, games:game_id(name, slug))
      `)
      .order('score', { ascending: false })
      .limit(limit)

    if (gameId) {
      query = query.eq('versions.game_id', gameId)
    }

    const { data: scores, error } = await query

    if (error) throw error

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { version_id, user_id, score } = body

    const { data: scoreRecord, error } = await supabase
      .from('scores')
      .insert([{ version_id, user_id, score }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ score: scoreRecord }, { status: 201 })
  } catch (error) {
    console.error('Error creating score:', error)
    return NextResponse.json(
      { error: 'Failed to create score' },
      { status: 500 }
    )
  }
}