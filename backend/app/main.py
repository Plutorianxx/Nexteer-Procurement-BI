from fastapi import FastAPI
from app.routers import upload

app = FastAPI(title="Nexteer Procurement BI API", version="1.0.0")

app.include_router(upload.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nexteer Procurement BI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
