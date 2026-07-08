#!/usr/bin/env python3
"""Sync opportunities from Twenty-first into local export format."""
from __future__ import annotations

import csv
import json
import os
import sys
from typing import Any
from urllib.parse import urlencode

import requests

TWENTY_BASE_URL = os.environ.get('TWENTY_BASE_URL', 'http://localhost:3000')
TWENTY_API_KEY = os.environ.get('TWENTY_API_KEY', '')
EXPORT_PATH = os.environ.get('TWENTY_SYNC_EXPORT', 'scripts/seed/twenty_opportunities.csv')


def headers() -> dict[str, str]:
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {TWENTY_API_KEY}',
    }


def fetch_opportunities() -> list[dict[str, Any]]:
    res = requests.get(f"{TWENTY_BASE_URL}/opportunities", headers=headers(), timeout=10)
    res.raise_for_status()
    payload = res.json()
    return payload.get('data', {}).get('opportunities', [])


def to_csv(path: str, items: list[dict[str, Any]]) -> None:
    if not items:
        print('Nenhuma opportunity encontrada para exportar.')
        return
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    fieldnames = ['id', 'title', 'stage', 'amount', 'currency', 'personId', 'leadId', 'createdAt', 'updatedAt']
    with open(path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for item in items:
            writer.writerow({key: item.get(key, '') for key in fieldnames})
    print(f"Exportado {len(items)} oportunidades para {path}")


def to_json(path: str, items: list[dict[str, Any]]) -> None:
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(items, f, ensure_ascii=False, indent=2)
    print(f"Exportado {len(items)} oportunidades para {path}")


def main() -> int:
    if not TWENTY_API_KEY:
        print('TWENTY_API_KEY não definido.', file=sys.stderr)
        return 1

    try:
        items = fetch_opportunities()
    except requests.HTTPError as exc:
        print(f"Erro HTTP: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"Erro inesperado: {exc}", file=sys.stderr)
        return 1

    to_csv(EXPORT_PATH.replace('.json', '.csv'), items)
    to_json(EXPORT_PATH.replace('.csv', '.json'), items)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
