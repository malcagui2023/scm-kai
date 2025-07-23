# SCM-KAI AI Companion

## Overview
SCM-KAI is an intelligent AI companion designed to transform supply chain operations through natural language processing and real-time analytics. Built for supply chain professionals, it provides instant insights, proactive recommendations, and seamless integration with existing systems.

## Features

### 🤖 AI-Powered Chat Interface
- Natural language processing for supply chain queries
- Contextual responses based on your data
- Quick action buttons for common questions
- Conversation history and learning capabilities

### 📊 Real-Time Dashboard
- Live KPI monitoring (Fill Rate, Inventory Value, Supplier Performance)
- Interactive charts and visualizations
- Alert management system
- Performance trend analysis

### 📈 Advanced Analytics
- Demand forecasting vs actual analysis
- Supplier performance matrix
- Risk analysis and recommendations
- Inventory optimization insights

### 🔧 Comprehensive Settings
- Customizable notification preferences
- AI behavior configuration
- Data source integration
- Security and privacy controls

## Technology Stack

### Backend
- **Flask** - Python web framework
- **SQLAlchemy** - Database ORM
- **SQLite** - Database (easily upgradeable to PostgreSQL/MySQL)

### Frontend
- **Bootstrap 5** - Responsive UI framework
- **Chart.js** - Interactive charts and visualizations
- **Font Awesome** - Icons and visual elements
- **Vanilla JavaScript** - Client-side functionality

### Deployment
- **PythonAnywhere** - Web hosting platform
- **WSGI** - Web server gateway interface
- **Git** - Version control

## Quick Start

### Prerequisites
- Python 3.8+
- PythonAnywhere account
- Basic knowledge of Flask applications

### Installation
1. Clone or download this repository
2. Upload files to your PythonAnywhere account
3. Install dependencies: `pip install -r requirements.txt`
4. Configure WSGI file with your username
5. Initialize database and sample data
6. Deploy and test

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

## File Structure
```
scm_kai_deployment/
├── app.py                 # Main Flask application
├── models.py             # Database models
├── api_routes.py         # API endpoints
├── wsgi.py              # WSGI configuration
├── requirements.txt      # Dependencies
├── templates/           # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── chat.html
│   ├── dashboard.html
│   ├── analytics.html
│   └── settings.html
├── static/              # Static assets
│   ├── css/style.css
│   ├── js/app.js
│   └── images/
└── docs/
    ├── DEPLOYMENT_GUIDE.md
    └── README.md
```

## Key Components

### AI Engine (`app.py`)
The SCMKAIEngine class handles natural language processing and generates contextual responses based on supply chain keywords and patterns.

### Database Models (`models.py`)
- **User** - User management
- **Conversation** - Chat history
- **SupplyChainData** - Core metrics
- **InventoryItem** - Inventory management
- **Supplier** - Supplier information
- **KPIMetric** - Performance indicators
- **Alert** - System notifications

### API Endpoints (`api_routes.py`)
- `/api/chat` - Chat functionality
- `/api/kpis` - KPI metrics
- `/api/inventory` - Inventory data
- `/api/suppliers` - Supplier information
- `/api/alerts` - Alert management
- `/api/analytics/summary` - Dashboard summary

## Configuration

### Environment Variables
Create a `.env` file:
```
FLASK_ENV=production
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///scm_kai.db
```

### Database Initialization
The application automatically creates tables and sample data on first run. To manually initialize:
```python
from models import init_sample_data
init_sample_data()
```

## Customization

### Adding New AI Responses
Extend the `SCMKAIEngine.responses` dictionary in `app.py`:
```python
'new_category': {
    'keywords': ['keyword1', 'keyword2'],
    'response': 'Your response template with {variables}'
}
```

### Custom KPIs
Add new metrics in `models.py`:
```python
KPIMetric(name='New Metric', value=100, target=95, unit='%', category='performance')
```

### UI Customization
- Modify `static/css/style.css` for styling
- Update templates in `templates/` directory
- Add JavaScript functionality in `static/js/app.js`

## API Usage Examples

### Chat API
```javascript
fetch('/api/chat', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({message: 'What is my fill rate?'})
})
```

### KPI Data
```javascript
fetch('/api/kpis')
    .then(response => response.json())
    .then(data => console.log(data));
```

## Security Features

- CSRF protection via Flask-WTF
- SQL injection prevention with SQLAlchemy
- XSS protection through template escaping
- Secure session management
- Input validation and sanitization

## Performance Optimization

### Database
- Indexed queries for better performance
- Connection pooling for concurrent users
- Query optimization for large datasets

### Frontend
- Minified CSS and JavaScript
- Image optimization
- Browser caching headers
- Lazy loading for charts

### Caching
- Flask-Caching for frequently accessed data
- Browser-side caching for static assets
- API response caching

## Monitoring and Logging

### Application Logs
- Error logging to files
- Performance monitoring
- User activity tracking

### Health Checks
- Database connectivity
- API endpoint status
- System resource usage

## Troubleshooting

### Common Issues
1. **Database not found** - Run database initialization
2. **Static files not loading** - Check static file mapping
3. **API errors** - Verify endpoint URLs and request format
4. **Chat not responding** - Check AI engine configuration

### Debug Mode
Enable debug mode for development:
```python
app.run(debug=True)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For deployment issues, refer to:
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- PythonAnywhere documentation
- Flask documentation
- Application logs for specific errors

## Roadmap

### Upcoming Features
- Advanced machine learning models
- Real-time data streaming
- Mobile application
- Advanced reporting tools
- Integration with major ERP systems

### Version History
- **v1.0** - Initial release with core functionality
- **v1.1** - Enhanced UI and additional KPIs
- **v1.2** - Advanced analytics and recommendations

---

**SCM-KAI** - Transforming Supply Chain Operations with AI

