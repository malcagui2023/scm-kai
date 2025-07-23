# WSGI Configuration for PythonAnywhere
# Replace 'yourusername' with your actual PythonAnywhere username

import sys
import os

# Add your project directory to Python path
project_home = '/home/yourusername/scm-kai'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['FLASK_ENV'] = 'production'

# Import your Flask application
from app import app as application

# Initialize database on first run
with application.app_context():
    from app import db
    from models import init_sample_data
    
    # Create tables if they don't exist
    db.create_all()
    
    # Initialize with sample data if database is empty
    from models import SupplyChainData
    if SupplyChainData.query.count() == 0:
        init_sample_data()

if __name__ == "__main__":
    application.run()

