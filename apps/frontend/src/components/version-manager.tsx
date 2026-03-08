'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@radix-ui/themes'
import { History, Save, Download, Upload, Clock } from 'lucide-react'
import { useAuth } from '@/components/providers'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface GameVersion {
  id: string
  code_snapshot: any
  created_by: string | null
  created_at: string
}

interface VersionManagerProps {
  gameId: string
  currentVersion?: GameVersion
  onVersionLoad?: (version: GameVersion) => void
  onVersionSave?: (newVersion: GameVersion) => void
}

export function VersionManager({ gameId, currentVersion, onVersionLoad, onVersionSave }: VersionManagerProps) {
  const { user } = useAuth()
  const [versions, setVersions] = useState<GameVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchVersions()
  }, [gameId])

  const fetchVersions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setVersions(data)
      }
    } catch (error) {
      console.error('Error fetching versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCurrentVersion = async (codeSnapshot: any) => {
    if (!user) return

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('versions')
        .insert([{
          game_id: gameId,
          code_snapshot: codeSnapshot,
          created_by: user.id
        }])
        .select()
        .single()

      if (!error && data) {
        setVersions(prev => [data, ...prev])
        onVersionSave?.(data)
      }
    } catch (error) {
      console.error('Error saving version:', error)
    } finally {
      setSaving(false)
    }
  }

  const loadVersion = (version: GameVersion) => {
    onVersionLoad?.(version)
  }

  const exportVersion = (version: GameVersion) => {
    const dataStr = JSON.stringify(version.code_snapshot, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `game-version-${version.id.slice(0, 8)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importVersion = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const codeSnapshot = JSON.parse(text)
        await saveCurrentVersion(codeSnapshot)
      } catch (error) {
        console.error('Error importing version:', error)
        alert('Failed to import version. Please check the file format.')
      }
    }
    input.click()
  }

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-400" />
          <h3 className="text-white font-semibold">Version History</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={importVersion}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={!user}
          >
            <Upload className="w-3 h-3 mr-1" />
            Import
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-white/60 text-sm">Loading versions...</div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {versions.length > 0 ? (
            versions.map((version, index) => (
              <div
                key={version.id}
                className={`p-3 rounded-lg border transition-all ${
                  currentVersion?.id === version.id
                    ? 'bg-purple-600/20 border-purple-400/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-white/60" />
                      <span className="text-white text-sm">
                        Version {index + 1}
                      </span>
                      {currentVersion?.id === version.id && (
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-white/60 text-xs mt-1">
                      {new Date(version.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      onClick={() => loadVersion(version)}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 text-xs px-2 py-1"
                      disabled={currentVersion?.id === version.id}
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => exportVersion(version)}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 text-xs px-2 py-1"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-white/60 text-sm text-center py-4">
              No versions saved yet
            </div>
          )}
        </div>
      )}

      {!user && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-white/60 text-xs">
            Sign in to save and manage game versions
          </p>
        </div>
      )}
    </Card>
  )
}