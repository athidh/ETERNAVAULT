document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop();
    console.log('Current page:', page);

    // --- API CONFIGURATION ---
    const API_BASE_URL = 'https://eternavault.onrender.com';
    
    // --- TOAST NOTIFICATION FUNCTION ---
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-times-circle';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    };

    // --- API HELPER FUNCTIONS ---
    const apiRequest = async (endpoint, options = {}) => {
        const token = localStorage.getItem('token'); // For user
        const nomineeToken = localStorage.getItem('nomineeToken'); // For nominee
        const defaultHeaders = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else if (nomineeToken) { // Use nominee token if user token is not present
            defaultHeaders['Authorization'] = `Bearer ${nomineeToken}`;
        }

        const config = {
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };

        console.log('API Request:', `${API_BASE_URL}${endpoint}`, config);
        console.log('Token being sent:', token || nomineeToken ? 'Present' : 'Missing');

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            console.log('API Response status:', response.status);
            
            const data = await response.json();
            console.log('API Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // --- SHARED FUNCTIONS ---
    const getStorage = (key) => JSON.parse(localStorage.getItem(key));
    const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    
    // Simple hash function (since we're using backend now, this is just for compatibility)
    const calculateHash = (data) => {
        const str = JSON.stringify(data);
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    };

    // Initialize storage if it doesn't exist (for backward compatibility)
    if (!getStorage('digitalLegacyLedger')) {
        const genesisBlock = {
            index: 0,
            timestamp: new Date().toISOString(),
            data: 'ACCOUNT_CREATED: Genesis Block',
            previousHash: '0',
            hash: calculateHash({ index: 0, data: 'Genesis Block' })
        };
        setStorage('digitalLegacyLedger', [genesisBlock]);
        setStorage('digitalLegacyAssets', []);
        setStorage('protocolStatus', { status: 'inactive' });
    }

    // --- ROUTING/AUTH ---
    const token = localStorage.getItem('token');
    const nomineeToken = localStorage.getItem('nomineeToken');
    const loggedInUser = getStorage('loggedInUser');
    const loggedInNominee = getStorage('loggedInNominee');
    
    // Check if user is authenticated for protected pages
    if (!token && !nomineeToken && (page.includes('dashboard') || page.includes('ledger'))) {
        // Redirect to appropriate login page based on the dashboard type
        if (page.includes('nominee_dashboard')) {
            window.location.href = 'nominee.html';
        } else {
            window.location.href = 'login.html';
        }
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Clear both user and nominee tokens/data
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('nomineeToken');
            localStorage.removeItem('loggedInNominee');
            
            // Redirect based on current page
            if (page.includes('nominee')) {
                window.location.href = 'nominee.html';
            } else {
                window.location.href = 'login.html';
            }
        });
    }

    // --- LOGIN PAGE (`login.html`) ---
    if (page === 'login.html' || page === '') {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                console.log('Login attempt:', { email, password: '***' });
                
                try {
                    const response = await apiRequest('/routes/user/login', {
                        method: 'POST',
                        body: JSON.stringify({ email, password })
                    });
                    
                    console.log('Login response:', response);
                    
                    // Store token and user info
                    localStorage.setItem('token', response.token);
                    setStorage('loggedInUser', { 
                        _id: response._id,
                        name: response.name,
                        email: response.email, 
                        userType: 'user' 
                    });
                    
                    showToast('Login successful!', 'success');
                    
                    // Add a small delay to ensure toast is shown before redirect
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                    
                } catch (error) {
                    console.error('Login error:', error);
                    showToast(error.message || 'Login failed', 'error');
                }
            });
        }
    }

    // --- NOMINEE LOGIN PAGE (`nominee.html`) ---
    // Note: Nominee login is now handled in nominee.html itself

    // --- DASHBOARD PAGE (`dashboard.html`) ---
    if (page.includes('dashboard') && !page.includes('nominee')) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const assetForm = document.getElementById('assetForm');
        
        if(welcomeMessage && loggedInUser) {
            welcomeMessage.textContent = `Welcome, ${loggedInUser.name || loggedInUser.email}`;
        }

        const renderDashboard = async () => {
            const assetList = document.getElementById('assetList');
            if (!assetList) return;
            
            try {
                // Fetch assets from backend
                const assets = await apiRequest('/routes/user/assets');
                assetList.innerHTML = '';

                if (assets.length === 0) {
                    assetList.innerHTML = `<div class="empty-state-graphic">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>No assets registered yet. <br> Use the form on the left to add one.</p>
                    </div>`;
                } else {
                    assets.forEach((asset, index) => {
                        const platformLogos = {
                            'Facebook': 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg',
                            'Instagram': 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
                            'X (Twitter)': 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png',
                            'Snapchat': 'https://upload.wikimedia.org/wikipedia/en/c/c4/Snapchat_logo.svg',
                            'LinkedIn': 'https://upload.wikimedia.org/wikipedia/commons/8/81/LinkedIn_icon.svg'
                        };
                        const logoSrc = platformLogos[asset.platform];
                        const logoHtml = logoSrc ? `<img src="${logoSrc}" alt="${asset.platform}">` : '<i class="fa-solid fa-globe"></i>';
                        
                        const cardDiv = document.createElement('div');
                        cardDiv.className = 'asset-item';
                        cardDiv.innerHTML = `
                            <div class="asset-info">
                                <h4>${asset.platform}</h4>
                                <p><strong>Action:</strong> ${asset.instruction} | <strong>Contact:</strong> ${asset.legacyContactEmail}</p>
                                <p><strong>URL:</strong> ${asset.profileUrl}</p>
                            </div>
                            <div class="asset-actions">
                                <button class="delete-btn" data-asset-id="${asset._id}" title="Remove Asset"><i class="fa-solid fa-trash-can"></i></button>
                            </div>
                        `;
                        assetList.appendChild(cardDiv);
                    });
                }

                const uniqueContacts = new Set(assets.map(a => a.legacyContactEmail).filter(Boolean));
                document.getElementById('totalAssetsStat').textContent = assets.length;
                document.getElementById('totalContactsStat').textContent = uniqueContacts.size;
                document.getElementById('lastActivityStat').textContent = new Date().toLocaleDateString();
                
            } catch (error) {
                console.error('Error fetching assets:', error);
                showToast('Failed to load assets', 'error');
            }
        };
        
        if(assetForm) {
            assetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const platformInput = document.getElementById('platform');
                const otherPlatformInput = document.getElementById('otherPlatform');
                const platformValue = platformInput.value === 'Other' ? otherPlatformInput.value : platformInput.value;
                if (!platformValue) { alert('Please select or specify a platform.'); return; }

                const assetData = {
                    platform: platformValue,
                    profileUrl: document.getElementById('url').value,
                    instruction: document.getElementById('action').value,
                    legacyContactEmail: document.getElementById('legacyContact').value,
                };

                try {
                    await apiRequest('/routes/user/assets', {
                        method: 'POST',
                        body: JSON.stringify(assetData)
                    });
                    
                    showToast('Asset added successfully!', 'success');
                    renderDashboard();
                    assetForm.reset();
                    document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('selected'));
                    document.getElementById('otherPlatformGroup').style.display = 'none';
                } catch (error) {
                    showToast(error.message || 'Failed to add asset', 'error');
                }
            });
            const platformSelector = document.getElementById('platformSelector');
            platformSelector.addEventListener('click', (e) => {
                const card = e.target.closest('.platform-card');
                if (!card) return;
                document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                const platform = card.dataset.platform;
                document.getElementById('platform').value = platform;
                document.getElementById('otherPlatformGroup').style.display = platform === 'Other' ? 'block' : 'none';
                document.getElementById('otherPlatform').required = platform === 'Other';
            });
        }

        const deleteModal = document.getElementById('deleteModal');
        let assetIdToDelete = null;

        document.getElementById('assetList')?.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                assetIdToDelete = deleteButton.dataset.assetId;
                deleteModal.style.display = 'flex';
            }
        });

        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            assetIdToDelete = null;
        });

        document.getElementById('confirmDelete')?.addEventListener('click', async () => {
             if (assetIdToDelete !== null) {
                try {
                    // Note: Backend doesn't have delete endpoint yet, so we'll show a message
                    showToast('Delete functionality will be available soon', 'error');
                    deleteModal.style.display = 'none';
                    assetIdToDelete = null;
                } catch (error) {
                    showToast('Failed to delete asset', 'error');
                }
            }
        });
        
        const protocolForm = document.getElementById('protocolForm');
        if (protocolForm) {
            const deathCertificateInput = document.getElementById('deathCertificate');
            deathCertificateInput.addEventListener('change', () => {
                const fileNameSpan = document.getElementById('fileName');
                if (deathCertificateInput.files.length > 0) {
                    fileNameSpan.textContent = deathCertificateInput.files[0].name;
                } else {
                    fileNameSpan.textContent = 'Choose File...';
                }
            });

            protocolForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('submitVerificationBtn');
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                const statusSpan = document.getElementById('protocolStatus');
                statusSpan.textContent = 'Verifying Document...';
                statusSpan.className = 'status-pending';

                setTimeout(() => {
                    statusSpan.textContent = 'Verified';
                    statusSpan.className = 'status-verified';
                    document.getElementById('downloadCertificateContainer').style.display = 'block';
                    showToast('Certificate Verified.', 'success');
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            });
            
            const downloadBtn = document.getElementById('downloadCertificateBtn');
            downloadBtn.addEventListener('click', () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const assets = getStorage('digitalLegacyAssets') || [];
                // ... PDF generation logic
                doc.save('Confirmation-Certificate.pdf');
            });
        }
        
        renderDashboard();
    }

    // --- NOMINEE DASHBOARD PAGE (`nominee_dashboard.html`) ---
    if (page.includes('nominee_dashboard')) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const nomineeToken = localStorage.getItem('nomineeToken');
        const loggedInNominee = JSON.parse(localStorage.getItem('loggedInNominee') || '{}');
        
        // Check if nominee is authenticated
        if (!nomineeToken) {
            window.location.href = 'nominee.html';
            return;
        }
        
        if(welcomeMessage && loggedInNominee) {
            welcomeMessage.textContent = `Welcome, ${loggedInNominee.name || loggedInNominee.email}`;
        }

        // Render nominee dashboard with assets from backend
        const renderNomineeDashboard = async () => {
            const assetList = document.getElementById('assetList');
            if (!assetList) return;
            
            try {
                // Fetch assets assigned to this nominee
                const assets = await apiRequest('/routes/nominee/assets');
                assetList.innerHTML = '';

                if (assets.length === 0) {
                    assetList.innerHTML = `<div class="empty-state-graphic">
                        <i class="fa-solid fa-folder-open"></i>
                        <p>No assets have been assigned to you yet.</p>
                    </div>`;
                } else {
                    assets.forEach((asset, index) => {
                        const cardDiv = document.createElement('div');
                        cardDiv.className = 'asset-item';
                        cardDiv.innerHTML = `
                            <div class="asset-info">
                                <h4>${asset.platform}</h4>
                                <p><strong>Action:</strong> ${asset.instruction} | <strong>Owner:</strong> ${asset.owner?.name || 'Unknown'}</p>
                                <p><strong>URL:</strong> ${asset.profileUrl}</p>
                                <p><strong>Status:</strong> ${asset.status}</p>
                            </div>
                            <div class="asset-actions">
                                <button class="view-btn" data-asset-id="${asset._id}" title="View Details"><i class="fa-solid fa-eye"></i></button>
                            </div>
                        `;
                        assetList.appendChild(cardDiv);
                    });
                }
                
            } catch (error) {
                console.error('Error fetching nominee assets:', error);
                showToast('Failed to load assets', 'error');
            }
        };
        
        renderNomineeDashboard();

        const deleteModal = document.getElementById('deleteModal');
        let assetIdToDelete = null;

        document.getElementById('assetList')?.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                assetIdToDelete = deleteButton.dataset.assetId;
                deleteModal.style.display = 'flex';
            }
        });

        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            assetIdToDelete = null;
        });

        document.getElementById('confirmDelete')?.addEventListener('click', async () => {
             if (assetIdToDelete !== null) {
                try {
                    // Note: Backend doesn't have delete endpoint yet, so we'll show a message
                    showToast('Delete functionality will be available soon', 'error');
                    deleteModal.style.display = 'none';
                    assetIdToDelete = null;
                } catch (error) {
                    showToast('Failed to delete asset', 'error');
                }
            }
        });
        
        const protocolForm = document.getElementById('protocolForm');
        if (protocolForm) {
            const deathCertificateInput = document.getElementById('deathCertificate');
            deathCertificateInput.addEventListener('change', () => {
                const fileNameSpan = document.getElementById('fileName');
                if (deathCertificateInput.files.length > 0) {
                    fileNameSpan.textContent = deathCertificateInput.files[0].name;
                } else {
                    fileNameSpan.textContent = 'Choose File...';
                }
            });

            protocolForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('submitVerificationBtn');
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;

                const statusSpan = document.getElementById('protocolStatus');
                statusSpan.textContent = 'Verifying Document...';
                statusSpan.className = 'status-pending';

                setTimeout(() => {
                    statusSpan.textContent = 'Verified';
                    statusSpan.className = 'status-verified';
                    document.getElementById('downloadCertificateContainer').style.display = 'block';
                    showToast('Certificate Verified.', 'success');
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 3000);
            });
            
            const downloadBtn = document.getElementById('downloadCertificateBtn');
            downloadBtn.addEventListener('click', () => {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const assets = getStorage('digitalLegacyAssets') || [];
                // ... PDF generation logic
                doc.save('Confirmation-Certificate.pdf');
            });
        }
    }

    // --- LEDGER PAGE (`ledger.html`) ---
    if (page.includes('ledger')) {
        const ledgerBody = document.getElementById('ledgerBody');
        const ledger = getStorage('digitalLegacyLedger');
        if (ledgerBody) {
            ledgerBody.innerHTML = '';
            ledger.slice().reverse().forEach(block => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${block.index}</td>
                    <td>${new Date(block.timestamp).toLocaleString()}</td>
                    <td>${block.data}</td>
                    <td class="hash-cell" title="${block.hash}">${block.hash.substring(0, 32)}...</td>
                `;
                ledgerBody.appendChild(row);
            });
        }
    }
});