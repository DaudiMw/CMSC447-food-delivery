from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, is_store_owner
from repositories.orders import OrderRepository
from repositories.reports import ReportsRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from models import UserRole
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.report_schemas import ReportSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/reports", tags=["reports"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{order_id}", status_code=201, response_model=list[ReportSchema])
async def create_report_to_order(report: ReportSchema,
                                 order_id: int,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    """Creates a report for an order."""
    """Perms: admin, user of order, dasher of order"""
    reports_repo = ReportsRepository(db)
    orders_repo = OrderRepository(db)
    order = orders_repo.get_by_id(order_id)

    if user.role != UserRole.admin and order.user_id != user.user_id and order.pickups.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    try:
        new_report = reports_repo.create(**report.dict(), store_id=order.store_id, order=order)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_report

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
    
    owners_list = store_repo.get_store_owner(user.user_id, report.store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
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
    
    owners_list = store_repo.get_store_owner(user.user_id, report.store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
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
    
    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
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
    report = reports_repo.get_by_store_id_and_user_id(store_id, user.user_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != UserRole.admin and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report