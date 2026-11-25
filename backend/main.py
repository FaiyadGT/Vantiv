from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from redis.asyncio import Redis
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from backend.config import settings
from backend.database import Base, engine, get_session
from backend.models import WatchlistItem
from backend.schemas import WatchlistCreate, WatchlistRead

@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title='VANTIV API', description='AI-powered market intelligence API', version='0.1.0', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[item.strip() for item in settings.cors_origins.split(',')], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

@app.get('/api/health')
async def health():
    services = {'api': 'ok'}
    try:
        async with engine.connect() as connection:
            await connection.exec_driver_sql('SELECT 1')
        services['database'] = 'ok'
    except Exception:
        services['database'] = 'unavailable'
    redis = Redis.from_url(settings.redis_url, socket_connect_timeout=1)
    try:
        await redis.ping()
        services['redis'] = 'ok'
    except Exception:
        services['redis'] = 'unavailable'
    finally:
        await redis.aclose()
    return {'status': 'ok' if all(value == 'ok' for value in services.values()) else 'degraded', 'services': services}

@app.get('/api/watchlist', response_model=list[WatchlistRead])
async def list_watchlist(session: AsyncSession = Depends(get_session)):
    return list(await session.scalars(select(WatchlistItem).order_by(WatchlistItem.created_at.desc())))

@app.post('/api/watchlist', response_model=WatchlistRead, status_code=201)
async def add_to_watchlist(payload: WatchlistCreate, session: AsyncSession = Depends(get_session)):
    item = WatchlistItem(symbol=payload.symbol.upper(), company_name=payload.company_name.strip())
    session.add(item)
    try:
        await session.commit()
        await session.refresh(item)
    except IntegrityError as error:
        await session.rollback()
        raise HTTPException(status_code=409, detail='That symbol is already on your watchlist.') from error
    return item

@app.delete('/api/watchlist/{symbol}', status_code=204)
async def remove_from_watchlist(symbol: str, session: AsyncSession = Depends(get_session)):
    item = await session.scalar(select(WatchlistItem).where(WatchlistItem.symbol == symbol.upper()))
    if item is None:
        raise HTTPException(status_code=404, detail='Symbol not found in your watchlist.')
    await session.delete(item)
    await session.commit()
    return Response(status_code=204)
