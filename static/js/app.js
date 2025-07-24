// SCM-KAI Application JavaScript

class SCMKAIApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeComponents();
    }
    
    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.showLoadingComplete();
        });
        
        // Handle navigation active states
        this.updateActiveNavigation();
    }
    
    initializeComponents() {
        // Initialize tooltips
        this.initializeTooltips();
        
        // Initialize alerts auto-dismiss
        this.initializeAlerts();
        
        // Initialize data refresh
        this.initializeDataRefresh();
    }
    
    initializeTooltips() {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    initializeAlerts() {
        // Auto-dismiss success alerts after 5 seconds
        setTimeout(() => {
            const successAlerts = document.querySelectorAll('.alert-success');
            successAlerts.forEach(alert => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            });
        }, 5000);
    }
    
    initializeDataRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.refreshDashboardData();
        }, 300000);
    }
    
    updateActiveNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    async refreshDashboardData() {
        try {
            const response = await fetch('/api/dashboard-data');
            if (response.ok) {
                const data = await response.json();
                this.updateDashboardElements(data);
            }
        } catch (error) {
            console.error('Failed to refresh dashboard data:', error);
        }
    }
    
    updateDashboardElements(data) {
        // Update KPI cards if they exist
        this.updateKPICards(data);
        
        // Update charts if they exist
        this.updateCharts(data);
        
        // Show refresh indicator
        this.showRefreshIndicator();
    }
    
    updateKPICards(data) {
        // Implementation for updating KPI cards
        console.log('Updating KPI cards with new data');
    }
    
    updateCharts(data) {
        // Implementation for updating charts
        console.log('Updating charts with new data');
    }
    
    showRefreshIndicator() {
        // Show a subtle indicator that data was refreshed
        const indicator = document.createElement('div');
        indicator.className = 'alert alert-info alert-dismissible fade show position-fixed';
        indicator.style.cssText = 'top: 20px; right: 20px; z-index: 9999; width: auto;';
        indicator.innerHTML = `
            <i class="fas fa-sync-alt me-2"></i>Data refreshed
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(indicator);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.remove();
            }
        }, 3000);
    }
    
    showLoadingComplete() {
        // Remove any loading indicators
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(element => {
            element.classList.remove('loading');
        });
    }
    
    // Utility methods
    formatNumber(num, decimals = 2) {
        return Number(num).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }
    
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    formatPercentage(value, decimals = 1) {
        return `${Number(value).toFixed(decimals)}%`;
    }
    
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    const bsAlert = new bootstrap.Alert(notification);
                    bsAlert.close();
                }
            }, duration);
        }
    }
    
    async makeAPICall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(endpoint, finalOptions);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            this.showNotification('Failed to connect to server. Please try again.', 'danger');
            throw error;
        }
    }
}

// Chart utilities
class ChartUtils {
    static createKPIChart(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        
        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        };
        
        return new Chart(ctx, {
            type: options.type || 'doughnut',
            data: data,
            options: { ...defaultOptions, ...options }
        });
    }
    
    static updateChart(chart, newData) {
        if (!chart) return;
        
        chart.data = newData;
        chart.update();
    }
    
    static getStatusColor(value, target, reverse = false) {
        const percentage = (value / target) * 100;
        
        if (reverse) {
            // For metrics where lower is better (like costs)
            if (percentage <= 90) return '#28a745'; // Green
            if (percentage <= 100) return '#ffc107'; // Yellow
            return '#dc3545'; // Red
        } else {
            // For metrics where higher is better (like fill rate)
            if (percentage >= 95) return '#28a745'; // Green
            if (percentage >= 85) return '#ffc107'; // Yellow
            return '#dc3545'; // Red
        }
    }
}

// Initialize the application
const app = new SCMKAIApp();

// Export for global access
window.SCMKAIApp = app;
window.ChartUtils = ChartUtils;

