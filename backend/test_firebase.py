from app.services.firebase_service import initialize_firebase


try:
    initialize_firebase()
    print("Firebase Admin conectado correctamente")
except Exception as error:
    print(f"Error inicializando Firebase: {error}")