from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.middlewares.auth_middleware import get_current_app_user
from app.models.ticket import TicketOut, TicketConRuta
from app.services import ticket_service

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/me", response_model=list[TicketOut])
def mis_tickets(current_user: Annotated[dict, Depends(get_current_app_user)]):
    from app.Mongo.connection import db
    usuario_id = current_user.get("firebase_uid")
    return ticket_service.get_tickets_by_usuario(db, usuario_id)


@router.get("/{ticket_id}", response_model=TicketConRuta)
def get_ticket(ticket_id: str, current_user: Annotated[dict, Depends(get_current_app_user)]):
    from app.Mongo.connection import db
    usuario_id = current_user.get("firebase_uid")
    ticket = ticket_service.get_ticket_by_id(db, ticket_id, usuario_id)
    if not ticket:
        raise HTTPException(404, "Ticket no encontrado")
    return ticket