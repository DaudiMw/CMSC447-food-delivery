from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from api.auth.auth import oauth2_scheme
from database import get_db
from sqlalchemy.orm import Session
from repositories.media import MediaRepository


router = APIRouter(prefix="/media", tags=["media"], dependencies=[Depends(oauth2_scheme)])


@router.post("", status_code=201)
async def upload_media(file: UploadFile = File(...), db: Session = Depends(get_db)):
    
    try:
        contents = await file.read()

        media = {
            'filename':file.filename,
            'media_data':contents
        }

        media_repo = MediaRepository(db)

        new_media = media_repo.create(**media)

        return {"media_id": new_media.media_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {e}")
    

@router.get("/{media_id}/info")
async def get_media_with_info(media_id: str, db : Session = Depends(get_db)):

    try:
        media_repo = MediaRepository(db)

        content = media_repo.get_by_id(media_id)

        return {"content": content}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching media content: {e}")
    

@router.get("/{media_id}")
async def get_media(media_id: str, db : Session = Depends(get_db)):

    try:
        media_repo = MediaRepository(db)

        content = media_repo.get_by_id(media_id)

        if not content:
            raise HTTPException(status_code=400, detail="Cannot find image.")

        return content.media_data
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching media content: {e}")
    