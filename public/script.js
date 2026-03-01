let currentUser = JSON.parse(localStorage.getItem('user'));

window.onload = () => { if (currentUser) showMainScreen(); };

function toggleAuth(type) {
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('tab-signup').classList.remove('active');
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('signup-form').classList.remove('active');
    document.getElementById(`tab-${type}`).classList.add('active');
    document.getElementById(`${type}-form`).classList.add('active');
}

document.getElementById('login-form').onsubmit = async (e) => {
    e.preventDefault();
    const data = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };
    const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const result = await res.json();
    if (result.success) { currentUser = result.user; localStorage.setItem('user', JSON.stringify(currentUser)); showMainScreen(); } 
    else alert(result.error);
};

document.getElementById('signup-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', document.getElementById('signup-username').value);
    formData.append('email', document.getElementById('signup-email').value);
    formData.append('password', document.getElementById('signup-password').value);
    const avatarFile = document.getElementById('signup-avatar').files[0];
    if (avatarFile) formData.append('avatar', avatarFile);

    const res = await fetch('/api/signup', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.success) { currentUser = result.user; localStorage.setItem('user', JSON.stringify(currentUser)); showMainScreen(); } 
    else alert(result.error);
};

// نوافذ الاسترجاع
function openRecoverModal() { document.getElementById('recover-modal').classList.remove('hidden'); }
function closeRecoverModal() { 
    document.getElementById('recover-modal').classList.add('hidden'); 
    document.getElementById('recover-message').style.display = 'none';
}

document.getElementById('recover-form').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('recover-email').value;
    const res = await fetch('/api/recover', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const result = await res.json();
    const msgBox = document.getElementById('recover-message');
    msgBox.style.display = 'block';
    if (result.success) { msgBox.style.color = '#00ffcc'; msgBox.innerText = result.message; } 
    else { msgBox.style.color = '#ff4444'; msgBox.innerText = result.error; }
};

function showMainScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.remove('hidden');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('current-username').innerText = currentUser.username;
    document.getElementById('current-user-avatar').src = currentUser.avatar || 'https://via.placeholder.com/45';
    loadPosts();
}

function logout() { localStorage.removeItem('user'); currentUser = null; location.reload(); }
function openModal() { document.getElementById('post-modal').classList.remove('hidden'); }
function closeModal() { document.getElementById('post-modal').classList.add('hidden'); }

document.getElementById('post-form').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', currentUser.username);
    formData.append('itemName', document.getElementById('item-name').value);
    formData.append('wantedName', document.getElementById('wanted-name').value);
    formData.append('tiktokLink', document.getElementById('tiktok-link').value);
    formData.append('itemImage', document.getElementById('item-image').files[0]);
    formData.append('wantedImage', document.getElementById('wanted-image').files[0]);

    const res = await fetch('/api/posts', { method: 'POST', body: formData });
    const result = await res.json();
    if (result.success) { closeModal(); document.getElementById('post-form').reset(); loadPosts(); }
};

async function loadPosts() {
    const res = await fetch('/api/posts');
    const posts = await res.json();
    const container = document.getElementById('posts-container');
    container.innerHTML = '';
    
    posts.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'post-card';
        // جعل ظهور البطاقات متتابعاً (تأخير للأنيميشن)
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
            <div class="user-info" style="margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">
                <span style="color:#00ffcc; font-weight:bold;">@${post.username}</span>
            </div>
            <div class="trade-images">
                <div class="trade-side">
                    <img src="${post.itemImage}" alt="${post.itemName}">
                    <p>${post.itemName}</p>
                </div>
                <i class="fas fa-exchange-alt trade-icon"></i>
                <div class="trade-side">
                    <img src="${post.wantedImage}" alt="${post.wantedName}">
                    <p>${post.wantedName}</p>
                </div>
            </div>
            <div class="post-footer">
                للتواصل للتبادل ﴿ <a href="${post.tiktokLink}" target="_blank" class="tiktok-btn"><i class="fab fa-tiktok"></i></a> ﴾
            </div>
        `;
        container.appendChild(card);
    });
}
