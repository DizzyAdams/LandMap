import { Hono } from 'hono';
import type { Env } from './index.js';

export type Neighborhood = {
  name: string;
  city: string;
  state: string;
  schools: number;
  hospitals: number;
  transit: string[];
  crimeIndex: number; // 0 (muito baixo) a 100 (muito alto)
  avgPriceM2: number;
};

const allNeighborhoods: Neighborhood[] = [
  // Curitiba - PR
  { name: 'Batel', city: 'Curitiba', state: 'PR', schools: 12, hospitals: 3, transit: ['Linha Azul', 'Linha Verde'], crimeIndex: 15, avgPriceM2: 9500 },
  { name: 'Centro', city: 'Curitiba', state: 'PR', schools: 8, hospitals: 4, transit: ['Linha Azul', 'Linha Vermelha', 'Linha Laranja'], crimeIndex: 30, avgPriceM2: 6200 },
  { name: 'Centro Cívico', city: 'Curitiba', state: 'PR', schools: 6, hospitals: 2, transit: ['Linha Azul'], crimeIndex: 18, avgPriceM2: 7800 },
  { name: 'Água Verde', city: 'Curitiba', state: 'PR', schools: 9, hospitals: 2, transit: ['Linha Verde', 'Linha Laranja'], crimeIndex: 12, avgPriceM2: 8500 },
  { name: 'Bigorrilho', city: 'Curitiba', state: 'PR', schools: 7, hospitals: 1, transit: ['Linha Azul'], crimeIndex: 10, avgPriceM2: 8200 },
  { name: 'Mercês', city: 'Curitiba', state: 'PR', schools: 5, hospitals: 1, transit: ['Linha Verde'], crimeIndex: 14, avgPriceM2: 7800 },

  // Florianópolis - SC
  { name: 'Centro', city: 'Florianópolis', state: 'SC', schools: 10, hospitals: 5, transit: ['Linha Norte', 'Linha Sul', 'Linha Leste'], crimeIndex: 28, avgPriceM2: 11000 },
  { name: 'Trindade', city: 'Florianópolis', state: 'SC', schools: 14, hospitals: 3, transit: ['Linha Norte', 'Linha Leste'], crimeIndex: 20, avgPriceM2: 8500 },
  { name: 'Jurerê', city: 'Florianópolis', state: 'SC', schools: 3, hospitals: 1, transit: ['Linha Norte'], crimeIndex: 8, avgPriceM2: 15000 },
  { name: 'Lagoa da Conceição', city: 'Florianópolis', state: 'SC', schools: 4, hospitals: 1, transit: ['Linha Leste'], crimeIndex: 12, avgPriceM2: 12000 },

  // Balneário Camboriú - SC
  { name: 'Centro', city: 'Balneário Camboriú', state: 'SC', schools: 8, hospitals: 3, transit: ['Linha Principal', 'Linha Praia'], crimeIndex: 22, avgPriceM2: 14000 },
  { name: 'Nações', city: 'Balneário Camboriú', state: 'SC', schools: 5, hospitals: 2, transit: ['Linha Principal'], crimeIndex: 15, avgPriceM2: 13000 },
  { name: 'Pioneiros', city: 'Balneário Camboriú', state: 'SC', schools: 6, hospitals: 1, transit: ['Linha Praia'], crimeIndex: 18, avgPriceM2: 10000 },

  // São Paulo - SP
  { name: 'Jardins', city: 'São Paulo', state: 'SP', schools: 20, hospitals: 8, transit: ['Linha 2', 'Linha 4'], crimeIndex: 18, avgPriceM2: 16000 },
  { name: 'Vila Olímpia', city: 'São Paulo', state: 'SP', schools: 10, hospitals: 4, transit: ['Linha 4', 'Linha 9'], crimeIndex: 15, avgPriceM2: 14000 },
  { name: 'Pinheiros', city: 'São Paulo', state: 'SP', schools: 14, hospitals: 5, transit: ['Linha 2', 'Linha 4'], crimeIndex: 20, avgPriceM2: 13500 },
  { name: 'Moema', city: 'São Paulo', state: 'SP', schools: 12, hospitals: 4, transit: ['Linha 5'], crimeIndex: 12, avgPriceM2: 13000 },
  { name: 'Barra Funda', city: 'São Paulo', state: 'SP', schools: 7, hospitals: 2, transit: ['Linha 3', 'Linha 7'], crimeIndex: 25, avgPriceM2: 9000 },

  // Rio de Janeiro - RJ
  { name: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', schools: 15, hospitals: 6, transit: ['Linha 1', 'Linha 2'], crimeIndex: 35, avgPriceM2: 12000 },
  { name: 'Ipanema', city: 'Rio de Janeiro', state: 'RJ', schools: 10, hospitals: 4, transit: ['Linha 1', 'Linha 4'], crimeIndex: 22, avgPriceM2: 15000 },
  { name: 'Barra da Tijuca', city: 'Rio de Janeiro', state: 'RJ', schools: 18, hospitals: 5, transit: ['BRT', 'Linha 4'], crimeIndex: 25, avgPriceM2: 10000 },
  { name: 'Botafogo', city: 'Rio de Janeiro', state: 'RJ', schools: 8, hospitals: 3, transit: ['Linha 1', 'Linha 2'], crimeIndex: 30, avgPriceM2: 11000 },
  { name: 'Leblon', city: 'Rio de Janeiro', state: 'RJ', schools: 7, hospitals: 3, transit: ['Linha 1', 'Linha 4'], crimeIndex: 18, avgPriceM2: 16000 },

  // Belo Horizonte - MG
  { name: 'Savassi', city: 'Belo Horizonte', state: 'MG', schools: 10, hospitals: 4, transit: ['Linha 1', 'Move'], crimeIndex: 20, avgPriceM2: 9500 },
  { name: 'Lourdes', city: 'Belo Horizonte', state: 'MG', schools: 6, hospitals: 2, transit: ['Linha 1'], crimeIndex: 15, avgPriceM2: 9000 },
  { name: 'Funcionários', city: 'Belo Horizonte', state: 'MG', schools: 5, hospitals: 3, transit: ['Linha 1', 'Move'], crimeIndex: 12, avgPriceM2: 8500 },
  { name: 'Cidade Jardim', city: 'Belo Horizonte', state: 'MG', schools: 7, hospitals: 2, transit: ['Move'], crimeIndex: 18, avgPriceM2: 8000 },

  // Porto Alegre - RS
  { name: 'Moinhos de Vento', city: 'Porto Alegre', state: 'RS', schools: 6, hospitals: 3, transit: ['Linha Norte', 'Linha Sul'], crimeIndex: 14, avgPriceM2: 8000 },
  { name: 'Bela Vista', city: 'Porto Alegre', state: 'RS', schools: 8, hospitals: 2, transit: ['Linha Sul'], crimeIndex: 16, avgPriceM2: 7500 },
  { name: 'Centro Histórico', city: 'Porto Alegre', state: 'RS', schools: 5, hospitals: 4, transit: ['Linha Norte', 'Linha Sul', 'Trensurb'], crimeIndex: 32, avgPriceM2: 5500 },

  // Joinville - SC
  { name: 'Centro', city: 'Joinville', state: 'SC', schools: 8, hospitals: 3, transit: ['Linha Leste', 'Linha Oeste'], crimeIndex: 22, avgPriceM2: 6000 },
  { name: 'América', city: 'Joinville', state: 'SC', schools: 5, hospitals: 1, transit: ['Linha Leste'], crimeIndex: 14, avgPriceM2: 6500 },
  { name: 'Bucarein', city: 'Joinville', state: 'SC', schools: 4, hospitals: 2, transit: ['Linha Oeste'], crimeIndex: 16, avgPriceM2: 5800 },

  // Londrina - PR
  { name: 'Centro', city: 'Londrina', state: 'PR', schools: 9, hospitals: 4, transit: ['Linha Azul', 'Linha Verde'], crimeIndex: 25, avgPriceM2: 5200 },
  { name: 'Gleba Palhano', city: 'Londrina', state: 'PR', schools: 6, hospitals: 2, transit: ['Linha Azul'], crimeIndex: 12, avgPriceM2: 6800 },
  { name: 'Jardim Higienópolis', city: 'Londrina', state: 'PR', schools: 4, hospitals: 1, transit: ['Verde'], crimeIndex: 10, avgPriceM2: 6000 },

  // Maringá - PR
  { name: 'Zona 01', city: 'Maringá', state: 'PR', schools: 5, hospitals: 3, transit: ['Linha Azul', 'Linha Vermelha'], crimeIndex: 18, avgPriceM2: 5800 },
  { name: 'Zona 02', city: 'Maringá', state: 'PR', schools: 4, hospitals: 2, transit: ['Linha Azul'], crimeIndex: 15, avgPriceM2: 5500 },
  { name: 'Zona 07', city: 'Maringá', state: 'PR', schools: 6, hospitals: 1, transit: ['Linha Vermelha'], crimeIndex: 10, avgPriceM2: 6200 },
];

export function createNeighborhoodsRouter() {
  const router = new Hono<Env>();

  /** GET /neighborhoods?city=X */
  router.get('/', async (c) => {
    const city = c.req.query('city');
    if (!city) {
      return c.json({ error: 'Query parameter \"city\" is required' }, 400);
    }

    const filtered = allNeighborhoods.filter(
      (n) => n.city.toLowerCase() === city.toLowerCase()
    );

    return c.json({ items: filtered, total: filtered.length });
  });

  /** GET /neighborhoods/all — retorna todos os bairros */
  router.get('/all', async (c) => {
    return c.json({ items: allNeighborhoods, total: allNeighborhoods.length });
  });

  return router;
}
