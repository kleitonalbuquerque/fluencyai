from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import shutil
import os
from pathlib import Path

from application.ai.knowledge_service import KnowledgeService
from domain.entities.user import User
from presentation.dependencies import get_knowledge_manager_user, get_knowledge_service
from presentation.schemas.knowledge import (
    KnowledgeSourceDetailResponse,
    KnowledgeSourceListResponse,
)

router = APIRouter(tags=["knowledge"])
SUPPORTED_KNOWLEDGE_EXTENSIONS = {".md", ".pdf"}


def _safe_source_filename(source_id: str) -> str:
    safe_filename = Path(source_id or "").name
    if not safe_filename or safe_filename != source_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid source id",
        )

    if os.path.splitext(safe_filename)[1].lower() not in SUPPORTED_KNOWLEDGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .md and .pdf files are supported",
        )

    return safe_filename


@router.get("/knowledge/sources", response_model=KnowledgeSourceListResponse)
def list_knowledge_sources(
    current_user: User = Depends(get_knowledge_manager_user),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeSourceListResponse:
    _ = current_user
    sources = knowledge_service.list_sources()
    # We only return metadata to the UI
    return KnowledgeSourceListResponse(
        sources=[
            {
                "id": s.id,
                "name": s.name,
                "type": s.type,
                "last_updated": s.last_updated,
            }
            for s in sources
        ]
    )


@router.get(
    "/knowledge/sources/{source_id}",
    response_model=KnowledgeSourceDetailResponse,
)
def get_knowledge_source(
    source_id: str,
    current_user: User = Depends(get_knowledge_manager_user),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
) -> KnowledgeSourceDetailResponse:
    _ = current_user
    safe_filename = _safe_source_filename(source_id)

    for source in knowledge_service.list_sources():
        if source.id == safe_filename:
            return KnowledgeSourceDetailResponse(
                id=source.id,
                name=source.name,
                type=source.type,
                last_updated=source.last_updated,
                content=source.content,
            )

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Knowledge source not found",
    )


@router.post("/knowledge/upload", status_code=status.HTTP_201_CREATED)
def upload_knowledge_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_knowledge_manager_user),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    _ = current_user
    
    safe_filename = Path(file.filename or "").name
    if not safe_filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )

    file_ext = os.path.splitext(safe_filename)[1].lower()
    if file_ext not in SUPPORTED_KNOWLEDGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .md and .pdf files are supported"
        )
    
    # Ensure KB directory exists
    os.makedirs(knowledge_service.kb_dir, exist_ok=True)
    
    target_path = knowledge_service.kb_dir / safe_filename
    
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    return {"message": f"File '{safe_filename}' uploaded successfully"}


@router.delete("/knowledge/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_knowledge_source(
    source_id: str,
    current_user: User = Depends(get_knowledge_manager_user),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
) -> None:
    _ = current_user
    safe_filename = _safe_source_filename(source_id)
    target_path = knowledge_service.kb_dir / safe_filename

    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Knowledge source not found",
        )

    target_path.unlink()
