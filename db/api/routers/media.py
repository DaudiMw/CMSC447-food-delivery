from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from api.auth.auth import oauth2_scheme
from database import get_db
from sqlalchemy.orm import Session
from repositories.media import MediaRepository


router = APIRouter(prefix="/media", tags=["media"]) #, dependencies=[Depends(oauth2_scheme)])


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

        return {"media_id": new_media.id}

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
async def get_media(media_id: str, db: Session = Depends(get_db)):
    """Get media file by ID"""
    try:
        media_repo = MediaRepository(db)
        media = media_repo.get_by_id(media_id)
        
        if not media:
            raise HTTPException(status_code=404, detail="Media not found")
        
        # Determine content type from filename
        content_type = "application/octet-stream"  # default
        if media.filename:
            if media.filename.lower().endswith(('.jpg', '.jpeg')):
                content_type = "image/jpeg"
            elif media.filename.lower().endswith('.png'):
                content_type = "image/png"
            elif media.filename.lower().endswith('.gif'):
                content_type = "image/gif"
            elif media.filename.lower().endswith('.webp'):
                content_type = "image/webp"
        
        # Return the binary data directly
        return Response(
            content=media.media_data,
            media_type=content_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    