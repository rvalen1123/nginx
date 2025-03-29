// AI Chat Assistant functionality
class AIChatAssistant {
    constructor() {
        this.chatWidget = document.getElementById('chat-widget');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        this.chatToggle = document.getElementById('chat-toggle');
        this.closeChat = document.getElementById('close-chat');
        this.formData = new Map(); // Store form data for auto-fill
        
        this.initializeChat();
    }
    
    initializeChat() {
        // Add minimize button to header
        this.addMinimizeButton();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Add auto-minimize on form field focus
        this.initializeFormFieldListeners();
    }
    
    addMinimizeButton() {
        const chatHeader = document.querySelector('#chat-widget .bg-blue-600');
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'minimize-chat';
        minimizeBtn.className = 'text-white p-1 hover:bg-blue-700 rounded mr-1';
        minimizeBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>
        `;
        
        const btnWrapper = document.createElement('div');
        btnWrapper.className = 'chat-header-btns flex';
        
        btnWrapper.appendChild(minimizeBtn);
        btnWrapper.appendChild(this.closeChat);
        chatHeader.replaceChild(btnWrapper, this.closeChat);
        
        this.minimizeBtn = minimizeBtn;
    }
    
    initializeEventListeners() {
        // Minimize button click handler
        this.minimizeBtn.addEventListener('click', () => this.toggleMinimize());
        
        // Chat form submission
        this.chatForm.addEventListener('submit', (e) => this.handleChatSubmission(e));
        
        // Chat toggle button
        this.chatToggle.addEventListener('click', () => this.toggleChat());
    }
    
    initializeFormFieldListeners() {
        document.querySelectorAll('input, textarea, select').forEach(element => {
            element.addEventListener('focus', () => {
                if (!this.chatWidget.classList.contains('hidden') && window.innerWidth < 768) {
                    this.minimizeChat();
                }
            });
        });
    }
    
    toggleMinimize() {
        this.chatWidget.classList.toggle('minimized');
        this.updateMinimizeButton();
    }
    
    minimizeChat() {
        this.chatWidget.classList.add('minimized');
        this.updateMinimizeButton();
    }
    
    updateMinimizeButton() {
        const isMinimized = this.chatWidget.classList.contains('minimized');
        this.minimizeBtn.innerHTML = isMinimized ? 
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>` :
            `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
            </svg>`;
    }
    
    toggleChat() {
        this.chatWidget.classList.toggle('hidden');
        if (!this.chatWidget.classList.contains('hidden')) {
            this.chatInput.focus();
            if (this.chatMessages.children.length === 0) {
                this.addChatMessage('assistant', 'Hello! I\'m your MSC Wound Care assistant. I can help save you time by pre-filling forms, providing guidance, or answering questions. What would you like help with?');
            }
        }
    }
    
    async handleChatSubmission(e) {
        e.preventDefault();
        const message = this.chatInput.value.trim();
        
        if (message) {
            this.addChatMessage('user', message);
            this.chatInput.value = '';
            
            // Show typing indicator
            const typingIndicator = this.showTypingIndicator();
            
            // Process the message and get response
            const response = await this.processUserInput(message);
            
            // Remove typing indicator and show response
            this.chatMessages.removeChild(typingIndicator);
            this.addChatMessage('assistant', response.message);
            
            // Add quick replies if any
            if (response.quickReplies) {
                this.addQuickReplies(response.quickReplies);
            }
        }
    }
    
    showTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'flex justify-start mb-3 typing-indicator';
        typingIndicator.innerHTML = `
            <div class="bg-gray-100 text-gray-800 rounded-lg py-2 px-4">
                <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <div class="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingIndicator);
        return typingIndicator;
    }
    
    async processUserInput(message) {
        const lowerMessage = message.toLowerCase();
        let response = { message: '', quickReplies: [] };
        
        // Enhanced intent matching
        if (lowerMessage.includes('fill') || lowerMessage.includes('complete')) {
            response.message = 'I can help pre-fill the form for you. Which form would you like to work on?';
            response.quickReplies = ['DME Kit', 'Provider Onboarding', 'Insurance Verification', 'Order Form'];
        } else if (lowerMessage.includes('dme') || lowerMessage.includes('kit')) {
            response.message = 'I can help you with the DME Kit Sign-up form. Would you like me to help pre-fill it or explain what information you\'ll need?';
            response.quickReplies = ['Pre-fill form', 'What info is needed?', 'Start fresh'];
        } else if (lowerMessage.includes('insurance') || lowerMessage.includes('verification')) {
            response.message = 'For insurance verification, I can help pre-fill patient information or guide you through each section. What would you prefer?';
            response.quickReplies = ['Pre-fill patient info', 'Guide me through it', 'Start new verification'];
        } else if (lowerMessage.includes('order') || lowerMessage.includes('product')) {
            response.message = 'I can help you place an order quickly. Would you like to see product recommendations or start a new order?';
            response.quickReplies = ['Product recommendations', 'New order', 'Reorder previous'];
        } else if (lowerMessage.includes('previous') || lowerMessage.includes('last')) {
            response.message = 'I can help you reuse information from your previous submissions. Which form would you like to work with?';
            response.quickReplies = ['Previous DME Kit', 'Previous Order', 'Previous Verification'];
        } else {
            response.message = 'I can help save you time by pre-filling forms, providing guidance, or answering questions. What would you like help with?';
            response.quickReplies = ['Fill out a form', 'Get guidance', 'Product info', 'Previous submissions'];
        }
        
        return response;
    }
    
    addChatMessage(sender, message) {
        const messageEl = document.createElement('div');
        messageEl.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`;
        
        messageEl.innerHTML = `
            <div class="${sender === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'} rounded-lg py-2 px-4 max-w-3/4">
                ${message}
            </div>
        `;
        
        this.chatMessages.appendChild(messageEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    addQuickReplies(options) {
        const quickRepliesEl = document.createElement('div');
        quickRepliesEl.className = 'flex flex-wrap gap-2 mb-3';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'bg-gray-200 hover:bg-gray-300 rounded-full px-3 py-1 text-sm transition-colors duration-200';
            button.textContent = option;
            button.addEventListener('click', () => {
                this.chatMessages.removeChild(quickRepliesEl);
                this.chatInput.value = option;
                this.chatForm.dispatchEvent(new Event('submit'));
            });
            quickRepliesEl.appendChild(button);
        });
        
        this.chatMessages.appendChild(quickRepliesEl);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
} 