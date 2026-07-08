import { describe, it, expect } from 'vitest'
import { env } from '../src/env'
import z from 'zod'

const schema = z.object({
  apiBaseUrl: z.string().url().optional(),
  llmProvider: z.string().optional(),
  appEnv: z.string().optional(),
})

describe('packages/config', () => {
  it('env object matches shape', () => {
    const parsed = schema.safeParse(env)
    expect(parsed.success).toBe(true)
  })

  it('defaults fill when env vars are missing', () => {
    expect(env.apiBaseUrl).toBe('http://localhost:4000')
    expect(['development', 'test', 'production']).toContain(env.appEnv)
  })
})
