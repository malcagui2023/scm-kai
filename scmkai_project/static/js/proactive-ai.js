/**
 * Proactive AI Mentor System for SCM-KAI
 * Provides contextual suggestions and learning opportunities
 */

class ProactiveAIMentor {
    constructor() {
        this.isActive = true;
        this.suggestionQueue = [];
        this.lastSuggestionTime = 0;
        this.minSuggestionInterval = 30000; // 30 seconds minimum between suggestions
        this.userContext = {};
        this.init();
    }
    
    init() {
        this.loadUserContext();
        this.startContextMonitoring();
        this.setupEventListeners();
        
        // Show welcome message for new users
        setTimeout(() => {
            this.checkForWelcomeMessage();
        }, 2000);
    }
    
    async loadUserContext() {
        try {
            const response = await fetch('/api/learning/progress?user_id=1');
            if (response.ok) {
                const progress = await response.json();
                this.userContext.progress = progress;
            }
            
            // Load dashboard data for context
            const dashboardResponse = await fetch('/api/dashboard-data');
            if (dashboardResponse.ok) {
                const dashboardData = await dashboardResponse.json();
                this.userContext.kpis = dashboardData.kpis;
            }
        } catch (error) {
            console.error('Failed to load user context:', error);
        }
    }
    
    startContextMonitoring() {
        // Monitor for proactive opportunities every 15 seconds
        setInterval(() => {
            if (this.isActive) {
                this.checkForProactiveOpportunities();
            }
        }, 15000);
        
        // Refresh context every 2 minutes
        setInterval(() => {
            this.loadUserContext();
        }, 120000);
    }
    
    async checkForProactiveOpportunities() {
        try {
            const response = await fetch('/api/proactive-suggestion?user_id=1');
            if (response.ok) {
                const suggestion = await response.json();
                if (suggestion && this.shouldShowSuggestion()) {
                    this.showProactiveSuggestion(suggestion);
                }
            }
        } catch (error) {
            console.error('Failed to get proactive suggestion:', error);
        }
    }
    
    shouldShowSuggestion() {
        const now = Date.now();
        return (now - this.lastSuggestionTime) > this.minSuggestionInterval;
    }
    
    showProactiveSuggestion(suggestion) {
        this.lastSuggestionTime = Date.now();
        
        // Create proactive suggestion notification
        const suggestionHtml = `
            <div class="proactive-suggestion" id="proactive-${Date.now()}">
                <div class="suggestion-content">
                    <div class="suggestion-header">
                        <i class="fas fa-lightbulb text-warning me-2"></i>
                        <strong>Learning Opportunity</strong>
                        <button class="btn-close-suggestion" onclick="proactiveAI.dismissSuggestion(this)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="suggestion-body">
                        <p>${suggestion.message}</p>
                        <div class="suggestion-actions">
                            <button class="btn btn-primary btn-sm me-2" onclick="proactiveAI.acceptSuggestion('${suggestion.learning_topic}', '${suggestion.context}')">
                                <i class="fas fa-graduation-cap me-1"></i>Let's Learn!
                            </button>
                            <button class="btn btn-outline-secondary btn-sm" onclick="proactiveAI.dismissSuggestion(this.closest('.proactive-suggestion'))">
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add to page
        this.addSuggestionToPage(suggestionHtml);
        
        // Track suggestion shown
        this.trackInteraction('suggestion_shown', suggestion.context);
    }
    
    addSuggestionToPage(html) {
        // Remove any existing suggestions
        document.querySelectorAll('.proactive-suggestion').forEach(el => el.remove());
        
        // Add new suggestion
        const container = document.createElement('div');
        container.innerHTML = html;
        const suggestion = container.firstElementChild;
        
        // Position based on current page
        const targetContainer = this.findBestContainer();
        if (targetContainer) {
            targetContainer.insertBefore(suggestion, targetContainer.firstChild);
        } else {
            document.body.appendChild(suggestion);
        }
        
        // Animate in
        setTimeout(() => {
            suggestion.classList.add('show');
        }, 100);
        
        // Auto-dismiss after 30 seconds if not interacted with
        setTimeout(() => {
            if (suggestion.parentNode) {
                this.dismissSuggestion(suggestion);
            }
        }, 30000);
    }
    
    findBestContainer() {
        // Try to find the best place to show the suggestion
        const containers = [
            document.querySelector('.container-fluid'),
            document.querySelector('.container'),
            document.querySelector('main'),
            document.querySelector('.content')
        ];
        
        return containers.find(container => container !== null);
    }
    
    acceptSuggestion(learningTopic, context) {
        // Remove suggestion
        document.querySelectorAll('.proactive-suggestion').forEach(el => el.remove());
        
        // Track acceptance
        this.trackInteraction('suggestion_accepted', context);
        
        // Show learning content
        if (learningTopic && window.smartTooltips) {
            // Show detailed explanation
            smartTooltips.showDetailedExplanation(learningTopic);
        } else {
            // Fallback to chat interface
            this.openLearningChat(learningTopic, context);
        }
    }
    
    dismissSuggestion(element) {
        const suggestion = element.closest ? element.closest('.proactive-suggestion') : element;
        if (suggestion) {
            suggestion.classList.remove('show');
            setTimeout(() => {
                if (suggestion.parentNode) {
                    suggestion.parentNode.removeChild(suggestion);
                }
            }, 300);
        }
        
        // Track dismissal
        this.trackInteraction('suggestion_dismissed', 'user_action');
    }
    
    openLearningChat(topic, context) {
        // Navigate to chat with pre-filled learning question
        const learningQuestions = {
            'fill_rate': 'Can you explain fill rate and how to improve it?',
            'inventory_turnover': 'Help me understand inventory turnover and optimization.',
            'supplier_management': 'What should I know about supplier performance management?',
            'safety_stock': 'Explain safety stock calculations and best practices.'
        };
        
        const question = learningQuestions[topic] || `Tell me more about ${topic}`;
        
        // If on chat page, send message directly
        if (window.location.pathname === '/chat') {
            const messageInput = document.getElementById('messageInput');
            if (messageInput) {
                messageInput.value = question;
                // Trigger send if function exists
                if (window.sendMessage) {
                    sendMessage();
                }
            }
        } else {
            // Navigate to chat with question
            window.location.href = `/chat?q=${encodeURIComponent(question)}`;
        }
    }
    
    checkForWelcomeMessage() {
        // Check if user is new or needs onboarding
        const hasSeenWelcome = localStorage.getItem('scm_kai_welcome_shown');
        
        if (!hasSeenWelcome) {
            this.showWelcomeMessage();
            localStorage.setItem('scm_kai_welcome_shown', 'true');
        }
    }
    
    showWelcomeMessage() {
        const welcomeMessage = {
            type: 'welcome',
            message: "Welcome to SCM-KAI! I'm your AI learning companion. I'll help you understand supply chain concepts and improve your skills. Hover over any metric to learn more, or ask me questions anytime!",
            learning_topic: 'onboarding',
            context: 'welcome'
        };
        
        setTimeout(() => {
            this.showProactiveSuggestion(welcomeMessage);
        }, 1000);
    }
    
    // Method to manually trigger coaching
    provideCoaching(context, userAction) {
        const coachingMessages = {
            'low_fill_rate': "I notice you're looking at fill rate data. Since it's below target, this is a perfect learning opportunity! Would you like me to explain what might be causing this and how to improve it?",
            'high_inventory': "Your inventory levels are quite high. This could be a good time to learn about inventory optimization strategies. Interested?",
            'supplier_issues': "I see some supplier performance concerns. Want to explore how to analyze and improve supplier relationships?",
            'first_login': "Since this is your first time here, let me show you around and explain the key metrics you'll be working with!"
        };
        
        const message = coachingMessages[context];
        if (message && this.shouldShowSuggestion()) {
            this.showProactiveSuggestion({
                type: 'coaching',
                message: message,
                learning_topic: context,
                context: userAction
            });
        }
    }
    
    // Method to celebrate user progress
    celebrateProgress(achievement) {
        const celebrations = {
            'first_question': "Great question! Asking questions is how experts are made. Keep it up!",
            'concept_mastered': "Excellent! You've mastered another supply chain concept. You're really growing!",
            'good_decision': "Nice work! That was a smart decision based on the data.",
            'improvement_spotted': "Great catch! You're developing a keen eye for supply chain issues."
        };
        
        const message = celebrations[achievement];
        if (message) {
            this.showCelebration(message);
        }
    }
    
    showCelebration(message) {
        // Create celebration notification
        const celebrationHtml = `
            <div class="celebration-message">
                <div class="celebration-content">
                    <i class="fas fa-star text-warning me-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = celebrationHtml;
        const celebration = container.firstElementChild;
        
        document.body.appendChild(celebration);
        
        // Animate in
        setTimeout(() => {
            celebration.classList.add('show');
        }, 100);
        
        // Auto-remove after 4 seconds
        setTimeout(() => {
            celebration.classList.remove('show');
            setTimeout(() => {
                if (celebration.parentNode) {
                    celebration.parentNode.removeChild(celebration);
                }
            }, 300);
        }, 4000);
    }
    
    trackInteraction(interactionType, context) {
        // Send analytics data
        fetch('/api/learning/interaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interaction_type: interactionType,
                context: context,
                timestamp: new Date().toISOString(),
                user_id: 1
            })
        }).catch(error => {
            console.error('Failed to track interaction:', error);
        });
    }
    
    setupEventListeners() {
        // Listen for page navigation to provide contextual help
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.onPageChange();
            }, 500);
        });
        
        // Listen for user interactions that might trigger coaching
        document.addEventListener('click', (e) => {
            this.onUserInteraction(e);
        });
    }
    
    onPageChange() {
        const path = window.location.pathname;
        
        // Provide page-specific guidance
        const pageGuidance = {
            '/dashboard': () => {
                setTimeout(() => {
                    this.provideCoaching('dashboard_visit', 'page_navigation');
                }, 3000);
            },
            '/chat': () => {
                // Encourage first question if user hasn't asked any
                const hasAskedQuestion = localStorage.getItem('scm_kai_has_asked_question');
                if (!hasAskedQuestion) {
                    setTimeout(() => {
                        this.provideCoaching('first_chat_visit', 'page_navigation');
                    }, 2000);
                }
            },
            '/analytics': () => {
                setTimeout(() => {
                    this.provideCoaching('analytics_visit', 'page_navigation');
                }, 2000);
            }
        };
        
        const guidance = pageGuidance[path];
        if (guidance) {
            guidance();
        }
    }
    
    onUserInteraction(event) {
        // Track meaningful interactions for coaching opportunities
        const target = event.target;
        
        if (target.matches('[data-metric]')) {
            this.trackInteraction('metric_clicked', target.dataset.metric);
        }
        
        if (target.matches('.btn, button')) {
            this.trackInteraction('button_clicked', target.textContent.trim());
        }
    }
    
    // Public methods for external use
    enable() {
        this.isActive = true;
    }
    
    disable() {
        this.isActive = false;
        // Remove any active suggestions
        document.querySelectorAll('.proactive-suggestion').forEach(el => el.remove());
    }
    
    triggerSuggestion(topic, context) {
        this.provideCoaching(topic, context);
    }
}

// Initialize proactive AI when DOM is ready
let proactiveAI;
document.addEventListener('DOMContentLoaded', () => {
    proactiveAI = new ProactiveAIMentor();
    
    // Make it globally accessible
    window.proactiveAI = proactiveAI;
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProactiveAIMentor;
}

