from __future__ import annotations
from typing import List, Tuple, Dict, Iterable
import random
from itertools import combinations

from ..models import PlayerInput, SeatEquity
from .deck import parse_board, card_to_str, full_deck, remove_cards
from .ranges import expand_range_text
from .evaluator import rank7


def _active_players(players: List[PlayerInput]):
    out = []
    for p in players:
        if p.folded:
            out.append({"seat": p.seat, "folded": True, "combos": []})
        else:
            out.append({"seat": p.seat, "folded": False, "combos": []})
    return out


def compute_equity_mc(
    players: List[PlayerInput],
    board: Iterable[tuple] | Iterable[str] | None,
    iterations: int = 30000,
    seed: int | None = None,
) -> List[SeatEquity]:
    rng = random.Random(seed)
    board_cards = list(board or [])
    dead = set(card_to_str(c) if isinstance(c, tuple) else c for c in board_cards)

    # Expand ranges with blocker filtering by board
    expanded: List[List[Tuple[tuple, tuple]]] = []
    seats: List[str] = []
    folded_mask: List[bool] = []
    for p in players:
        seats.append(p.seat)
        folded_mask.append(bool(p.folded))
        if p.folded:
            expanded.append([])
            continue
        combos, _ = expand_range_text(p.range.text, board)
        expanded.append(combos)

    # Participation check
    participating_idx = [i for i in range(len(players)) if not folded_mask[i] and expanded[i]]
    if len(participating_idx) < 2:
        # No competition
        result: List[SeatEquity] = []
        for i, seat in enumerate(seats):
            result.append(
                SeatEquity(seat=seat, equity=0.0, tie=0.0, participating=not folded_mask[i])
            )
        return result

    wins = [0.0 for _ in players]
    ties = [0.0 for _ in players]
    trials = 0

    all_deck = [c for c in full_deck()]
    # Precompute a deck of strings for speed
    all_deck_str = [card_to_str(c) for c in all_deck]

    need_board = 5 - len(board_cards)

    for _ in range(iterations):
        used = set(dead)
        sampled: List[Tuple[tuple, tuple] | None] = [None for _ in players]

        ok = True
        # Sample hole cards per player uniformly with blocker constraints
        for i in range(len(players)):
            if folded_mask[i]:
                continue
            combos = [c for c in expanded[i] if card_to_str(c[0]) not in used and card_to_str(c[1]) not in used]
            if not combos:
                ok = False
                break
            choice = rng.choice(combos)
            sampled[i] = (choice[0], choice[1])
            used.add(card_to_str(choice[0]))
            used.add(card_to_str(choice[1]))

        if not ok:
            continue

        # Draw remaining board cards uniformly
        if need_board > 0:
            remaining = [s for s in all_deck_str if s not in used]
            rng.shuffle(remaining)
            draw = remaining[:need_board]
            full_board = list(board_cards) + [
                next(c for c in all_deck if card_to_str(c) == s) for s in draw
            ]
        else:
            full_board = list(board_cards)

        # Evaluate
        ranks = []
        for i in range(len(players)):
            if folded_mask[i]:
                ranks.append(None)
                continue
            h = sampled[i]
            if not h:
                ok = False
                break
            seven = [h[0], h[1], *full_board]
            ranks.append(rank7(seven))
        if not ok:
            continue

        best = max(r for r in ranks if r is not None)
        winners = [i for i, r in enumerate(ranks) if r == best]
        trials += 1
        if len(winners) == 1:
            wins[winners[0]] += 1.0
        else:
            share = 1.0 / len(winners)
            for wi in winners:
                wins[wi] += share
                ties[wi] += share

    per_seat: List[SeatEquity] = []
    if trials == 0:
        for i, seat in enumerate(seats):
            per_seat.append(
                SeatEquity(
                    seat=seat,
                    equity=0.0,
                    tie=0.0,
                    participating=(i in participating_idx),
                )
            )
        return per_seat

    for i, seat in enumerate(seats):
        if folded_mask[i] or not expanded[i]:
            per_seat.append(SeatEquity(seat=seat, equity=0.0, tie=0.0, participating=False))
        else:
            eq = (wins[i] / trials) * 100.0
            ti = (ties[i] / trials) * 100.0
            per_seat.append(SeatEquity(seat=seat, equity=eq, tie=ti, participating=True))
    return per_seat


def compute_equity_exact_two(
    players: List[PlayerInput], board: List[tuple]
) -> Tuple[bool, List[SeatEquity]]:
    # Only for 2 players
    if len(players) != 2:
        return False, []
    seats = [players[0].seat, players[1].seat]
    if players[0].folded or players[1].folded:
        return False, []

    combos1, _ = expand_range_text(players[0].range.text, board)
    combos2, _ = expand_range_text(players[1].range.text, board)
    if not combos1 or not combos2:
        return False, []

    used_board = set(card_to_str(c) for c in board)
    all_cards = full_deck()
    deck_remaining = [c for c in all_cards if card_to_str(c) not in used_board]

    k = 5 - len(board)
    # Feasibility heuristic
    # Upper bound on pairings (worst-case no overlap)
    # We'll cap at ~1.5M evaluations
    from math import comb

    est_pairs = len(combos1) * len(combos2)
    est_boards = comb(len(deck_remaining), k) if k > 0 else 1
    if est_pairs * est_boards > 1_500_000:
        return False, []

    win1 = 0.0
    win2 = 0.0
    tie_w = 0.0
    total_w = 0.0

    deck_str = [card_to_str(c) for c in deck_remaining]
    deck_map = {card_to_str(c): c for c in deck_remaining}

    # Enumerate
    for c1a, c1b in combos1:
        s1a, s1b = card_to_str(c1a), card_to_str(c1b)
        for c2a, c2b in combos2:
            s2a, s2b = card_to_str(c2a), card_to_str(c2b)
            if s1a in (s2a, s2b) or s1b in (s2a, s2b):
                continue
            used = used_board | {s1a, s1b, s2a, s2b}
            if k == 0:
                r1 = rank7([c1a, c1b, *board])
                r2 = rank7([c2a, c2b, *board])
                total_w += 1.0
                if r1 > r2:
                    win1 += 1.0
                elif r2 > r1:
                    win2 += 1.0
                else:
                    tie_w += 1.0
            elif k == 1:
                for s in deck_str:
                    if s in used:
                        continue
                    b = [*board, deck_map[s]]
                    r1 = rank7([c1a, c1b, *b])
                    r2 = rank7([c2a, c2b, *b])
                    total_w += 1.0
                    if r1 > r2:
                        win1 += 1.0
                    elif r2 > r1:
                        win2 += 1.0
                    else:
                        tie_w += 1.0
            else:  # k == 2
                # choose two distinct cards from remaining
                usable = [s for s in deck_str if s not in used]
                for i in range(len(usable)):
                    si = usable[i]
                    for j in range(i + 1, len(usable)):
                        sj = usable[j]
                        b = [*board, deck_map[si], deck_map[sj]]
                        r1 = rank7([c1a, c1b, *b])
                        r2 = rank7([c2a, c2b, *b])
                        total_w += 1.0
                        if r1 > r2:
                            win1 += 1.0
                        elif r2 > r1:
                            win2 += 1.0
                        else:
                            tie_w += 1.0

    if total_w == 0:
        return False, []

    eq1 = (win1 + tie_w * 0.5) / total_w * 100.0
    eq2 = (win2 + tie_w * 0.5) / total_w * 100.0
    ti1 = (tie_w * 0.5) / total_w * 100.0
    ti2 = (tie_w * 0.5) / total_w * 100.0

    per_seat = [
        SeatEquity(seat=seats[0], equity=eq1, tie=ti1, participating=True),
        SeatEquity(seat=seats[1], equity=eq2, tie=ti2, participating=True),
    ]
    return True, per_seat
