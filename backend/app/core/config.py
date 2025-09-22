import os
from dataclasses import dataclass


@dataclass
class Settings:
    arango_url: str | None = os.getenv("ARANGO_URL")
    arango_db: str | None = os.getenv("ARANGO_DB")
    arango_user: str | None = os.getenv("ARANGO_USER")
    arango_password: str | None = os.getenv("ARANGO_PASSWORD")
    arango_inventory_collection: str = os.getenv("ARANGO_INVENTORY_COLLECTION", "inventory")
    arango_fix_collection: str = os.getenv("ARANGO_FIX_COLLECTION", "fix")
    arango_fix_history_collection: str | None = os.getenv("ARANGO_FIX_HISTORY_COLLECTION", "fix_node_history")

    # Postgres
    pg_host: str = os.getenv("POSTGRES_HOST", "localhost")
    pg_port: int = int(os.getenv("POSTGRES_PORT", "5432"))
    pg_db: str = os.getenv("POSTGRES_DB", "ascintra")
    pg_user: str = os.getenv("POSTGRES_USER", "ascintra")
    pg_password: str = os.getenv("POSTGRES_PASSWORD", "ascintra")

    @property
    def pg_dsn(self) -> str:
        # Use psycopg3 driver for SQLAlchemy
        return (
            f"postgresql+psycopg://{self.pg_user}:{self.pg_password}@{self.pg_host}:{self.pg_port}/{self.pg_db}"
        )

    @property
    def arango_enabled(self) -> bool:
        return bool(self.arango_url and self.arango_db)


settings = Settings()
