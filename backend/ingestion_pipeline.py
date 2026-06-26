from utils import partition_document, create_chunks_by_title, summarise_chunks, create_vector_store 


def run_complete_ingestion_pipeline(pdf_path: str):
    """Run the complete RAG ingestion pipeline"""
    print("🚀 Starting RAG Ingestion Pipeline")
    print("=" * 50)
    
    # Step 1: Partition
    elements = partition_document(pdf_path)
    
    # Step 2: Chunk
    chunks = create_chunks_by_title(elements)
    
    # Step 3: AI Summarisation
    summarised_chunks = summarise_chunks(chunks)
    
    # Step 4: Vector Store
    db = create_vector_store(summarised_chunks)
    
    print("🎉 Pipeline completed successfully!")
    return db