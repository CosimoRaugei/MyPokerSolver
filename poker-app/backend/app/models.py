from typing import List, Literal, Optional
from pydantic import BaseModel, Field


SeatName = Literal["UTG", "HJ", "CO", "BTN", "SB", "BB"]
MethodName = Literal["auto", "exact", "mc"]


class RangeSpec(BaseModel):
    text: str = Field(default="")


class PlayerInput(BaseModel):
    seat: SeatName
    folded: bool = False
    range: RangeSpec


Card = str


class EquityRequest(BaseModel):
    players: List[PlayerInput]
    board: Optional[List[Card]] = None
    method: MethodName = "auto"
    iterations: Optional[int] = None
    seed: Optional[int] = None


class SeatEquity(BaseModel):
    seat: SeatName
    equity: float
    tie: float
    participating: bool


class EquityResult(BaseModel):
    perSeat: List[SeatEquity]
    method: Literal["exact", "mc"]
    iterations: Optional[int] = None


class ExpandRequest(BaseModel):
    range: str
    board: Optional[List[Card]] = None


class ComboOut(BaseModel):
    c1: Card
    c2: Card


class ExpandResponse(BaseModel):
    combos: List[ComboOut]


class ParseRangeRequest(BaseModel):
    range: str


class ParseRangeResponse(BaseModel):
    ok: bool
    errors: Optional[List[str]] = None
