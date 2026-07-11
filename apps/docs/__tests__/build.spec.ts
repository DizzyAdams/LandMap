import { describe, it, expect } from 'vitest'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

describe('apps/docs', () => {
  it(
    'docs package scaffold responds to build script',
    async () => {
      const result = await execAsync('pnpm --filter @landmap/docs run build', {
        cwd: process.cwd(),
        timeout: 120000,
      })
      expect(result.stdout).toContain('docs package scaffold')
    },
    120000,
  )
})
