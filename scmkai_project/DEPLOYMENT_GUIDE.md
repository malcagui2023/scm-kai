# SCM-KAI Deployment Guide for PythonAnywhere

## Overview
This guide provides step-by-step instructions to deploy the SCM-KAI AI Companion application on PythonAnywhere.

## Prerequisites
- PythonAnywhere account (Free or Paid)
- Basic knowledge of Python and Flask
- Git (for version control)

## Project Structure
```
scm_kai_deployment/
├── app.py                 # Main Flask application
├── models.py             # Database models and sample data
├── api_routes.py         # API endpoints
├── requirements.txt      # Python dependencies
├── wsgi.py              # WSGI configuration for PythonAnywhere
├── templates/           # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── chat.html
│   ├── dashboard.html
│   ├── analytics.html
│   └── settings.html
├── static/              # Static files
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── images/
└── instance/            # Instance-specific files
    └── config.py
```

## Step-by-Step Deployment Instructions

### Step 1: Prepare Your PythonAnywhere Account
1. Log in to your PythonAnywhere account
2. Go to the "Web" tab in your dashboard
3. Click "Add a new web app"
4. Choose "Manual configuration" and select Python 3.10

### Step 2: Upload Your Files
1. Go to the "Files" tab in your PythonAnywhere dashboard
2. Navigate to your home directory (e.g., `/home/yourusername/`)
3. Create a new folder called `scm-kai`
4. Upload all the files from this deployment package to the `scm-kai` folder

**Alternative: Using Git**
```bash
cd /home/yourusername/
git clone <your-repository-url> scm-kai
cd scm-kai
```

### Step 3: Install Dependencies
1. Open a Bash console from your PythonAnywhere dashboard
2. Navigate to your project directory:
```bash
cd /home/yourusername/scm-kai
```
3. Install the required packages:
```bash
pip3.10 install --user -r requirements.txt
```

### Step 4: Configure the Web App
1. Go back to the "Web" tab
2. In the "Code" section, set the following:
   - **Source code:** `/home/yourusername/scm-kai`
   - **Working directory:** `/home/yourusername/scm-kai`
   - **WSGI configuration file:** `/var/www/yourusername_pythonanywhere_com_wsgi.py`

### Step 5: Configure WSGI File
1. Click on the WSGI configuration file link
2. Replace the contents with the configuration provided in `wsgi.py`
3. Update the paths to match your username

### Step 6: Set Up Static Files
1. In the "Static files" section of the Web tab, add:
   - **URL:** `/static/`
   - **Directory:** `/home/yourusername/scm-kai/static/`

### Step 7: Initialize the Database
1. Open a Python console from your dashboard
2. Run the following commands:
```python
import sys
sys.path.append('/home/yourusername/scm-kai')
from models import *
```

### Step 8: Test Your Application
1. Click "Reload" on your web app
2. Visit your application URL: `https://yourusername.pythonanywhere.com`
3. Test all features:
   - Homepage loads correctly
   - Dashboard displays data
   - Chat interface works
   - API endpoints respond

## Configuration Files

### Environment Variables
Create a `.env` file in your project root:
```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=sqlite:///scm_kai.db
```

### Instance Configuration
Create `instance/config.py`:
```python
import os

SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-here'
SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///scm_kai.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Production settings
DEBUG = False
TESTING = False
```

## Troubleshooting

### Common Issues

**1. Import Errors**
- Ensure all files are uploaded correctly
- Check that the working directory is set properly
- Verify Python path in WSGI file

**2. Database Issues**
- Make sure the database is initialized
- Check file permissions
- Verify SQLite database file exists

**3. Static Files Not Loading**
- Confirm static files mapping in Web tab
- Check file paths are correct
- Ensure CSS/JS files are uploaded

**4. 500 Internal Server Error**
- Check error logs in the Web tab
- Verify all dependencies are installed
- Check WSGI configuration

### Checking Logs
1. Go to the "Web" tab
2. Click on "Log files"
3. Check both error and access logs for issues

### Testing API Endpoints
Use the following URLs to test API functionality:
- `/api/kpis` - KPI metrics
- `/api/inventory` - Inventory data
- `/api/suppliers` - Supplier information
- `/api/alerts` - Active alerts
- `/api/chat` - Chat functionality

## Performance Optimization

### For Free Accounts
- Optimize database queries
- Minimize static file sizes
- Use browser caching
- Implement lazy loading

### For Paid Accounts
- Enable always-on tasks for background processes
- Use MySQL database for better performance
- Implement Redis caching
- Set up scheduled tasks for data updates

## Security Considerations

1. **Change Default Secret Key**
   - Update the SECRET_KEY in your configuration
   - Use a strong, random key

2. **Database Security**
   - Ensure database file permissions are correct
   - Consider using environment variables for sensitive data

3. **Input Validation**
   - All user inputs are validated
   - SQL injection protection is built-in with SQLAlchemy

4. **HTTPS**
   - PythonAnywhere provides HTTPS by default
   - Ensure all API calls use HTTPS

## Maintenance

### Regular Tasks
1. **Monitor Logs**
   - Check error logs weekly
   - Monitor performance metrics

2. **Update Dependencies**
   - Keep Flask and other packages updated
   - Test updates in development first

3. **Database Maintenance**
   - Regular backups of database
   - Clean up old conversation logs

4. **Performance Monitoring**
   - Monitor response times
   - Check resource usage

### Backup Strategy
1. **Database Backup**
```bash
cp /home/yourusername/scm-kai/scm_kai.db /home/yourusername/backups/
```

2. **Code Backup**
   - Use Git for version control
   - Regular commits and pushes

## Scaling Considerations

### Moving to Production
1. **Database Migration**
   - Consider PostgreSQL or MySQL for production
   - Implement proper database migrations

2. **Caching**
   - Implement Redis for session storage
   - Cache frequently accessed data

3. **Load Balancing**
   - Consider multiple instances for high traffic
   - Implement proper session management

## Support and Resources

### PythonAnywhere Resources
- [PythonAnywhere Help](https://help.pythonanywhere.com/)
- [Flask Tutorial](https://help.pythonanywhere.com/pages/Flask/)
- [Database Setup](https://help.pythonanywhere.com/pages/Databases/)

### SCM-KAI Specific
- Check application logs for errors
- Test API endpoints individually
- Verify database initialization

## Next Steps

After successful deployment:
1. Test all functionality thoroughly
2. Set up monitoring and alerts
3. Configure regular backups
4. Plan for scaling and optimization
5. Document any custom configurations

## Contact Information
For deployment issues or questions, refer to the troubleshooting section or check the application logs for specific error messages.

