from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.api import analyze, root_causes, copilot, sustainability
load_dotenv()
from app.api import analyze, copilot, root_causes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for hackathon/demo ONLY
    allow_credentials=True,
    allow_methods=["*"],  # allows OPTIONS, POST, GET
    allow_headers=["*"],
)

# Routers
app.include_router(analyze.router)
app.include_router(root_causes.router)
app.include_router(copilot.router)
app.include_router(sustainability.router)