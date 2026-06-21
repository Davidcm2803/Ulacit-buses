from fastapi import APIRouter, Depends, HTTPException
from DB.connection import db
from models.history import HistoryCreate
from services import history_service

router = APIRouter(prefix="/historial", tags=["historial"])



#mockup hasta que esté middleware autentication

def get_current_user_temp():
    usuario_demo = db.usuarios.find_one()
    if not usuario_demo:
        raise HTTPException(status_code=500, detail="No hay usuarios en la DB, corré el seed primero")
    return {"id": str(usuario_demo["_id"])}


@router.post("")
def crear_historial(data: HistoryCreate, usuario=Depends(get_current_user_temp)):
    nuevo_id = history_service.crear_entrada(
        usuario_id=usuario["id"],
        ruta_id=data.ruta,
        origen_buscado=data.origen_buscado,
        destino_buscado=data.destino_buscado,
    )
    return {"ok": True, "id": nuevo_id}


@router.get("/me")
def obtener_historial(usuario=Depends(get_current_user_temp)):
    return history_service.obtener_historial_usuario(usuario["id"])