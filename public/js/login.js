const form = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const API_URL = 'http://localhost:3000/api';

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;

    if (!email || !senha) {
        showError('Preencha todos os campos.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Insira um email válido.');
        return;
    }

    const submitButton = form.querySelector('input[type="submit"]');
    const originalText = submitButton.value;
    submitButton.value = 'Entrando...';
    submitButton.disabled = true;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('user', JSON.stringify(data.usuario));

            showSuccess('Login realizado com sucesso!');
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1200);

        } else {
            showError(data.message || 'Email ou senha incorretos.');
        }

    } catch (err) {
        console.error('Erro:', err);
        showError('Erro de conexão.');
    } finally {
        submitButton.value = originalText;
        submitButton.disabled = false;
    }
});

function showError(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    loginError.style.color = 'red';
    loginError.style.backgroundColor = '#ffe6e6';
    loginError.style.border = '1px solid #ffcccc';
    setTimeout(() => loginError.style.display = 'none', 6000);
}

function showSuccess(message) {
    loginError.textContent = message;
    loginError.style.display = 'block';
    loginError.style.color = 'green';
    loginError.style.backgroundColor = '#e6ffe6';
    loginError.style.border = '1px solid #ccffcc';
}