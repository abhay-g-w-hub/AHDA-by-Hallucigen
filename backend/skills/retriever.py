import wikipedia
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def retrieve_evidence(query: str) -> list:
    """
    Retrieve evidence for a given query using Wikipedia.
    Returns a list of dicts with 'source' and 'text'.
    """
    evidence = []
    try:
        # Search for the closest page title
        results = wikipedia.search(query, results=1)
        if not results:
            return []
            
        page = wikipedia.page(results[0], auto_suggest=False)
        # Extract a small summary snippet to serve as evidence
        summary = wikipedia.summary(results[0], sentences=3, auto_suggest=False)
        
        evidence.append({
            "source": f"Wikipedia: {page.title}",
            "text": summary
        })
    except wikipedia.exceptions.DisambiguationError as e:
        try:
            # If disambiguation, try the first option
            page = wikipedia.page(e.options[0], auto_suggest=False)
            summary = wikipedia.summary(e.options[0], sentences=3, auto_suggest=False)
            evidence.append({
                "source": f"Wikipedia: {page.title}",
                "text": summary
            })
        except Exception as inner_e:
            logger.error(f"Disambiguation fetch error: {inner_e}")
    except Exception as e:
        logger.error(f"Error retrieving evidence for '{query}': {e}")
        
    return evidence
