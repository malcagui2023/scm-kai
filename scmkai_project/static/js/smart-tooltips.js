/**
 * Smart Tooltip System for SCM-KAI
 * Provides contextual learning explanations for metrics and concepts
 */

class SmartTooltipSystem {
    constructor() {
        this.tooltips = new Map();
        this.userLevel = 'Entry'; // Will be loaded from user context
        this.init();
    }
    
    init() {
        this.loadUserContext();
        this.initializeTooltips();
        this.setupEventListeners();
    }
    
    async loadUserContext() {
        try {
            const response = await fetch('/api/learning/progress');
            if (response.ok) {
                const progress = await response.json();
                this.userProgress = progress;
            }
        } catch (error) {
            console.error('Failed to load user context:', error);
        }
    }
    
    initializeTooltips() {
        // Define tooltip configurations for different metrics
        this.tooltipConfigs = {
            'fill-rate': {
                topic_key: 'fill_rate',
                trigger: '[data-metric="fill-rate"], .fill-rate-metric, #fillRateCard',
                position: 'top'
            },
            'inventory-value': {
                topic_key: 'inventory_turnover',
                trigger: '[data-metric="inventory-value"], .inventory-metric, #inventoryCard',
                position: 'top'
            },
            'supplier-performance': {
                topic_key: 'supplier_management',
                trigger: '[data-metric="supplier-performance"], .supplier-metric, #supplierCard',
                position: 'top'
            },
            'safety-stock': {
                topic_key: 'safety_stock',
                trigger: '[data-metric="safety-stock"], .safety-stock-metric',
                position: 'top'
            }
        };
        
        // Initialize tooltips for each configuration
        Object.entries(this.tooltipConfigs).forEach(([key, config]) => {
            this.createTooltip(key, config);
        });
    }
    
    createTooltip(tooltipId, config) {
        const elements = document.querySelectorAll(config.trigger);
        
        elements.forEach(element => {
            // Add tooltip indicator
            this.addTooltipIndicator(element);
            
            // Setup hover events
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, config.topic_key, config.position);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
            
            // Add click for detailed explanation
            element.addEventListener('click', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    this.showDetailedExplanation(config.topic_key);
                }
            });
        });
    }
    
    addTooltipIndicator(element) {
        // Add a subtle indicator that this element has learning content
        if (!element.querySelector('.learning-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'learning-indicator';
            indicator.innerHTML = '<i class="fas fa-question-circle"></i>';
            indicator.title = 'Click for detailed explanation (Ctrl+Click)';
            
            // Position the indicator
            element.style.position = 'relative';
            indicator.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                color: #0d6efd;
                opacity: 0.6;
                font-size: 12px;
                cursor: help;
                z-index: 10;
            `;
            
            element.appendChild(indicator);
        }
    }
    
    async showTooltip(element, topicKey, position = 'top') {
        // Remove existing tooltip
        this.hideTooltip();
        
        try {
            // Get explanation for user's level
            const response = await fetch(`/api/learning/explanation/${topicKey}?user_id=1`);
            if (!response.ok) return;
            
            const data = await response.json();
            
            // Create tooltip element
            const tooltip = this.createTooltipElement(data, topicKey);
            document.body.appendChild(tooltip);
            
            // Position tooltip
            this.positionTooltip(tooltip, element, position);
            
            // Show with animation
            setTimeout(() => {
                tooltip.classList.add('show');
            }, 10);
            
            // Track interaction
            this.trackTooltipInteraction(topicKey, 'hover');
            
        } catch (error) {
            console.error('Failed to load tooltip content:', error);
        }
    }
    
    createTooltipElement(data, topicKey) {
        const tooltip = document.createElement('div');
        tooltip.className = 'smart-tooltip';
        tooltip.id = 'active-tooltip';
        
        // Get user's competency for this topic
        const userProgress = this.getUserProgress(topicKey);
        const competencyLevel = userProgress ? userProgress.competency_level : 1;
        const confidenceScore = userProgress ? userProgress.confidence_score : 50;
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <h6 class="mb-1">${data.title}</h6>
                <div class="user-progress">
                    <small class="text-muted">
                        Your level: ${this.getCompetencyLabel(competencyLevel)} 
                        (${confidenceScore}% confidence)
                    </small>
                </div>
            </div>
            <div class="tooltip-content">
                <p class="explanation">${data.explanation}</p>
                ${data.industry_benchmark ? `
                    <div class="benchmark">
                        <strong>Industry Benchmark:</strong> ${data.industry_benchmark}
                    </div>
                ` : ''}
                ${data.why_important ? `
                    <div class="importance">
                        <strong>Why it matters:</strong> ${data.why_important}
                    </div>
                ` : ''}
            </div>
            <div class="tooltip-footer">
                <small class="text-muted">
                    Ctrl+Click for detailed explanation • 
                    <a href="#" class="practice-link" data-topic="${topicKey}">Practice this concept</a>
                </small>
            </div>
        `;
        
        // Add click handler for practice link
        const practiceLink = tooltip.querySelector('.practice-link');
        if (practiceLink) {
            practiceLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.startPracticeSession(topicKey);
            });
        }
        
        return tooltip;
    }
    
    positionTooltip(tooltip, element, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top, left;
        
        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                break;
            case 'left':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.left - tooltipRect.width - 10;
                break;
            case 'right':
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                left = rect.right + 10;
                break;
        }
        
        // Ensure tooltip stays within viewport
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));
        
        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
    }
    
    hideTooltip() {
        const existingTooltip = document.getElementById('active-tooltip');
        if (existingTooltip) {
            existingTooltip.classList.remove('show');
            setTimeout(() => {
                if (existingTooltip.parentNode) {
                    existingTooltip.parentNode.removeChild(existingTooltip);
                }
            }, 200);
        }
    }
    
    async showDetailedExplanation(topicKey) {
        try {
            const response = await fetch(`/api/learning/explanation/${topicKey}?level=advanced&user_id=1`);
            if (!response.ok) return;
            
            const data = await response.json();
            
            // Create modal for detailed explanation
            this.showExplanationModal(data, topicKey);
            
            // Track interaction
            this.trackTooltipInteraction(topicKey, 'detailed_view');
            
        } catch (error) {
            console.error('Failed to load detailed explanation:', error);
        }
    }
    
    showExplanationModal(data, topicKey) {
        // Create modal HTML
        const modalHtml = `
            <div class="modal fade" id="explanationModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-graduation-cap me-2"></i>
                                Learning: ${data.title}
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="learning-content">
                                <div class="explanation-section">
                                    <h6>Explanation</h6>
                                    <p>${data.explanation}</p>
                                </div>
                                
                                ${data.industry_benchmark ? `
                                    <div class="benchmark-section">
                                        <h6>Industry Benchmark</h6>
                                        <p>${data.industry_benchmark}</p>
                                    </div>
                                ` : ''}
                                
                                ${data.why_important ? `
                                    <div class="importance-section">
                                        <h6>Why This Matters</h6>
                                        <p>${data.why_important}</p>
                                    </div>
                                ` : ''}
                                
                                <div class="practice-section">
                                    <h6>Ready to Practice?</h6>
                                    <p>Understanding concepts is just the first step. Let's apply this knowledge!</p>
                                    <button class="btn btn-primary" onclick="smartTooltips.startPracticeSession('${topicKey}')">
                                        <i class="fas fa-play me-2"></i>Start Practice Session
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" onclick="smartTooltips.markAsUnderstood('${topicKey}')">
                                <i class="fas fa-check me-2"></i>I Understand This
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('explanationModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('explanationModal'));
        modal.show();
    }
    
    startPracticeSession(topicKey) {
        // Close any open modals
        const modal = bootstrap.Modal.getInstance(document.getElementById('explanationModal'));
        if (modal) modal.hide();
        
        // Show practice interface (placeholder for now)
        SCMKAIApp.showNotification(
            `Practice session for ${topicKey} will be available soon! For now, try applying this concept to your current data.`,
            'info',
            5000
        );
        
        // Track practice initiation
        this.trackTooltipInteraction(topicKey, 'practice_started');
    }
    
    async markAsUnderstood(topicKey) {
        try {
            // Update user progress (placeholder API call)
            const response = await fetch('/api/learning/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topicKey,
                    action: 'mark_understood',
                    confidence_boost: 10
                })
            });
            
            if (response.ok) {
                SCMKAIApp.showNotification('Great! Your progress has been updated.', 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('explanationModal'));
                if (modal) modal.hide();
            }
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
        
        // Track understanding
        this.trackTooltipInteraction(topicKey, 'marked_understood');
    }
    
    getUserProgress(topicKey) {
        if (!this.userProgress) return null;
        return this.userProgress.find(p => p.topic === topicKey);
    }
    
    getCompetencyLabel(level) {
        const labels = {
            1: 'Beginner',
            2: 'Learning',
            3: 'Competent',
            4: 'Proficient',
            5: 'Expert'
        };
        return labels[level] || 'Beginner';
    }
    
    trackTooltipInteraction(topicKey, interactionType) {
        // Send analytics data
        fetch('/api/learning/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: topicKey,
                interaction_type: interactionType,
                timestamp: new Date().toISOString()
            })
        }).catch(error => {
            console.error('Failed to track interaction:', error);
        });
    }
    
    setupEventListeners() {
        // Global escape key to hide tooltips
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideTooltip();
            }
        });
        
        // Hide tooltip when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.smart-tooltip') && !e.target.closest('[data-metric]')) {
                this.hideTooltip();
            }
        });
    }
    
    // Public method to manually trigger tooltip
    showTooltipFor(selector, topicKey) {
        const element = document.querySelector(selector);
        if (element) {
            this.showTooltip(element, topicKey);
        }
    }
    
    // Method to add tooltip to new elements dynamically
    addTooltipToElement(element, topicKey, position = 'top') {
        this.addTooltipIndicator(element);
        
        element.addEventListener('mouseenter', (e) => {
            this.showTooltip(e.target, topicKey, position);
        });
        
        element.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
        
        element.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) {
                this.showDetailedExplanation(topicKey);
            }
        });
    }
}

// Initialize smart tooltips when DOM is ready
let smartTooltips;
document.addEventListener('DOMContentLoaded', () => {
    smartTooltips = new SmartTooltipSystem();
    
    // Make it globally accessible
    window.smartTooltips = smartTooltips;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SmartTooltipSystem;
}

