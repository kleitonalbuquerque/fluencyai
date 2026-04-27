from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from infrastructure.config.settings import get_settings
from presentation.api.routes.auth import router as auth_router
from presentation.api.routes.product import router as product_router
from presentation.api.routes.knowledge import router as knowledge_router


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="FluencyAI API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth_router)
    app.include_router(product_router)
    app.include_router(knowledge_router)
    return app


app = create_app()
