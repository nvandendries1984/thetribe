class BotDashboard {
    constructor() {
        this.healthEndpoint = 'http://localhost:15015/health';
        this.refreshInterval = 30000; // 30 seconds
        this.isLoading = false;

        this.init();
    }

    init() {
        this.loadData();
        this.setupAutoRefresh();
        this.setupErrorHandling();
    }

    async loadData() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoadingState();

        try {
            const response = await fetch(this.healthEndpoint);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.updateDashboard(data);
            this.updateStatus('online', 'Bot Online');
            this.hideErrorMessage();

        } catch (error) {
            console.error('Failed to fetch bot data:', error);
            this.updateStatus('offline', 'Connection Error');
            this.showErrorMessage(`Failed to connect to bot: ${error.message}`);
            this.showOfflineData();
        } finally {
            this.isLoading = false;
            this.hideLoadingState();
            this.updateLastUpdated();
        }
    }

    updateDashboard(data) {
        // Bot Status
        this.updateElement('botReady', data.bot?.ready ? 'Online' : 'Offline', data.bot?.ready ? 'online' : 'offline');
        this.updateElement('guildCount', data.bot?.guildCount || '0');
        this.updateElement('userCount', data.bot?.userCount || '0');
        this.updateElement('botPing', data.bot?.ping ? `${data.bot.ping}ms` : 'N/A');

        // System Info
        this.updateElement('uptime', this.formatUptime(data.system?.uptime));
        this.updateElement('memoryUsed', this.formatMemory(data.system?.memory?.used));
        this.updateElement('memoryTotal', this.formatMemory(data.system?.memory?.total));

        // Database Status
        this.updateElement('dbStatus', data.database?.connected ? 'Connected' : 'Disconnected',
                          data.database?.connected ? 'online' : 'offline');
        this.updateElement('dbState', this.formatDbState(data.database?.readyState));
    }

    updateElement(id, value, className = '') {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || 'N/A';
            element.className = `stat-value ${className}`;
        }
    }

    updateStatus(status, text) {
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');

        if (statusDot) {
            statusDot.className = `status-dot ${status}`;
        }

        if (statusText) {
            statusText.textContent = text;
        }
    }

    updateLastUpdated() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            const now = new Date();
            element.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    showLoadingState() {
        this.updateStatus('loading', 'Loading...');
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(element => {
            element.classList.add('loading');
        });
    }

    hideLoadingState() {
        const statValues = document.querySelectorAll('.stat-value');
        statValues.forEach(element => {
            element.classList.remove('loading');
        });
    }

    showOfflineData() {
        this.updateElement('botReady', 'Offline', 'offline');
        this.updateElement('guildCount', '0');
        this.updateElement('userCount', '0');
        this.updateElement('botPing', 'N/A');
        this.updateElement('uptime', 'N/A');
        this.updateElement('memoryUsed', 'N/A');
        this.updateElement('memoryTotal', 'N/A');
        this.updateElement('dbStatus', 'Unknown', 'offline');
        this.updateElement('dbState', 'N/A');
    }

    showErrorMessage(message) {
        let errorElement = document.querySelector('.error-message');

        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            const container = document.querySelector('.container');
            const dashboard = document.querySelector('.dashboard');
            container.insertBefore(errorElement, dashboard);
        }

        errorElement.innerHTML = `
            <strong><i class="fas fa-exclamation-triangle"></i> Connection Error:</strong> ${message}
            <br><small>The dashboard will continue trying to reconnect automatically.</small>
        `;
        errorElement.style.display = 'block';
    }

    hideErrorMessage() {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    setupAutoRefresh() {
        setInterval(() => {
            this.loadData();
        }, this.refreshInterval);
    }

    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('JavaScript error:', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
        });
    }

    formatUptime(seconds) {
        if (!seconds) return 'N/A';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    formatMemory(bytes) {
        if (!bytes) return 'N/A';

        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
    }

    formatDbState(state) {
        const states = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting',
            99: 'Uninitialized'
        };

        return states[state] || 'Unknown';
    }

    // Manual refresh method for future use
    refresh() {
        this.loadData();
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new BotDashboard();

    // Make dashboard available globally for debugging
    window.botDashboard = dashboard;

    // Add refresh button functionality if needed
    const refreshButton = document.getElementById('refreshButton');
    if (refreshButton) {
        refreshButton.addEventListener('click', () => {
            dashboard.refresh();
        });
    }
});

// Handle visibility change to pause/resume updates when tab is not active
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Dashboard paused (tab not active)');
    } else {
        console.log('Dashboard resumed (tab active)');
        // Immediately refresh when tab becomes active
        if (window.botDashboard) {
            window.botDashboard.refresh();
        }
    }
});