from typing import Generic, Type, Any, Callable, Union, get_args, get_origin
from pydantic import BaseModel
from faker import Faker
import random
from api.auth.auth import get_password_hash
from database import SessionLocal
from repositories.base import BaseRepository
from models import UserRole, OrderStatus, ItemType
from typing import TypeVar

T = TypeVar("T")

class BaseFactory(Generic[T]): 
    def __init__(self, model: Type[T]): 
        self.model = model
        self.created_objects = []
        
        # Field generators as lambdas (called fresh each time)
        self.field_generators: dict[str, Callable[[Faker], Any]] = {
            "first_name": lambda f: f.first_name(),
            "last_name": lambda f: f.last_name(),
            "item_name": lambda f: f.word(),
            "name": lambda f: f.company(),
            "password": lambda f: get_password_hash("password"),
            "description": lambda f: f.text(),
            "address": lambda f: f.address(),
            "email": lambda f: f.email(),
            "phone": lambda f: f.phone_number(),
            "role": lambda f: UserRole.user,
            "status": lambda f: random.choice(list(OrderStatus)),
            "item_type": lambda f: random.choice(list(ItemType)),
        }

    def create(self, schema: BaseModel | Type[BaseModel], n: int = 10, **overrides) -> list[T]:
        """Create n instances of the model with given attributes."""
        
        fake = Faker()
        created = []

        with SessionLocal() as session:
            repo = BaseRepository(self.model, session=session)
            
            for _ in range(n):
                if isinstance(schema, type):
                    schema_class = schema
                    data = overrides.copy()
                else:
                    schema_class = type(schema)
                    data = schema.model_dump()
                    data.update(overrides)

                print(f"\n=== Creating {schema_class.__name__} ===")
                print(f"Initial data: {data}")
                print(f"Fields to check: {list(schema_class.model_fields.keys())}")
                
                for field in schema_class.model_fields:
                    if field not in data or data[field] is None:
                        data[field] = self._generate_field_value(field, schema_class, fake)

                obj = repo.create(**data)
                created.append(data)
            
            session.commit()
        
        return created
    
    def _generate_field_value(self, field: str, schema_class: Type[BaseModel], fake: Faker) -> Any:
        """Generate a value for a field based on patterns and type."""
    
        # Priority 1: Pattern matching
        if "_id" in field:
            id_data = fake.uuid4()
            self.created_objects.append(id_data)
            return id_data
        
        # Priority 2: Exact field name match
        if field in self.field_generators:
            return self.field_generators[field](fake)
        
        # Priority 3: Field name patterns
        if "_name" in field:
            return fake.name()
        
        # Priority 4: Type-based fallback using Pydantic's field info
        field_info = schema_class.model_fields[field]
        
        # Try to get the actual type, stripping Optional/Union
        field_type = field_info.annotation
        
        # Handle Union types (Optional[T] or T | None)
        origin = get_origin(field_type)
        if origin is Union or str(origin) == "<class 'types.UnionType'>":
            args = get_args(field_type)
            # Filter out NoneType
            non_none_types = [arg for arg in args if arg is not type(None)]
            if non_none_types:
                field_type = non_none_types[0]
        
        print(f"DEBUG: Field '{field}' resolved type: {field_type}")
        
        # Type matching
        if field_type is str or field_type == str:
            return fake.sentence(nb_words=5, variable_nb_words=True)
        elif field_type is list or field_type == list:
            return []
        elif field_type is bool or field_type == bool:
            return False
        elif field_type is int or field_type == int:
            return random.randint(1, 100)
        elif field_type is float or field_type == float:
            return round(random.uniform(1, 100), 2)
        
        return None

    def cleanup(self):
        """Hard-delete the created objects from the database."""
        with SessionLocal() as session:
            repo = BaseRepository(self.model, session=session)
            for obj_id in self.created_objects:
                obj = repo.get_by_id(obj_id)
                if obj:
                    repo.hard_delete(obj_id)
            session.commit()
        
        self.created_objects = []