from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, is_store_owner
from repositories.orders import OrderRepository
from repositories.reports import ReportsRepository
from repositories.store import StoreRepository
from repositories.user import UserRepository
from sqlalchemy.orm import Session
from database import get_db
from models import UserRole
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.report_schemas import ReportSchema, ReportCreateSchema, ReportResponseSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/reports", tags=["reports"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{order_id}", status_code=201, response_model=list[ReportSchema])
async def create_report_to_order(report: ReportCreateSchema,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    """Creates a report for an order."""
    """Perms: admin, user of order, dasher of order"""
    reports_repo = ReportsRepository(db)
    orders_repo = OrderRepository(db)
    stores_repo = StoreRepository(db)
    users_repo = UserRepository(db)
    store = stores_repo.get_by_id(report.store_id)
    order = orders_repo.get_by_id(report.order_id)
    user = users_repo.get_by_id(report.user_id)

    if user.role != UserRole.admin and order.user_id != user.id and order.pickups.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    try:
        new_report = reports_repo.create(**(report.dict()), order=order, store=store, user=user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_report

@router.put("/{report_id}", status_code=201, response_model=ReportSchema)
async def post_response(report: ReportResponseSchema,
                        report_id: int,
                        user: user_dependency,
                        db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    found_report = reports_repo.get_by_id(report_id)

    store_repo = StoreRepository(db)
    owners = store_repo.check_store_owner(user.id, found_report.store_id)

    if user.role != UserRole.admin and not owners:
        raise HTTPException(status_code=401, detail="User does not own the store of the item")
    
    reports_repo.update_by_id(report_id, response=report.response)
    
    return found_report

@router.get("/{order_id}", status_code=201, response_model=list[ReportSchema])
async def get_report_by_order_id(order_id: int,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    """Gets a report by its order ID."""
    """Perms: admin, store owner of order, user who reported, dasher who reported"""
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_order_id(order_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.check_store_owner(user.id, report.store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.id and report.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/{user_id}", status_code=201, response_model=list[ReportSchema])
async def get_report_by_user_id(user_id: str,
                                user: user_dependency,
                                db: Session = Depends(get_db)):
    """Gets a report by its user ID."""
    """Perms: admin, store owner of order, user who reported, dasher who reported"""
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_user_id(user_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.check_store_owner(user.id, report.store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.id and report.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/{store_id}", status_code=201, response_model=list[ReportSchema])
async def get_report_by_store_id(store_id: int,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    """Gets a report by its store ID."""
    """Perms: admin, store owner of order, user who reported, dasher who reported"""
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_store_id(store_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.check_store_owner(user.id, store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.id and report.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/{store_id}/users", status_code=201, response_model=list[ReportSchema])
async def get_report_by_store_id_and_user_id(store_id: int,
                                             user: user_dependency,
                                             db: Session = Depends(get_db)):
    """Gets a report by its store ID and user ID."""
    """Perms: admin, store owner of order, user who reported, dasher who reported"""
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_store_id_and_user_id(store_id, user.id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.check_store_owner(user.id, store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.id and report.dasher_id != user.id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report