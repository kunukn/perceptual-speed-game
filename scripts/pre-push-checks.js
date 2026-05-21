import { spawn } from 'child_process'
import { performance } from 'perf_hooks'

const isWin = process.platform === 'win32'

const tasks = [
  {
    name: 'TS check',
    cmd: 'npx',
    args: ['tsgo', '--project', 'tsconfig.app.json', '--noEmit'],
  },
  {
    name: 'Lint',
    cmd: 'npx',
    args: ['oxlint', 'src'],
  },
]

const SEPARATOR = '─'.repeat(50)

/* 60s per-task safety net — prevents indefinite hangs in non-TTY environments */
const TASK_TIMEOUT_MS = 60_000

function runTask(task) {
  const taskPromise = new Promise((resolve) => {
    const start = performance.now()
    let stdout = ''
    let stderr = ''

    const child = spawn(task.cmd, task.args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: isWin,
    })

    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))

    child.on('error', (err) => {
      const duration = ((performance.now() - start) / 1000).toFixed(2)
      resolve({ name: task.name, code: 1, stdout: '', stderr: err.message, duration })
    })

    child.on('close', (code) => {
      const duration = ((performance.now() - start) / 1000).toFixed(2)
      resolve({ name: task.name, code, stdout, stderr, duration })
    })
  })

  const timeoutPromise = new Promise((resolve) => {
    const timer = setTimeout(() => {
      const seconds = TASK_TIMEOUT_MS / 1000
      resolve({
        name: task.name,
        code: 1,
        stdout: '',
        stderr: `Task timed out after ${seconds}s`,
        duration: String(seconds),
      })
    }, TASK_TIMEOUT_MS)
    timer.unref()
  })

  return Promise.race([taskPromise, timeoutPromise])
}

const overallStart = performance.now()

console.log(`\n🔍 Running pre-push checks in parallel...\n`)

const results = await Promise.all(tasks.map(runTask))

const overallDuration = ((performance.now() - overallStart) / 1000).toFixed(2)

// Print buffered output per task
for (const r of results) {
  const icon = r.code === 0 ? '✅' : '❌'
  console.log(`\n${SEPARATOR}`)
  console.log(`${icon}  ${r.name}  (${r.duration}s)`)
  console.log(SEPARATOR)
  if (r.stdout.trim()) process.stdout.write(r.stdout)
  if (r.stderr.trim()) process.stderr.write(r.stderr)
}

// Summary table
console.log(`\n${SEPARATOR}`)
console.log(`  Summary`)
console.log(SEPARATOR)
for (const r of results) {
  const icon = r.code === 0 ? '✅' : '❌'
  console.log(`  ${icon}  ${r.name.padEnd(12)} ${r.duration}s`)
}
console.log(`${SEPARATOR}`)
console.log(`  Total: ${overallDuration}s`)
console.log(SEPARATOR)

const anyFailed = results.some((r) => r.code !== 0)

if (anyFailed) {
  console.log(`\n❌ Git push blocked — fix the issues above and try again.\n`)
  console.log(`⏱  Total time: ${overallDuration}s\n`)
  process.exit(1)
} else {
  console.log(`\n✅ All checks passed — pushing.\n`)
  console.log(`⏱  Total time: ${overallDuration}s\n`)
}
