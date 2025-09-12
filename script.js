document.addEventListener('DOMContentLoaded', () => {
    const page = window.location.pathname.split("/").pop();

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

    // --- SHARED FUNCTIONS ---
    const getStorage = (key) => JSON.parse(localStorage.getItem(key));
    const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    const calculateHash = (data) => CryptoJS.SHA256(JSON.stringify(data)).toString();

    // Initialize storage if it doesn't exist
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
    const loggedInUser = getStorage('loggedInUser');
    if (!loggedInUser && (page.includes('dashboard') || page.includes('ledger'))) {
        window.location.href = 'login.html';
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    // --- LOGIN PAGE (`login.html`) ---
    if (page === 'login.html' || page === '') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                setStorage('loggedInUser', { email, userType: 'user' });
                window.location.href = 'dashboard.html';
            });
        }
    }

    // --- NOMINEE LOGIN PAGE (`nominee.html`) ---
    if (page === 'nominee.html') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                setStorage('loggedInUser', { email, userType: 'nominee' });
                window.location.href = 'nominee_dashboard.html';
            });
        }
    }

    // --- DASHBOARD PAGE (`dashboard.html`) ---
    if (page.includes('dashboard') && !page.includes('nominee')) {
        const welcomeMessage = document.getElementById('welcomeMessage');
        const assetForm = document.getElementById('assetForm');
        
        if(welcomeMessage && loggedInUser) {
            welcomeMessage.textContent = `Welcome, ${loggedInUser.email}`;
        }

        const renderDashboard = () => {
            const assets = getStorage('digitalLegacyAssets') || [];
            const ledger = getStorage('digitalLegacyLedger') || [];
            const assetList = document.getElementById('assetList');
            if (!assetList) return;
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
                    cardDiv.className = 'asset-card';
                    cardDiv.innerHTML = `
                        <div class="asset-card-logo">${logoHtml}</div>
                        <div class="asset-card-details">
                            <h4>${asset.platform}</h4>
                            <p><strong>Action:</strong> ${asset.action} | <strong>Contact:</strong> ${asset.legacyContact}</p>
                        </div>
                        <div class="asset-card-actions">
                            <button class="delete-btn" data-index="${index}" title="Remove Asset"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    `;
                    assetList.appendChild(cardDiv);
                });
            }

            const uniqueContacts = new Set(assets.map(a => a.legacyContact).filter(Boolean));
            document.getElementById('totalAssetsStat').textContent = assets.length;
            document.getElementById('totalContactsStat').textContent = uniqueContacts.size;
            const lastActivity = ledger.length > 1 ? new Date(ledger[ledger.length - 1].timestamp).toLocaleDateString() : 'N/A';
            document.getElementById('lastActivityStat').textContent = lastActivity;
        };
        
        if(assetForm) {
            assetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const platformInput = document.getElementById('platform');
                const otherPlatformInput = document.getElementById('otherPlatform');
                const platformValue = platformInput.value === 'Other' ? otherPlatformInput.value : platformInput.value;
                if (!platformValue) { alert('Please select or specify a platform.'); return; }

                const newAsset = {
                    platform: platformValue,
                    url: document.getElementById('url').value,
                    action: document.getElementById('action').value,
                    legacyContact: document.getElementById('legacyContact').value,
                };

                const assets = getStorage('digitalLegacyAssets');
                assets.push(newAsset);
                setStorage('digitalLegacyAssets', assets);
                showToast('Asset added successfully!', 'success');
                renderDashboard();
                assetForm.reset();
                document.querySelectorAll('.platform-card').forEach(c => c.classList.remove('selected'));
                document.getElementById('otherPlatformGroup').style.display = 'none';
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
        let assetIndexToDelete = null;

        document.getElementById('assetList')?.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                assetIndexToDelete = parseInt(deleteButton.dataset.index);
                deleteModal.style.display = 'flex';
            }
        });

        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            assetIndexToDelete = null;
        });

        document.getElementById('confirmDelete')?.addEventListener('click', () => {
             if (assetIndexToDelete !== null) {
                let assets = getStorage('digitalLegacyAssets');
                assets.splice(assetIndexToDelete, 1);
                setStorage('digitalLegacyAssets', assets);
                showToast('Asset removed.', 'danger');
                renderDashboard();
                deleteModal.style.display = 'none';
                assetIndexToDelete = null;
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
        
        if(welcomeMessage && loggedInUser) {
            welcomeMessage.textContent = `Welcome, ${loggedInUser.email}`;
        }

        // The nominee dashboard specific logic would go here,
        // such as displaying nominee-specific assets or information.
        // For now, we'll just render the dashboard structure.
        const assets = getStorage('digitalLegacyAssets') || [];
        const assetList = document.getElementById('assetList');
        if (assetList) {
            if (assets.length === 0) {
                assetList.innerHTML = `<div class="empty-state-graphic">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>No assets have been assigned to you yet.</p>
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
                    cardDiv.className = 'asset-card';
                    cardDiv.innerHTML = `
                        <div class="asset-card-logo">${logoHtml}</div>
                        <div class="asset-card-details">
                            <h4>${asset.platform}</h4>
                            <p><strong>Action:</strong> ${asset.action} | <strong>Contact:</strong> ${asset.legacyContact}</p>
                        </div>
                        <div class="asset-card-actions">
                            <button class="delete-btn" data-index="${index}" title="Remove Asset"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    `;
                    assetList.appendChild(cardDiv);
                });
            }
        }

        const deleteModal = document.getElementById('deleteModal');
        let assetIndexToDelete = null;

        document.getElementById('assetList')?.addEventListener('click', (e) => {
            const deleteButton = e.target.closest('.delete-btn');
            if (deleteButton) {
                assetIndexToDelete = parseInt(deleteButton.dataset.index);
                deleteModal.style.display = 'flex';
            }
        });

        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            deleteModal.style.display = 'none';
            assetIndexToDelete = null;
        });

        document.getElementById('confirmDelete')?.addEventListener('click', () => {
             if (assetIndexToDelete !== null) {
                let assets = getStorage('digitalLegacyAssets');
                assets.splice(assetIndexToDelete, 1);
                setStorage('digitalLegacyAssets', assets);
                showToast('Asset removed.', 'danger');
                document.getElementById('assetList')?.innerHTML = ''; // Clear list after deletion
                document.getElementById('assetList')?.innerHTML = `<div class="empty-state-graphic">
                    <i class="fa-solid fa-folder-open"></i>
                    <p>No assets have been assigned to you yet.</p>
                </div>`;
                assetIndexToDelete = null;
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