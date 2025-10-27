


import random
from api.schemas.store_schema import StoreSchema
from api.schemas.item_schemas import ItemInfoSchema, ItemSchema
from utils.BaseFactory import BaseFactory
from models import ItemInfo, Store, Item
import uuid


class StoreFactory(BaseFactory):
    def __init__(self):
        super().__init__(Store)
        self.created_objects = []

    def create_store_with_items(self, n=10):
        temp_store_id = str(uuid.uuid4())
        self.create(schema=StoreSchema(store_id=temp_store_id, name="Test Store", address="123 Test St", phone="555-555-5555"), n=1)

        item_factory = BaseFactory(Item)
        objects = item_factory.create(schema=ItemSchema, n=n, store_id=temp_store_id)

        info_objects = []
        for obj in objects:
            info_factory = BaseFactory(ItemInfo)
            info_objects.append(info_factory.create(schema=ItemInfoSchema, n=1, item_info_id=obj.get('info_id')))

        self.created_objects.append(temp_store_id)