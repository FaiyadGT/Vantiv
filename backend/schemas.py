from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class WatchlistCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=12, pattern=r'^[A-Za-z0-9.\-]+$')
    company_name: str = Field(default='', max_length=120)

class WatchlistRead(BaseModel):
    id: int
    symbol: str
    company_name: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
