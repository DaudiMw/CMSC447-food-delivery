


from api.schemas.store_schema import StoreSchema
from api.schemas.item_schemas import ItemSchema
from utils.BaseFactory import BaseFactory
from models import Store
import uuid


class StoreFactory(BaseFactory):
    def __init__(self):
        super().__init__(Store)
        self.created_objects = []

    def create_store_with_items(self, n=10):
        temp_store_id = str(uuid.uuid4())
        self.create(schema=StoreSchema(store_id=temp_store_id, name="Test Store", address="123 Test St", phone="555-555-5555"), n=1)

        self.create(schema=ItemSchema, n=n, store_id=temp_store_id)

        self.created_objects.append(temp_store_id)