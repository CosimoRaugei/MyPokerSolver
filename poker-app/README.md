# Range vs Range Equity App (6-max)

Full-stack monorepo implementing an Equilab-like range vs range equity calculator with a modern UI and a FastAPI backend.

## Structure

```
poker-app/
  backend/
    pyproject.toml
    app/
      __init__.py
      main.py
      models.py
      equity/
        __init__.py
        evaluator.py
        ranges.py
        deck.py
        engines.py
      tests/
        test_smoke.py
  frontend/
    package.json
    next.config.mjs
    postcss.config.mjs
    tailwind.config.ts
    src/
      app/
        page.tsx
        globals.css
      components/
        TableOval.tsx
        SeatCard.tsx
        RangeMatrix.tsx
        RangeEditorDialog.tsx
        RangeBreakdown.tsx
        StreetControls.tsx
        BoardInput.tsx
        EquitySummary.tsx
        TopBar.tsx
      lib/
        api.ts
        seats.ts
        rangeUtils.ts
      store/
        useTableStore.ts
      types/
        index.ts
```

## Backend

- FastAPI with endpoints:
  - `POST /equity/preflop`
  - `POST /equity/postflop`
  - `POST /range/expand`
  - `POST /parse-range`
- Evaluator uses `eval7` if installed, otherwise a pure-Python 7-card evaluator.
- Monte Carlo engine for 2–6 players. Limited exact enumeration on postflop for 2 players when feasible.

Run dev server:

```
cd backend
uvicorn app.main:app --reload --port 8000
```

actually : 
# 1) go to backend
cd backend

# 2) create + activate a virtualenv (keeps Python deps clean)
python3 -m venv .venv
source .venv/bin/activate

# 3) install just what we need to run uvicorn + fastapi
pip install -U pip
pip install fastapi "uvicorn[standard]"
# (optional but faster equity): pip install eval7 numpy pydantic

# 4) run the server (NO --reload to avoid the infinite reload loop)
uvicorn app.main:app --port 8000


## Frontend

- Next.js (App Router) + Tailwind + shadcn/ui + Zustand + Recharts.
- 6-max oval table UI, range matrix editor with weights, board controls per street.

Run dev server:

```
cd frontend #o cd poker-app / frontend
npm i
npm run dev
```

Make sure the backend is running at `http://localhost:8000`. The frontend uses `NEXT_PUBLIC_API_BASE` if set; otherwise defaults to that URL.

## Sample Ranges

- UTG preloaded: `AKs, AKo, QQ-TT, A5s-A2s, KQs-KTs, Q9s+`
- BB preloaded: `JJ-99, AQs-AJs, KQs, JTo+`

These load by default so you can compute equities immediately.

## Notes

- CORS is allowed for `http://localhost:3000`.
- Endpoints are stateless; the frontend holds UI state.

