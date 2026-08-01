from utils import partition_document, create_chunks_by_title, summarise_chunks, create_vector_store 
import time


def run_complete_ingestion_pipeline(pdf_path: str, original_filename: str = None):
    """Run the complete RAG ingestion pipeline"""
    print("🚀 Starting RAG Ingestion Pipeline")
    print("=" * 50)

    # time.sleep(10)  # Simulate some processing time for demonstration purposes
    # Step 1: Partition
    elements = partition_document(pdf_path, original_filename)
    
    # Step 2: Chunk
    chunks = create_chunks_by_title(elements)
    
    # Step 3: AI Summarisation
    summarised_chunks = summarise_chunks(chunks)
    
    # Step 4: Vector Store
    db = create_vector_store(summarised_chunks)
    
    print("🎉 Pipeline completed successfully!")
    return db