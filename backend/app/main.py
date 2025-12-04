from fastapi import FastAPI
from app.routers import upload, data, analytics, llm, cost_variance
from app.database.init import init_database

app = FastAPI(title="Nexteer Procurement BI API", version="1.0.0")

# 初始化数据库
init_database()

app.include_router(upload.router)
app.include_router(data.router)
app.include_router(analytics.router)
app.include_router(llm.router)
app.include_router(cost_variance.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Nexteer Procurement BI API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
