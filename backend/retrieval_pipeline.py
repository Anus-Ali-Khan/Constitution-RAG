from langchain.retrievers import EnsembleRetriever, BM25Retriever
from langchain_cohere import CohereRerank
from langchain_core.retrievers import BaseRetriever
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_community.chat_models import ChatOllama
from utils import retrieve_from_supabase


class SupabaseRetriever(BaseRetriever):
    """Custom retriever using direct RPC — compatible with supabase>=2.0"""
    k: int = 15

    def _get_relevant_documents(self, query: str, *, run_manager: CallbackManagerForRetrieverRun):
        return retrieve_from_supabase(query, k=self.k)


def run_retrieval_pipeline(query: str) -> str:
    """Run the full hybrid retrieval + reranking + generation pipeline for a query."""

    # Step 1: Hybrid search
    vector_retriever = SupabaseRetriever(k=15)

    # BM25 needs a corpus — fetch a broad set of docs to build the keyword index
    corpus_docs = retrieve_from_supabase(query, k=50)
    bm25_retriever = BM25Retriever.from_documents(corpus_docs)
    bm25_retriever.k = 15

    hybrid_retriever = EnsembleRetriever(
        retrievers=[vector_retriever, bm25_retriever],
        weights=[0.5, 0.5]
    )

    retrieved_docs = hybrid_retriever.invoke(query)

    # Step 2: Cohere reranking
    reranker = CohereRerank(model="rerank-english-v3.0", top_n=10)
    reranked_docs = reranker.compress_documents(retrieved_docs, query)

    # Step 3: Generate answer with top 5 reranked docs
    top_docs = reranked_docs[:5]
    combined_input = f"""Based on the following documents, please answer this question: {query}

Documents:
{chr(10).join([f"- {doc.page_content}" for doc in top_docs])}

Please provide a clear, helpful answer using only the information from these documents."""

    model = ChatOllama(model="mistral")
    messages = [
        SystemMessage(content="You are a helpful assistant."),
        HumanMessage(content=combined_input),
    ]

    result = model.invoke(messages)
    return result.content
