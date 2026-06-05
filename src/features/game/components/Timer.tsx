type Props = { startedAt: number }

export function Timer({ startedAt }: Props) {
  const [seconds, setSeconds] = useState(() =>
    Math.floor((Date.now() - startedAt) / 1000),
  )

  useEffect(() => {
    const id = setInterval(
      () => setSeconds(Math.floor((Date.now() - startedAt) / 1000)),
      1000,
    )

    return () => clearInterval(id)
  }, [startedAt])

  return <span className="text-slate-500 tabular-nums">{seconds}s</span>
}
