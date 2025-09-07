from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_parse_range_rejects_weights():
    r = client.post("/parse-range", json={"range": "AKs, AKo, 77-99, A5s:25%"})
    assert r.status_code == 422
    assert r.json()["detail"].lower().startswith("weights are not supported")


def test_expand_range():
    r = client.post("/range/expand", json={"range": "AKs, AKo, 77-99"})
    assert r.status_code == 200
    combos = r.json()["combos"]
    assert len(combos) > 0
    assert all("weight" not in c for c in combos)


def test_equity_preflop():
    req = {
        "players": [
            {"seat": "UTG", "folded": False, "range": {"text": "AKs, AKo, QQ-TT"}},
            {"seat": "BB", "folded": False, "range": {"text": "JJ-99, AQs-AJs, KQs, JTo+"}},
        ],
        "method": "mc",
        "iterations": 2000,
        "seed": 42,
    }
    r = client.post("/equity/preflop", json=req)
    assert r.status_code == 200
    data = r.json()
    assert data["method"] in ("mc", "exact")
    assert len(data["perSeat"]) == 2


def test_equity_postflop():
    req = {
        "players": [
            {"seat": "UTG", "folded": False, "range": {"text": "AKs, AKo, QQ-TT"}},
            {"seat": "BB", "folded": False, "range": {"text": "JJ-99, AQs-AJs, KQs"}},
        ],
        "board": ["As", "Kd", "2c"],
        "method": "auto",
        "iterations": 2000,
        "seed": 123,
    }
    r = client.post("/equity/postflop", json=req)
    assert r.status_code == 200
    data = r.json()
    assert len(data["perSeat"]) == 2
