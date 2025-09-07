from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .models import (
    EquityRequest,
    EquityResult,
    SeatEquity,
    ExpandRequest,
    ExpandResponse,
    ParseRangeRequest,
    ParseRangeResponse,
)
from .equity.deck import parse_board, parse_card, card_to_str
from .equity.ranges import expand_range_text, matrix_from_range_text
from .equity.engines import compute_equity_mc, compute_equity_exact_two


app = FastAPI(title="Range vs Range Equity API", version="0.1.0")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _choose_method(req: EquityRequest, n_players: int, board_len: int | None) -> str:
    if req.method == "mc":
        return "mc"
    if req.method == "exact":
        # Only exact for 2 players postflop when feasible
        return "exact"
    # auto
    if n_players == 2 and (board_len or 0) >= 4:
        return "exact"
    return "mc"


@app.post("/equity/preflop", response_model=EquityResult)
def equity_preflop(req: EquityRequest) -> EquityResult:
    # Preflop runs MC; if user asked exact, fall back to MC.
    iters = req.iterations or 20000
    method = _choose_method(req, n_players=len(req.players), board_len=0)
    if method == "exact":
        method = "mc"
    try:
        per_seat = compute_equity_mc(req.players, board=[], iterations=iters, seed=req.seed)
    except ValueError:
        raise HTTPException(status_code=422, detail="weights are not supported")
    return EquityResult(perSeat=per_seat, method="mc", iterations=iters)


@app.post("/equity/postflop", response_model=EquityResult)
def equity_postflop(req: EquityRequest) -> EquityResult:
    if not req.board or not (3 <= len(req.board) <= 5):
        raise HTTPException(status_code=400, detail="board must have 3 to 5 cards")
    board = parse_board(req.board)
    method = _choose_method(req, n_players=len(req.players), board_len=len(board))
    if method == "exact" and len(req.players) == 2:
        try:
            ok, per_seat = compute_equity_exact_two(req.players, board)
        except ValueError:
            raise HTTPException(status_code=422, detail="weights are not supported")
        if ok:
            return EquityResult(perSeat=per_seat, method="exact")
        # fall back
        method = "mc"
    iters = req.iterations or 30000
    try:
        per_seat = compute_equity_mc(req.players, board=board, iterations=iters, seed=req.seed)
    except ValueError:
        raise HTTPException(status_code=422, detail="weights are not supported")
    return EquityResult(perSeat=per_seat, method="mc", iterations=iters)


@app.post("/range/expand", response_model=ExpandResponse)
def range_expand(req: ExpandRequest) -> ExpandResponse:
    if ":" in (req.range or ""):
        raise HTTPException(status_code=422, detail="weights are not supported")
    board = parse_board(req.board) if req.board else []
    try:
        combos, _errors = expand_range_text(req.range, board)
    except ValueError:
        raise HTTPException(status_code=422, detail="weights are not supported")
    out = [{"c1": card_to_str(c1), "c2": card_to_str(c2)} for (c1, c2) in combos]
    return ExpandResponse(combos=out)


@app.post("/parse-range", response_model=ParseRangeResponse)
def parse_range(req: ParseRangeRequest) -> ParseRangeResponse:
    if ":" in (req.range or ""):
        raise HTTPException(status_code=422, detail="weights are not supported")
    _matrix, errors = matrix_from_range_text(req.range)
    return ParseRangeResponse(ok=True, errors=errors or None)
