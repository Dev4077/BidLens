"""
BidLens Agent — LangGraph Graph Definition
Wires all nodes into a sequential proposal generation pipeline.
"""

import logging
from langgraph.graph import StateGraph, END

from app.agent.state import ProposalState
from app.agent.nodes import (
    parse_job_node,
    match_profile_node,
    rag_retrieval_node,
    generate_proposals_node,
    chat_iteration_node,
)

logger = logging.getLogger(__name__)


def build_proposal_graph() -> StateGraph:
    """
    Build the proposal generation pipeline graph.

    Flow: parse_job → match_profile → rag_retrieval → generate_proposals → END
    """
    graph = StateGraph(ProposalState)

    # Add nodes
    graph.add_node("parse_job", parse_job_node)
    graph.add_node("match_profile", match_profile_node)
    graph.add_node("rag_retrieval", rag_retrieval_node)
    graph.add_node("generate_proposals", generate_proposals_node)

    # Define edges (sequential pipeline)
    graph.set_entry_point("parse_job")
    graph.add_edge("parse_job", "match_profile")
    graph.add_edge("match_profile", "rag_retrieval")
    graph.add_edge("rag_retrieval", "generate_proposals")
    graph.add_edge("generate_proposals", END)

    return graph.compile()


def build_chat_graph() -> StateGraph:
    """
    Build the chat iteration graph for proposal refinement.

    Flow: chat_iteration → END
    """
    graph = StateGraph(ProposalState)

    graph.add_node("chat_iteration", chat_iteration_node)

    graph.set_entry_point("chat_iteration")
    graph.add_edge("chat_iteration", END)

    return graph.compile()


# Singleton instances
proposal_pipeline = build_proposal_graph()
chat_pipeline = build_chat_graph()
