import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler
from flask import request, g
import functools
import time

def setup_logger():
    """Configure logging for the application"""
    # Create logs directory in backend root (go up two levels from src/utils to backend root)
    backend_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    log_dir = os.path.join(backend_root, 'logs')
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)-20s | %(funcName)-15s:%(lineno)-4d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )
    
    # Console handler (for development)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    # File handler for all logs
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # Error file handler
    error_handler = RotatingFileHandler(
        os.path.join(log_dir, 'error.log'),
        maxBytes=5*1024*1024,  # 5MB
        backupCount=3
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    # API requests file handler
    api_handler = RotatingFileHandler(
        os.path.join(log_dir, 'api.log'),
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    api_handler.setLevel(logging.INFO)
    api_handler.setFormatter(detailed_formatter)
    
    # Create API logger
    api_logger = logging.getLogger('api')
    api_logger.addHandler(api_handler)
    api_logger.addHandler(console_handler)
    api_logger.setLevel(logging.INFO)
    api_logger.propagate = False
    
    return logger

def log_request_info():
    """Log incoming request details"""
    logger = logging.getLogger('api')
    
    # Get client IP
    client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    
    # Get user agent
    user_agent = request.headers.get('User-Agent', 'Unknown')
    
    # Get authorization header (masked)
    auth_header = request.headers.get('Authorization', 'None')
    if auth_header and auth_header.startswith('Bearer '):
        auth_header = f"Bearer {auth_header[7:15]}..."
    
    # Log request details
    logger.info(f"🔵 {request.method} {request.path} | IP: {client_ip} | Auth: {auth_header}")
    
    if request.is_json and request.get_json():
        data = request.get_json()
        # Mask sensitive data
        safe_data = mask_sensitive_data(data)
        logger.debug(f"📝 Request body: {safe_data}")
    
    # Store start time for response time calculation
    g.start_time = time.time()

def log_response_info(response):
    """Log response details"""
    logger = logging.getLogger('api')
    
    # Calculate response time
    response_time = int((time.time() - g.get('start_time', time.time())) * 1000)
    
    # Log response
    status_emoji = "✅" if 200 <= response.status_code < 300 else "❌" if response.status_code >= 400 else "⚠️"
    logger.info(f"{status_emoji} {request.method} {request.path} | Status: {response.status_code} | Time: {response_time}ms")
    
    # Log error responses with more detail
    if response.status_code >= 400:
        try:
            if response.is_json:
                error_data = response.get_json()
                logger.error(f"💥 Error response: {error_data}")
        except:
            logger.error(f"💥 Error response: {response.get_data(as_text=True)[:200]}")
    
    return response

def mask_sensitive_data(data):
    """Mask sensitive data in logs"""
    if not isinstance(data, dict):
        return data
    
    sensitive_keys = {'password', 'token', 'secret', 'key', 'auth', 'authorization'}
    masked_data = {}
    
    for key, value in data.items():
        if key.lower() in sensitive_keys:
            masked_data[key] = "***MASKED***"
        elif isinstance(value, dict):
            masked_data[key] = mask_sensitive_data(value)
        else:
            masked_data[key] = value
    
    return masked_data

def log_api_call(func):
    """Decorator to log API function calls"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = logging.getLogger(f'api.{func.__module__}.{func.__name__}')
        
        try:
            logger.debug(f"🔧 Executing {func.__name__}")
            result = func(*args, **kwargs)
            logger.debug(f"✅ {func.__name__} completed successfully")
            return result
        except Exception as e:
            logger.error(f"💥 {func.__name__} failed: {str(e)}", exc_info=True)
            raise
    
    return wrapper

def log_db_operation(operation, model=None, record_id=None, details=None):
    """Log database operations"""
    logger = logging.getLogger('db')
    
    log_msg = f"🗄️ {operation}"
    if model:
        log_msg += f" {model.__name__}" if hasattr(model, '__name__') else f" {model}"
    if record_id:
        log_msg += f" (ID: {record_id})"
    if details:
        log_msg += f" | {details}"
    
    logger.info(log_msg)

def log_jwt_operation(operation, user_id=None, token_type='access', details=None):
    """Log JWT operations"""
    logger = logging.getLogger('jwt')
    
    log_msg = f"🔑 JWT {operation}"
    if user_id:
        log_msg += f" for user {user_id}"
    if token_type:
        log_msg += f" ({token_type} token)"
    if details:
        log_msg += f" | {details}"
    
    logger.info(log_msg)

def log_auth_event(event, user_email=None, user_id=None, success=True, details=None):
    """Log authentication events"""
    logger = logging.getLogger('auth')
    
    status_emoji = "✅" if success else "❌"
    log_msg = f"{status_emoji} Auth {event}"
    
    if user_email:
        log_msg += f" | Email: {user_email}"
    if user_id:
        log_msg += f" | User ID: {user_id}"
    if details:
        log_msg += f" | {details}"
    
    if success:
        logger.info(log_msg)
    else:
        logger.warning(log_msg)

# Create module-level loggers for easy import
app_logger = logging.getLogger('app')
api_logger = logging.getLogger('api')
db_logger = logging.getLogger('db')
jwt_logger = logging.getLogger('jwt')
auth_logger = logging.getLogger('auth')