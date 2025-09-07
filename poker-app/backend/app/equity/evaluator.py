from __future__ import annotations
from typing import List, Tuple
import os


Card = Tuple[int, str]

_USE_PURE = os.environ.get("EQUITY_FORCE_PURE") == "1"
_HAVE_EVAL7 = False
try:
    if not _USE_PURE:
        import eval7  # type: ignore

        _HAVE_EVAL7 = True
except Exception:
    _HAVE_EVAL7 = False


def _rank5_pure(cards: List[Card]) -> Tuple[int, Tuple[int, ...]]:
    # cards: 5 items (rank 2..14, suit)
    ranks = sorted((c[0] for c in cards), reverse=True)
    suits = [c[1] for c in cards]
    # Rank counts
    counts = {}
    for r in ranks:
        counts[r] = counts.get(r, 0) + 1
    # For ace-low straight support, map A->1 temporarily
    unique = sorted(set(ranks), reverse=True)

    def is_straight(vals: List[int]) -> Tuple[bool, int]:
        s = sorted(set(vals))
        # Wheel straight (A-2-3-4-5)
        if set([14, 2, 3, 4, 5]).issubset(set(vals)):
            return True, 5
        # General
        if len(s) < 5:
            return False, 0
        s.sort()
        for i in range(len(s) - 4):
            if s[i] + 4 == s[i + 4] and s[i + 1] == s[i] + 1 and s[i + 2] == s[i] + 2 and s[i + 3] == s[i] + 3:
                return True, s[i + 4]
        return False, 0

    # Flush
    suit_counts = {}
    for s in suits:
        suit_counts[s] = suit_counts.get(s, 0) + 1
    flush_suit = None
    for s, ct in suit_counts.items():
        if ct >= 5:
            flush_suit = s
            break
    if flush_suit:
        flush_ranks = sorted([c[0] for c in cards if c[1] == flush_suit], reverse=True)
    else:
        flush_ranks = []

    # Straight and straight flush detection
    has_straight, straight_high = is_straight(ranks)
    if flush_suit:
        has_sf, sf_high = is_straight([c for c in flush_ranks])
        if has_sf:
            return 8, (sf_high,)

    # Four of a kind
    quads = [r for r, ct in counts.items() if ct == 4]
    if quads:
        quad = max(quads)
        kicker = max([r for r in ranks if r != quad])
        return 7, (quad, kicker)

    # Full house
    trips = sorted([r for r, ct in counts.items() if ct == 3], reverse=True)
    pairs = sorted([r for r, ct in counts.items() if ct == 2], reverse=True)
    if trips and (len(trips) > 1 or pairs):
        trip = trips[0]
        pair = trips[1] if len(trips) > 1 else pairs[0]
        return 6, (trip, pair)

    # Flush
    if flush_suit:
        top5 = tuple(flush_ranks[:5])
        return 5, top5

    # Straight
    if has_straight:
        return 4, (straight_high,)

    # Three of a kind
    if trips:
        trip = trips[0]
        kickers = [r for r in ranks if r != trip][:2]
        return 3, (trip, *kickers)

    # Two pair
    if len(pairs) >= 2:
        p1, p2 = pairs[0], pairs[1]
        kicker = max([r for r in ranks if r != p1 and r != p2])
        return 2, (p1, p2, kicker)

    # One pair
    if len(pairs) == 1:
        p = pairs[0]
        kickers = [r for r in ranks if r != p][:3]
        return 1, (p, *kickers)

    # High card
    return 0, tuple(ranks[:5])


def _best5_of7_pure(cards: List[Card]) -> Tuple[int, Tuple[int, ...]]:
    # choose best of all 21 5-card subsets
    from itertools import combinations

    best = (-1, ())
    for comb in combinations(cards, 5):
        score = _rank5_pure(list(comb))
        if score > best:
            best = score
    return best


def rank7(cards: List[Card]) -> int:
    """
    Returns a comparable int where higher means better hand.
    """
    if _HAVE_EVAL7:
        # Build eval7 cards and evaluate best 5-of-7 automatically
        import eval7  # type: ignore
        ecards = [eval7.Card(f"{'23456789TJQKA'[c[0]-2]}{c[1]}") for c in cards]
        return eval7.evaluate(ecards)
    else:
        cat, tb = _best5_of7_pure(cards)
        # Encode into an int
        # Base: category * 1e10 + tie-breakers spaced by 1e8,1e6,...
        val = cat * 10_000_000_000
        mul = 100_000_000
        for x in tb:
            val += x * mul
            mul //= 100
        return val
