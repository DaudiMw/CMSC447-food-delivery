from fastapi import APIRouter, Depends, HTTPException
from api.auth.auth import admin_required, get_current_user, is_store_owner
from repositories.orders import OrderRepository
from repositories.reports import ReportsRepository
from repositories.store import StoreRepository
from sqlalchemy.orm import Session
from database import get_db
from typing import Annotated
from api.auth.auth import oauth2_scheme
from api.schemas.report_schemas import ReportSchema
from api.schemas.user_schemas import UserAuth

router = APIRouter(dependencies=[Depends(oauth2_scheme)], prefix="/reports", tags=["reports"])

user_dependency = Annotated[UserAuth, Depends(get_current_user)]

@router.post("/{order_id}", status_code=201, response_model=list[ReportSchema])
async def create_report_to_order(report: ReportSchema,
                                 order_id: str,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    orders_repo = OrderRepository(db)
    order = orders_repo.get_by_id(order_id)

    if order.user_id != user.user_id and order.pickups.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    try:
        new_report = reports_repo.create(**report.dict(), store_id=order.store_id, order=order)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return new_report

@router.get("/orders", status_code=201, response_model=list[ReportSchema])
async def get_report_by_order_id(order_id: str,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_order_id(order_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, report.store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/users", status_code=201, response_model=list[ReportSchema])
async def get_report_by_user_id(user_id: str,
                                user: user_dependency,
                                db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_user_id(user_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, report.store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/dashers", status_code=201, response_model=list[ReportSchema])
async def get_report_by_dasher_id(dasher_id: str,
                                  user: user_dependency,
                                  db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_dasher_id(dasher_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, report.store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/stores", status_code=201, response_model=list[ReportSchema])
async def get_report_by_store_id(store_id: str,
                                 user: user_dependency,
                                 db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_store_id(store_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/stores", status_code=201, response_model=list[ReportSchema])
async def get_report_by_store_id_and_user_id(store_id: str,
                                             user: user_dependency,
                                             db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_store_id_and_user_id(store_id, user.user_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report

@router.get("/stores", status_code=201, response_model=list[ReportSchema])
async def get_report_by_store_id_and_dasher_id(store_id: str,
                                               user: user_dependency,
                                               db: Session = Depends(get_db)):
    reports_repo = ReportsRepository(db)
    store_repo = StoreRepository(db)
    report = reports_repo.get_by_store_id_and_dasher_id(store_id, user.user_id)

    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    owners_list = store_repo.get_store_owner(user.user_id, store_id)

    if user.role != "admin" and not owners_list and report.user_id != user.user_id and report.dasher_id != user.user_id:
        raise HTTPException(status_code=401, detail="User is not associated with this order")
    
    return report