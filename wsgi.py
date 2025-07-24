import sys
import os

# Add the current directory (scmkai_project) to sys.path
project_home = os.path.abspath(os.path.dirname(__file__))
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variable for production
os.environ['FLASK_ENV'] = 'production'

# Import the Flask app as application (Gunicorn expects this)
from app import app as application

# Initialize database and sample data
from models import init_sample_data, KPIMetric
from app import db

with application.app_context():
    db.create_all()
    if KPIMetric.query.count() == 0:
        init_sample_data()

if __name__ == "__main__":
    application.run()
