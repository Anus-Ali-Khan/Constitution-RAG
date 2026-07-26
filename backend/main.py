import logging
import os
import tempfile
from typing import Annotated

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile, status
from pydantic import BaseModel
import uvicorn

from ingestion_pipeline import run_complete_ingestion_pipeline
from retrieval_pipeline import run_retrieval_pipeline


logger = logging.getLogger(__name__)
app = FastAPI(title="Constitution RAG", description="This is a simple RAG application for the PK Constitution", version="1.0.0")


class RetrieveRequest(BaseModel):
    query: str


def run_ingestion_with_error_handling(temp_path: str) -> None:
    try:
        run_complete_ingestion_pipeline(temp_path)
    except Exception as exc:
        logger.exception("Background ingestion failed for %s: %s", temp_path, exc)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/upload-document", response_model=str)
async def upload_document(file: Annotated[UploadFile, File(...)], background_tasks: BackgroundTasks):
    """Endpoint to upload a document and run the ingestion pipeline"""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "upload.pdf")[1] or ".pdf") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name

        background_tasks.add_task(run_ingestion_with_error_handling, temp_path)
        return "Document uploaded and processed successfully."
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

@app.post("/retrieve", response_model=str)
async def retrieve(payload: RetrieveRequest):
    """Endpoint to retrieve information based on a query"""
    try:      
        result = run_retrieval_pipeline(payload.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/health", response_model=str)
async def health_check():
    """Health check endpoint"""
    return "OK"
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
