from __future__ import annotations
from typing import List, Tuple, Iterable, Set


RANK_ORDER = "23456789TJQKA"
SUITS = "shdc"

rank_to_value = {r: i + 2 for i, r in enumerate(RANK_ORDER)}
value_to_rank = {v: r for r, v in rank_to_value.items()}


Card = Tuple[int, str]  # (rank 2..14, suit 's','h','d','c')


def make_card(rank_char: str, suit_char: str) -> Card:
    return (rank_to_value[rank_char.upper()], suit_char.lower())


def parse_card(s: str) -> Card:
    s = s.strip()
    if len(s) != 2:
        raise ValueError(f"invalid card: {s}")
    r, su = s[0].upper(), s[1].lower()
    if r not in rank_to_value or su not in SUITS:
        raise ValueError(f"invalid card: {s}")
    return (rank_to_value[r], su)


def card_to_str(c: Card) -> str:
    return f"{value_to_rank[c[0]]}{c[1]}"


def parse_board(cards: Iterable[str]) -> List[Card]:
    out: List[Card] = []
    seen: Set[str] = set()
    for s in cards:
        c = parse_card(s)
        ss = card_to_str(c)
        if ss in seen:
            raise ValueError(f"duplicate card on board: {s}")
        seen.add(ss)
        out.append(c)
    return out


def full_deck() -> List[Card]:
    return [(rank_to_value[r], s) for r in RANK_ORDER for s in SUITS]


def remove_cards(deck: List[Card], dead: Set[str]) -> List[Card]:
    return [c for c in deck if card_to_str(c) not in dead]

