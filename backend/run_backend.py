import sys
import logging
from waitress import serve
from artisan_backend.wsgi import application

logging.basicConfig(
    filename='backend_debug.log',
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)

if __name__ == '__main__':
    logging.info("Starting Waitress server on 127.0.0.1:8001")
    print("Serving on http://127.0.0.1:8001")
    sys.stdout.flush()
    try:
        serve(application, host='127.0.0.1', port=8001, threads=4, channel_timeout=120)
    except Exception as e:
        logging.exception(f"Waitress server encountered error: {e}")
        raise
