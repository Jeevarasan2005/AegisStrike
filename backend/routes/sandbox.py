from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class CodeExecutionRequest(BaseModel):
    vulnerability_type: str
    is_secure: bool
    payload: str

@router.post("/execute")
async def execute_sandbox_code(request: CodeExecutionRequest):
    """
    Simulates the execution of vulnerable vs secure code.
    This is an educational endpoint; it does not actually run dangerous operations against real systems.
    """
    import re
    payload_clean = request.payload.strip()

    if request.vulnerability_type == "sqli":
        # Check if the payload matches common SQL injection patterns
        # e.g., ' OR 1=1, ' OR 'a'='a, UNION SELECT, admin' --, etc.
        sqli_patterns = [
            r"'\s*or\s*['\"]?\d+['\"]?\s*=\s*['\"]?\d+",
            r"'\s*or\s*['\"].+['\"]\s*=\s*['\"].+",
            r"union\s+select",
            r"'\s*--",
            r"'\s*#"
        ]
        is_sqli_detected = any(re.search(pattern, payload_clean, re.IGNORECASE) for pattern in sqli_patterns)

        if not request.is_secure:
            # Simulate vulnerable SQL concatenation
            query = f"SELECT * FROM users WHERE username = '{request.payload}'"
            if is_sqli_detected:
                return {"status": "vulnerable", "message": "SQL Injection successful! Bypassed authentication and returned all user records.", "simulated_query": query}
            return {"status": "executed", "message": "Query executed, but no SQL injection payload triggered. Access denied (user not found).", "simulated_query": query}
        else:
            # Simulate parameterized query
            query = "SELECT * FROM users WHERE username = %s"
            return {"status": "secure", "message": "Query executed safely. The database treated your input purely as text, preventing any SQL Injection.", "simulated_query": query, "parameters": [request.payload]}
            
    elif request.vulnerability_type == "xss":
        # Check if the payload contains script tags, event handlers, or javascript: pseudo-protocol
        xss_patterns = [
            r"<script.*?>",
            r"javascript:",
            r"on\w+\s*=",
            r"<img.*?>"
        ]
        is_xss_detected = any(re.search(pattern, payload_clean, re.IGNORECASE) for pattern in xss_patterns)

        if not request.is_secure:
            if is_xss_detected:
                return {"status": "vulnerable", "message": "Reflected XSS successful! Your script executed in the browser context.", "rendered_html": f"<div>Hello {request.payload}</div>"}
            return {"status": "executed", "message": "Input rendered. Since there was no script or HTML payload, no XSS triggered.", "rendered_html": f"<div>Hello {request.payload}</div>"}
        else:
            import html
            safe_payload = html.escape(request.payload)
            return {"status": "secure", "message": "Input was properly sanitized. HTML characters were encoded safely.", "rendered_html": f"<div>Hello {safe_payload}</div>"}
            
    elif request.vulnerability_type == "path_traversal":
        is_traversal_detected = "../" in payload_clean or "..\\" in payload_clean

        if not request.is_secure:
            if is_traversal_detected:
                return {"status": "vulnerable", "message": "Path Traversal successful! Bypassed directory boundary and accessed sensitive file: /etc/passwd", "simulated_path": f"/var/www/html/images/{request.payload}"}
            return {"status": "executed", "message": "File accessed within the directory.", "simulated_path": f"/var/www/html/images/{request.payload}"}
        else:
            import os
            base_dir = "/var/www/html/images/"
            requested_path = os.path.join(base_dir, request.payload)
            real_path = os.path.realpath(requested_path)
            if not real_path.startswith(os.path.realpath(base_dir)):
                 return {"status": "secure", "message": "Path traversal blocked! The code validated that the resolved path stays within the base directory.", "simulated_path": real_path}
            return {"status": "executed", "message": "File accessed safely within boundaries.", "simulated_path": real_path}

    raise HTTPException(status_code=400, detail="Unknown vulnerability type")
