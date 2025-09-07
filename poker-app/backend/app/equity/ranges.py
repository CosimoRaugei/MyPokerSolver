from __future__ import annotations
from typing import Dict, List, Tuple, Set, Iterable
import re
from .deck import RANK_ORDER, rank_to_value, value_to_rank, SUITS, make_card, card_to_str, parse_card


Card = Tuple[int, str]
Combo = Tuple[Card, Card]


RANKS_DESC = list(reversed(list(RANK_ORDER)))  # A..2
IDX = {r: i for i, r in enumerate(RANKS_DESC)}


def _pair_combos(rank_char: str) -> List[Tuple[Card, Card]]:
    r = rank_char
    suits = list(SUITS)
    out: List[Tuple[Card, Card]] = []
    for i in range(4):
        for j in range(i + 1, 4):
            out.append((make_card(r, suits[i]), make_card(r, suits[j])))
    return out


def _suited_combos(high: str, low: str) -> List[Tuple[Card, Card]]:
    # high > low (by rank value)
    out: List[Tuple[Card, Card]] = []
    for s in SUITS:
        out.append((make_card(high, s), make_card(low, s)))
    return out


def _offsuit_combos(high: str, low: str) -> List[Tuple[Card, Card]]:
    out: List[Tuple[Card, Card]] = []
    for s1 in SUITS:
        for s2 in SUITS:
            if s1 == s2:
                continue
            out.append((make_card(high, s1), make_card(low, s2)))
    return out


def _both_suits(high: str, low: str) -> List[Tuple[Card, Card]]:
    return _suited_combos(high, low) + _offsuit_combos(high, low)


def _norm_ranks(a: str, b: str) -> Tuple[str, str]:
    # return (high, low)
    return (a, b) if rank_to_value[a] > rank_to_value[b] else (b, a)


# weights no longer supported


def _expand_token(base: str) -> List[Tuple[str, str, str]]:
    """
    Expand a token without weight into a list of (kind, high, low) where kind in {"pair","s","o","b"}.
    For pair, use ("pair", rank, rank).
    For non-pairs: kind s=suited, o=offsuit, b=both.
    Supports: AKs, AKo, AK, 77, 77+, 77-99, A2s-A5s, KTs+, Ax, Axs, Kx, Kxo.
    """
    tok = base
    tok = tok.strip()
    if not tok:
        return []

    # Pair ranges with + or -
    m = re.fullmatch(r"([2-9TJQKA])\1\+", tok)
    if m:
        lo = m.group(1)
        out: List[Tuple[str, str, str]] = []
        for r in RANK_ORDER[RANK_ORDER.index(lo) :]:
            out.append(("pair", r, r))
        return out

    m = re.fullmatch(r"([2-9TJQKA])\1-([2-9TJQKA])\2", tok)
    if m:
        a, b = m.group(1), m.group(2)
        a_i, b_i = RANK_ORDER.index(a), RANK_ORDER.index(b)
        lo_i, hi_i = (a_i, b_i) if a_i <= b_i else (b_i, a_i)
        out: List[Tuple[str, str, str]] = []
        for i in range(lo_i, hi_i + 1):
            r = RANK_ORDER[i]
            out.append(("pair", r, r))
        return out

    # Non-pair dash ranges like A2s-A5s or A2o-A5o or A2-A5
    m = re.fullmatch(r"([2-9TJQKA])([2-9TJQKA])([so])?-([2-9TJQKA])([2-9TJQKA])\3?", tok)
    if m:
        a1, a2, so, b1, b2 = m.group(1), m.group(2), m.group(3), m.group(4), m.group(5)
        hi, lo = _norm_ranks(a1, a2)
        hi_b, lo_b = _norm_ranks(b1, b2)
        if hi != hi_b:
            # Require same high rank
            return []
        so_kind = "b" if not so else ("s" if so == "s" else "o")
        # Iterate low from lo .. lo_b (by rank order ascending)
        idx_lo = RANK_ORDER.index(lo)
        idx_lo_b = RANK_ORDER.index(lo_b)
        lo_i, hi_i = (idx_lo, idx_lo_b) if idx_lo <= idx_lo_b else (idx_lo_b, idx_lo)
        out: List[Tuple[str, str, str]] = []
        for i in range(lo_i, hi_i + 1):
            low_r = RANK_ORDER[i]
            if rank_to_value[hi] == rank_to_value[low_r]:
                continue
            out.append((so_kind, hi, low_r))
        return out

    # Non-pair plus like KTs+, A5s+, Q9o+, A2+
    m = re.fullmatch(r"([2-9TJQKA])([2-9TJQKA])([so])?\+", tok)
    if m:
        a1, a2, so = m.group(1), m.group(2), m.group(3)
        hi, lo = _norm_ranks(a1, a2)
        so_kind = "b" if not so else ("s" if so == "s" else "o")
        # Increase the lower card toward (exclusive) the high card
        out: List[Tuple[str, str, str]] = []
        start_i = RANK_ORDER.index(lo)
        end_i = RANK_ORDER.index(hi) - 1
        for i in range(start_i, end_i + 1):
            low_r = RANK_ORDER[i]
            if rank_to_value[hi] == rank_to_value[low_r]:
                continue
            out.append((so_kind, hi, low_r))
        return out

    # Wildcards Ax / Axs / Axo / Kx, etc.
    m = re.fullmatch(r"([2-9TJQKA])x([so])?", tok, flags=re.IGNORECASE)
    if m:
        a1, so = m.group(1).upper(), m.group(2)
        so_kind = "b" if not so else ("s" if so == "s" else "o")
        out: List[Tuple[str, str, str]] = []
        for r in RANK_ORDER:
            if r == a1:
                continue
            hi, lo = _norm_ranks(a1, r)
            if hi != a1:
                # keep the higher one fixed to a1; otherwise skip
                continue
            out.append((so_kind, hi, lo))
        return out

    # Pairs exactly
    m = re.fullmatch(r"([2-9TJQKA])\1", tok)
    if m:
        r = m.group(1)
        return [("pair", r, r)]

    # Non-pair exact: AKs, AKo, AK
    m = re.fullmatch(r"([2-9TJQKA])([2-9TJQKA])([so])?", tok)
    if m:
        a1, a2, so = m.group(1), m.group(2), m.group(3)
        hi, lo = _norm_ranks(a1, a2)
        if rank_to_value[hi] == rank_to_value[lo]:
            return []
        kind = "b" if not so else ("s" if so == "s" else "o")
        return [(kind, hi, lo)]

    return []


def _gen_from_kind(kind: str, hi: str, lo: str) -> List[Tuple[Card, Card]]:
    if kind == "pair":
        return _pair_combos(hi)
    if kind == "s":
        return _suited_combos(hi, lo)
    if kind == "o":
        return _offsuit_combos(hi, lo)
    return _both_suits(hi, lo)


def expand_range_text(text: str, board: Iterable[str] | Iterable[Card] | None = None) -> Tuple[List[Combo], List[str]]:
    """
    Parses the range text and returns a list of combos (c1, c2).
    Applies blocker filtering against board cards if provided.
    Rejects any token containing ':' (weights).
    """
    errors: List[str] = []
    dead: Set[str] = set()
    if board:
        for b in board:
            if isinstance(b, tuple):
                dead.add(card_to_str(b))
            else:
                dead.add(card_to_str(parse_card(b)))

    seen: Set[Tuple[str, str]] = set()

    tokens = [t.strip() for t in re.split(r",|\s+", text) if t.strip()]
    for t in tokens:
        if ":" in t:
            raise ValueError("weights not supported")
        parts = _expand_token(t)
        if not parts:
            errors.append(f"Unrecognized token: {t}")
            continue
        for kind, hi, lo in parts:
            for c1, c2 in _gen_from_kind(kind, hi, lo):
                s1, s2 = card_to_str(c1), card_to_str(c2)
                if s1 in dead or s2 in dead:
                    continue
                if s1 == s2:
                    continue
                key = (s1, s2) if s1 < s2 else (s2, s1)
                seen.add(key)

    combos: List[Combo] = []
    for (s1, s2) in seen:
        c1 = parse_card(s1)
        c2 = parse_card(s2)
        combos.append((c1, c2))

    # Sort for deterministic order
    combos.sort(key=lambda x: (x[0][0] + x[1][0], x[0][1], x[1][1]))
    return combos, errors


def matrix_from_range_text(text: str) -> Tuple[List[List[float]], List[str]]:
    """
    Legacy helper no longer used by frontend. Returns a binary 13x13 matrix (0/1) for compatibility.
    """
    mat: List[List[float]] = [[0.0 for _ in range(13)] for _ in range(13)]
    try:
        combos, errors = expand_range_text(text)
    except ValueError as e:
        return mat, [str(e)]
    for c1, c2 in combos:
        r1 = value_to_rank[c1[0]]
        r2 = value_to_rank[c2[0]]
        i = IDX[r1]
        j = IDX[r2]
        if i == j:
            mat[i][j] = 1.0
        else:
            hi, lo = (i, j) if i < j else (j, i)
            mat[hi][lo] = 1.0
    return mat, []
