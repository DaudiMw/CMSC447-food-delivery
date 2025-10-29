from BaseFactory import BaseFactory
from api.schemas.user_schemas import UserSchema
from api.schemas.store_schemas import StoreCreate, StoreSchema
from StoreFactory import StoreFactory
from models import User, Store


if __name__ == '__main__':

    user_factory = BaseFactory(User)
    user_factory.create(schema=UserSchema, n=10)


    store_factory = StoreFactory()

    store_factory.create_store_with_items(n=10)

    breakpoint()

    user_factory.cleanup()
    store_factory.cleanup()


