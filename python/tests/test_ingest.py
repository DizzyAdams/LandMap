from pathlib import Path
from tempfile import TemporaryDirectory

from landmap_data.config import DSConfig
from landmap_data.datasets import load_price_history, load_properties
from landmap_data.db import get_duckdb
from landmap_data.ingest import ingest_properties

REPO = Path(__file__).resolve().parents[2]


def test_ingest_and_load_roundtrip():
    with TemporaryDirectory() as d:
        cfg = DSConfig(
            duckdb_path=Path(d) / "t.duckdb",
            data_dir=REPO / "data" / "seeds",
        )
        conn = get_duckdb(cfg)
        try:
            ingest_properties(conn=conn)
            props = load_properties(conn=conn)
            ph = load_price_history(conn=conn)
            assert props.height > 0
            assert "property_id" in props.columns
            assert ph.height > 0
            assert "property_id" in ph.columns
        finally:
            conn.close()
