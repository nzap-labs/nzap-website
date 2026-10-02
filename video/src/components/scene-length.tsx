import { createContext, useContext } from 'react'
import { useVideoConfig } from 'remotion'

/** A scene's own length in frames (a scene may play inside a longer film). */
export const SceneLength = createContext<number | null>(null)

export function useSceneLength(): number {
  const own = useContext(SceneLength)
  const { durationInFrames } = useVideoConfig()
  return own ?? durationInFrames
}
