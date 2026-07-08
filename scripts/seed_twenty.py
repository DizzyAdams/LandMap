#!/usr/bin/env python3
"""Seed data into Twenty CRM for local development."""
from __future__ import annotations

import os
import sys
from typing import Any

import requests

TWENTY_BASE_URL = os.environ.get('TWENTY_BASE_URL', 'http://localhost:3000')
TWENTY_API_KEY = os.environ.get('TWENTY_API_KEY', '')

PIPELINE_STAGES = ['captured', 'contacted', 'qualified', 'scheduled', 'closed_won', 'closed_lost']

SEED_LEADS = [
    {
        'name': 'Alice Silva',
        'email': 'alice@example.com',
        'phone': '+55 41 99999-0001',
        'source': 'landmap_search',
        'score': 80,
    },
    {
        'name': 'Bob Costa',
        'email': 'bob@example.com',
        'phone': '+55 48 99999-0002',
        'source': 'landmap_search',
        'score': 55,
    },
    {
        'name': 'Carol Mendes',
        'email': 'carol@example.com',
        'phone': '+55 41 99999-0003',
        'source': 'cold_outreach',
        'score': 34,
    },
]

SEED_PEOPLE = [
    {
        'name': 'Alice Silva',
        'email': 'alice@example.com',
        'phone': '+55 41 99999-0001',
        'city': 'Curitiba',
        'state': 'PR',
        'source': 'landmap_search',
    },
    {
        'name': 'Bob Costa',
        'email': 'bob@example.com',
        'phone': '+55 48 99999-0002',
        'city': 'Florianópolis',
        'state': 'SC',
        'source': 'landmap_search',
    },
]

SEED_OPPORTUNITIES = [
    {
        'title': 'Apartamento padrão - Alice',
        'stage': 'captured',
        'amount': 420000,
        'currency': 'BRL',
        'notes': 'Interessada em apartamento 2 quartos em Curitiba.',
    },
    {
        'title': 'Casa térrea - Bob',
        'stage': 'contacted',
        'amount': 890000,
        'currency': 'BRL',
        'notes': 'Aguardando retorno sobre visita.',
    },
]

SEED_NOTES = [
    {
        'title': 'Primeiro contato',
        'body': 'Contato inicial via busca no LandMap.',
        'targetType': 'lead',
    },
    {
        'title': 'Qualificação',
        'body': 'Perfil qualificado: compra em até 6 meses.',
        'targetType': 'lead',
    },
]


def headers() -> dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {TWENTY_API_KEY}',
    }


def create_person(input: dict[str, Any]) -> dict[str, Any]:
    res = requests.post(f"{TWENTY_BASE_URL}/people", json=input, headers=headers(), timeout=10)
    res.raise_for_status()
    return res.json()['data']['person']


def create_lead(input: dict[str, Any]) -> dict[str, Any]:
    res = requests.post(f"{TWENTY_BASE_URL}/leads", json=input, headers=headers(), timeout=10)
    res.raise_for_status()
    return res.json()['data']['lead']


def create_opportunity(input: dict[str, Any]) -> dict[str, Any]:
    res = requests.post(f"{TWENTY_BASE_URL}/opportunities", json=input, headers=headers(), timeout=10)
    res.raise_for_status()
    return res.json()['data']['opportunity']


def create_note(input: dict[str, Any]) -> dict[str, Any]:
    res = requests.post(f"{TWENTY_BASE_URL}/notes", json=input, headers=headers(), timeout=10)
    res.raise_for_status()
    return res.json()['data']['note']


def main() -> int:
    if not TWENTY_API_KEY:
        print('TWENTY_API_KEY não definido. Defina antes de rodar o seed.', file=sys.stderr)
        return 1

    created_people: list[dict[str, Any]] = []
    created_leads: list[dict[str, Any]] = []
    created_opportunities: list[dict[str, Any]] = []

    print('Seeding people...')
    for person in SEED_PEOPLE:
        try:
            created = create_person(person)
            created_people.append(created)
            print(f" - person: {created.get('name')} -> {created.get('id')}")
        except requests.HTTPError as exc:
            print(f" ! person failed: {person['name']}: {exc}", file=sys.stderr)
        except Exception as exc:
            print(f" ! person error: {person['name']}: {exc}", file=sys.stderr)

    print('Seeding leads...')
    for lead in SEED_LEADS:
        try:
            created = create_lead(lead)
            created_leads.append(created)
            print(f" - lead: {created.get('name')} -> {created.get('id')}")
        except requests.HTTPError as exc:
            print(f" ! lead failed: {lead['name']}: {exc}", file=sys.stderr)
        except Exception as exc:
            print(f" ! lead error: {lead['name']}: {exc}", file=sys.stderr)

    print('Seeding opportunities...')
    for idx, opp_input in enumerate(SEED_OPPORTUNITIES):
        payload = dict(opp_input)
        if idx < len(created_leads):
            payload['leadId'] = created_leads[idx].get('id')
        try:
            created = create_opportunity(payload)
            created_opportunities.append(created)
            print(f" - opportunity: {created.get('title')} -> {created.get('id')}")
        except requests.HTTPError as exc:
            print(f" ! opportunity failed: {opp_input['title']}: {exc}", file=sys.stderr)
        except Exception as exc:
            print(f" ! opportunity error: {opp_input['title']}: {exc}", file=sys.stderr)

    print('Seeding notes...')
    for idx, note_input in enumerate(SEED_NOTES):
        payload = dict(note_input)
        if idx < len(created_leads):
            payload['targetId'] = created_leads[idx].get('id')
        try:
            created = create_note(payload)
            print(f" - note: {created.get('title')} -> {created.get('id')}")
        except requests.HTTPError as exc:
            print(f" ! note failed: {note_input.get('title')}: {exc}", file=sys.stderr)
        except Exception as exc:
            print(f" ! note error: {note_input.get('title')}: {exc}", file=sys.stderr)

    print('Seed finished.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
