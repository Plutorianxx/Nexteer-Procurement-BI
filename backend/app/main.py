from fastapi import FastAPI

app = FastAPI(title="Nexteer Procurement BI API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to Nexteer Procurement BI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
