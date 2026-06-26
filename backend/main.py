import sys
import os
import uuid
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
import tempfile

from ingestion_pipeline import run_complete_ingestion_pipeline
from retrieval_pipeline import run_retrieval_pipeline

app = FastAPI()

# In-memory job tracker: job_id -> "processing" | "done" | "error: <msg>"
jobs: dict[str, str] = {}


class QueryRequest(BaseModel):
    query: str


def _run_ingestion(tmp_path: str, job_id: str):
    try:
        run_complete_ingestion_pipeline(tmp_path)
        jobs[job_id] = "done"
    except Exception as e:
        jobs[job_id] = f"error: {e}"
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/ingest")
async def ingest(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    job_id = str(uuid.uuid4())
    jobs[job_id] = "processing"
    background_tasks.add_task(_run_ingestion, tmp_path, job_id)
    return {"message": "Ingestion started.", "job_id": job_id}


@app.get("/ingest-status/{job_id}")
def ingest_status(job_id: str):
    status = jobs.get(job_id)
    if status is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": status}


@app.post("/query")
def query(request: QueryRequest):
    answer = run_retrieval_pipeline(request.query)
    return {"answer": answer}
