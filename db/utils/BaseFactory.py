import random
from typing import Generic, Type
from annotated_types import T
from pydantic import BaseModel
from faker import Faker
from api.auth.auth import get_password_hash
from database import SessionLocal
from repositories.base import BaseRepository
from models import UserRole, OrderStatus, ItemType

class BaseFactory(Generic[T]):
    def __init__(self, model: Type[T]):
        self.model = model
        self.created_objects = []

    def __del__(self):
        self.cleanup()

    def create(self, schema: BaseModel | Type[BaseModel], n: int = 10, **overrides) -> list[T]:
        """Create n instances of the model with given attributes.
            The attributes with None values will be auto-filled with fake data.
            Use overrides to specify fields when passing a schema class."""

        fake = Faker()
        
        created = []

        # Create one session for all operations
        with SessionLocal() as session:
            repo = BaseRepository(self.model, session=session)
            
            for _ in range(n):
                # Determine if schema is an instance or a class
                if isinstance(schema, type):
                    schema_class = schema
                    data = overrides.copy()  # Use overrides as starting data
                else:
                    schema_class = type(schema)
                    data = schema.model_dump()
                    data.update(overrides)  # Merge instance data with overrides
                
                for field in schema_class.model_fields:
                    if field not in data or data[field] is None:

                        if "_id" in field:
                            id_data = fake.uuid4()
                            data[field] = id_data
                            self.created_objects.append(id_data)

                        # E.g first_name, last_name
                        elif "_name" in field:
                            data[field] = fake.name()

                        # E.g a store name
                        elif field == "name":
                            data[field] = fake.company()

                        elif field == "password":
                            data[field] = get_password_hash("password")

                        elif field == "description":
                            data[field] = fake.text()

                        elif field == "address":
                            data[field] = fake.address()

                        elif field == "email":
                            data[field] = fake.company_email()

                        elif field == "phone":
                            data[field] = fake.phone_number()
                        
                        elif field == "role":
                            data[field] = UserRole.user

                        elif field == "status":
                            data[field] = random.choice(list(OrderStatus))

                        elif field == "item_type":
                            data[field] = random.choice(list(ItemType))

                        elif schema_class.model_fields[field].annotation == str:
                            data[field] = fake.sentence(nb_words=5, variable_nb_words=True)
                        
                        elif schema_class.model_fields[field].annotation == list:
                            data[field] = []

                        elif schema_class.model_fields[field].annotation == bool:
                            data[field] = False

                        elif schema_class.model_fields[field].annotation in (int, float):
                            data[field] = random.randint(1, 100)

                obj = repo.create(**data)
                created.append(obj)
            
            # Commit all creates at once
            session.commit()
        return created
    
        
            
    def cleanup(self):
        """Hard-delete the created objects from the database."""
        with SessionLocal() as session:  # Use context manager
            repo = BaseRepository(self.model, session=session)
            for obj_id in self.created_objects:
                obj = repo.get_by_id(obj_id)
                if obj:
                    repo.hard_delete(obj_id)
            session.commit() 
        self.created_objects = []