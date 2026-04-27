from dataclasses import asdict
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
import shutil
import os

from application.ai.knowledge_service import KnowledgeService
from domain.entities.user import User
from presentation.dependencies import get_admin_user, get_knowledge_service
from presentation.schemas.knowledge import KnowledgeSourceListResponse

router = APIRouter(tags=["knowledge"])


@router.get("/knowledge/sources", response_model=KnowledgeSourceListResponse)
def list_knowledge_sources(
    current_user: User = Depends(get_admin_user),
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


@router.post("/knowledge/upload", status_code=status.HTTP_201_CREATED)
def upload_knowledge_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user),
    knowledge_service: KnowledgeService = Depends(get_knowledge_service),
):
    _ = current_user
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".md", ".pdf"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .md and .pdf files are supported"
        )
    
    # Ensure KB directory exists
    os.makedirs(knowledge_service.kb_dir, exist_ok=True)
    
    target_path = knowledge_service.kb_dir / file.filename
    
    try:
        with open(target_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )
    
    return {"message": f"File '{file.filename}' uploaded successfully"}
