class EmiratesAppManager {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000/api/apps';
        this.apps = [];
        this.currentApp = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadApps();
    }

    bindEvents() {
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', () => this.searchApps());
        document.getElementById('clearSearchBtn').addEventListener('click', () => this.clearSearch());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadApps());

        // Modal events
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
                this.closeModal('editModal');
            }
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('close')) {
                this.closeModal('deleteModal');
            }
        });

        // Form events
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateApp();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => {
            this.closeModal('editModal');
        });

        document.getElementById('confirmDelete').addEventListener('click', () => {
            this.deleteApp();
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            this.closeModal('deleteModal');
        });

        // Enter key for search
        document.getElementById('searchAppName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchApps();
        });
        document.getElementById('searchOwner').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchApps();
        });
    }

    async loadApps() {
        try {
            this.showLoading(true);
            const response = await fetch(this.apiBaseUrl);
            const result = await response.json();
            
            if (result.success) {
                this.apps = result.data;
                this.renderApps();
                this.showNotification('Apps loaded successfully', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading apps:', error);
            this.showNotification('Failed to load apps', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async searchApps() {
        const appName = document.getElementById('searchAppName').value.trim();
        const owner = document.getElementById('searchOwner').value.trim();
        const isValid = document.getElementById('searchValid').value;

        const params = new URLSearchParams();
        if (appName) params.append('appName', appName);
        if (owner) params.append('appOwner', owner);
        if (isValid) params.append('isValid', isValid);

        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBaseUrl}/search?${params}`);
            const result = await response.json();
            
            if (result.success) {
                this.apps = result.data;
                this.renderApps();
                this.showNotification(`Found ${result.count} apps`, 'info');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error searching apps:', error);
            this.showNotification('Failed to search apps', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    clearSearch() {
        document.getElementById('searchAppName').value = '';
        document.getElementById('searchOwner').value = '';
        document.getElementById('searchValid').value = '';
        this.loadApps();
    }

    renderApps() {
        const tbody = document.getElementById('appsTableBody');
        const appCount = document.getElementById('appCount');
        
        appCount.textContent = `${this.apps.length} app${this.apps.length !== 1 ? 's' : ''}`;

        if (this.apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>No apps found</h3>
                        <p>Try adjusting your search criteria or refresh the data.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.apps.map(app => `
            <tr>
                <td><strong>${app.appName}</strong></td>
                <td>${app.appData.appPath}</td>
                <td>${app.appData.appOwner}</td>
                <td>
                    <span class="status-badge ${app.appData.isValid ? 'status-valid' : 'status-invalid'}">
                        ${app.appData.isValid ? 'Valid' : 'Invalid'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-outline btn-sm" onclick="appManager.editApp('${app.appName}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="appManager.confirmDelete('${app.appName}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    editApp(appName) {
        const app = this.apps.find(a => a.appName === appName);
        if (!app) return;

        this.currentApp = app;
        
        document.getElementById('editAppName').value = app.appName;
        document.getElementById('editAppPath').value = app.appData.appPath;
        document.getElementById('editOwner').value = app.appData.appOwner;
        document.getElementById('editValid').value = app.appData.isValid.toString();
        
        this.openModal('editModal');
    }

    async updateApp() {
        if (!this.currentApp) return;

        const owner = document.getElementById('editOwner').value.trim();
        const isValid = document.getElementById('editValid').value === 'true';

        if (!owner) {
            this.showNotification('Owner is required', 'error');
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBaseUrl}/${this.currentApp.appName}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    appOwner: owner,
                    isValid: isValid
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('App updated successfully', 'success');
                this.closeModal('editModal');
                this.loadApps();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error updating app:', error);
            this.showNotification('Failed to update app', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    confirmDelete(appName) {
        this.currentApp = this.apps.find(a => a.appName === appName);
        if (!this.currentApp) return;

        document.getElementById('deleteAppName').textContent = appName;
        this.openModal('deleteModal');
    }

    async deleteApp() {
        if (!this.currentApp) return;

        try {
            this.showLoading(true);
            const response = await fetch(`${this.apiBaseUrl}/${this.currentApp.appName}`, {
                method: 'DELETE'
            });

            const result = await response.json();
            
            if (result.success) {
                this.showNotification('App deleted successfully', 'success');
                this.closeModal('deleteModal');
                this.loadApps();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error deleting app:', error);
            this.showNotification('Failed to delete app', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    showLoading(show) {
        const container = document.querySelector('.main-content');
        if (show) {
            container.classList.add('loading');
        } else {
            container.classList.remove('loading');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appManager = new EmiratesAppManager();
}); 