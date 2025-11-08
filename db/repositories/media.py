from models import Media
from repositories.base import BaseRepository
from sqlalchemy.orm import Session


class MediaRepository(BaseRepository[Media]):
    def __init__(self, session: Session):
        super().__init__(Media, session)