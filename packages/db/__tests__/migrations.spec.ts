import { describe, it, expect } from 'vitest'
import { Property } from '../src/index'

const example: Property = {
  id: '1',
  title: 'Apartamento',
  city: 'São Paulo',
  state: 'SP',
  price: 500000,
  areaM2: 75,
  bedrooms: 2,
  type: 'apartamento',
  modality: 'venda',
  available: true,
}

describe('packages/db', () => {
  it('exports Property type and accepts valid object', () => {
    expect(example).toMatchObject({
      city: expect.any(String),
      price: expect.any(Number),
      available: expect.any(Boolean),
    })
  })
})
