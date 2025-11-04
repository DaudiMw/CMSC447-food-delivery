from repositories.base import BaseRepository
from models import Address
from sqlalchemy.orm import Session

class AddressRepository(BaseRepository[Address]):
    def __init__(self, session: Session):
        super().__init__(Address, session)