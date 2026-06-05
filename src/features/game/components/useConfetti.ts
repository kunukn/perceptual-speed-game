import confetti from 'canvas-confetti'
import { useEffect, useRef, useState } from 'react'

export type ConfettiTier = 'none' | 'entry' | 'perfect'

const GOLD_PALETTE = ['#FFD700', '#FFA500', '#FFC700', '#FFEA70', '#FFFFFF']
const RAINBOW_PALETTE = ['#ff0', '#f00', '#0f0', '#00f', '#f0f', '#0ff']

export function useConfetti(
  tier: ConfettiTier,
  onFired?: () => void,
): React.RefObject<HTMLCanvasElement | null> {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  /* Fire-once contract: snapshot `tier` at mount and ignore later prop
   * changes. The animation runs to its built-in duration and cleans up on
   * unmount — callers must not rely on flipping `tier` back to 'none' to
   * stop it (doing so would re-run the effect and wipe the canvas). */
  const [initialTier] = useState(tier)
  /* Latest callback ref — invoked once when the animation actually fires,
   * without putting `onFired` in the effect's deps. */
  const onFiredRef = useRef(onFired)
  onFiredRef.current = onFired

  useEffect(() => {
    if (initialTier === 'none') return

    const canvas = canvasRef.current
    if (!canvas) return

    onFiredRef.current?.()
    const fire = confetti.create(canvas, { resize: true, useWorker: false })

    if (initialTier === 'entry') {
      const end = Date.now() + 3000

      let rafId: number
      const frame = () => {
        fire({
          particleCount: 3,
          angle: 60 + Math.random() * 60,
          spread: 50 + Math.random() * 30,
          origin: { x: Math.random(), y: Math.random() * 0.5 },
          colors: RAINBOW_PALETTE,
          startVelocity: 20 + Math.random() * 15,
        })
        if (Date.now() < end) {
          rafId = requestAnimationFrame(frame)
        }
      }
      rafId = requestAnimationFrame(frame)

      return () => {
        cancelAnimationFrame(rafId)
        fire.reset()
      }
    }

    /* initialTier === 'perfect': single big cannon, then ~5s of gold fireworks. */
    fire({
      particleCount: 180,
      spread: 100,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.7 },
      colors: GOLD_PALETTE,
      shapes: ['star', 'circle'],
    })

    const end = Date.now() + 5000
    let timeoutId: ReturnType<typeof setTimeout>
    const burst = () => {
      for (let i = 0; i < 2; i += 1) {
        fire({
          particleCount: 50,
          spread: 70,
          startVelocity: 35,
          origin: {
            x: 0.1 + Math.random() * 0.8,
            y: 0.2 + Math.random() * 0.3,
          },
          colors: GOLD_PALETTE,
          shapes: ['star', 'circle'],
        })
      }
      if (Date.now() < end) {
        timeoutId = setTimeout(burst, 280)
      }
    }
    timeoutId = setTimeout(burst, 280)

    return () => {
      clearTimeout(timeoutId)
      fire.reset()
    }
  }, [initialTier])

  return canvasRef
}
