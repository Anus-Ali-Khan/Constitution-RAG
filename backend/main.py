import logging
import os
import tempfile
from typing import Annotated

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile, status
from pydantic import BaseModel
import uvicorn

from ingestion_pipeline import run_complete_ingestion_pipeline
from retrieval_pipeline import run_retrieval_pipeline
from utils import (
    compute_file_hash,
    create_ingested_document,
    delete_ingested_document,
    find_ingested_document,
    update_ingested_document_status,
)


logger = logging.getLogger(__name__)
app = FastAPI(title="Constitution RAG", description="This is a simple RAG application for the PK Constitution", version="1.0.0")


class RetrieveRequest(BaseModel):
    query: str


def run_ingestion_with_error_handling(temp_path: str, file_hash: str, original_filename: str) -> None:
    try:
        run_complete_ingestion_pipeline(temp_path, original_filename, file_hash)
        update_ingested_document_status(file_hash, "completed")
    except Exception as exc:
        logger.exception("Background ingestion failed for %s: %s", temp_path, exc)
        update_ingested_document_status(file_hash, "failed")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@app.post("/upload-document", response_model=str)
async def upload_document(file: Annotated[UploadFile, File(...)], background_tasks: BackgroundTasks):
    """Endpoint to upload a document and run the ingestion pipeline"""
    try:
        content = await file.read()
        file_hash = compute_file_hash(content)

        existing = find_ingested_document(file_hash)
        if existing is not None and existing["status"] in ("processing", "completed"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This document has already been uploaded.",
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "upload.pdf")[1] or ".pdf") as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        if existing is not None:
            update_ingested_document_status(file_hash, "processing")
        else:
            create_ingested_document(file_hash, file.filename or "upload.pdf")

        background_tasks.add_task(
            run_ingestion_with_error_handling, temp_path, file_hash, file.filename or "upload.pdf"
        )
        return "Document uploaded and processed successfully."
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    

@app.post("/retrieve")
async def retrieve(payload: RetrieveRequest):
    """Endpoint to retrieve information based on a query"""
    try:
        result = run_retrieval_pipeline(payload.query)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.delete("/delete-document/{file_hash}", response_model=str)
async def delete_document(file_hash: str):
    """Endpoint to delete a document from the database"""
    try:
        existing = find_ingested_document(file_hash)
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found.",
            )
        delete_ingested_document(file_hash)
        return "Document deleted successfully."
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@app.get("/health", response_model=str)
async def health_check():
    """Health check endpoint"""
    return "OK"
    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
