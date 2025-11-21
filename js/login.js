const form = document.getElementById('login-form');
const loginError = document.getElementById('login-error');

// Verificar se os elementos existem
if (!form) {
    console.error('Formulário de login não encontrado!');
} else {
    console.log('Formulário de login encontrado!');
}

if (!loginError) {
    console.error('Elemento de erro de login não encontrado!');
} else {
    console.log('Elemento de erro encontrado!');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obter valores dos campos
    const email = document.getElementById('email')?.value.trim();
    const senha = document.getElementById('password')?.value;

    console.log('Tentando login com:', { email, senha });

    // Verificar se os campos existem
    if (!email || !senha) {
        showError('Por favor, preencha todos os campos.');
        return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Por favor, insira um email válido.');
        return;
    }

    let submitButton;
    let originalText;

    try {
        // Encontrar o botão de submit
        submitButton = form.querySelector('input[type="submit"]');
        
        if (submitButton) {
            originalText = submitButton.value || 'Entrar';
            submitButton.value = 'Entrando...';
            submitButton.disabled = true;
        }

        // Fazer a requisição de login
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ email, senha })
        });

        console.log('Resposta do servidor:', response.status);

        const data = await response.json();
        console.log('Dados da resposta:', data);

        if (response.ok && data.success) {
            showSuccess(data.message || 'Login realizado com sucesso!');
            
            // Salvar dados do usuário no localStorage
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('isLoggedIn', 'true');
                console.log('Usuário salvo no localStorage:', data.user);
            }
            
            // Redirecionar após sucesso
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showError(data.message || 'Email ou senha incorretos.');
        }
    } catch (err) {
        console.error('Erro ao fazer login:', err);
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            showError('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
            showError('Erro inesperado. Tente novamente.');
        }
    } finally {
        // Reabilitar o botão
        if (submitButton) {
            submitButton.value = originalText;
            submitButton.disabled = false;
        }
    }
});

// Função para mostrar erro
function showError(message) {
    console.log('Mostrando erro:', message);
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        loginError.style.color = 'red';
        loginError.style.backgroundColor = '#ffe6e6';
        loginError.style.border = '1px solid #ffcccc';
        loginError.style.padding = '10px';
        loginError.style.borderRadius = '5px';
    } else {
        alert('Erro: ' + message);
    }
    
    // Esconder o erro após 5 segundos
    setTimeout(() => {
        if (loginError) {
            loginError.style.display = 'none';
        }
    }, 5000);
}

// Função para mostrar sucesso
function showSuccess(message) {
    console.log('Mostrando sucesso:', message);
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        loginError.style.color = 'green';
        loginError.style.backgroundColor = '#e6ffe6';
        loginError.style.border = '1px solid #ccffcc';
        loginError.style.padding = '10px';
        loginError.style.borderRadius = '5px';
    } else {
        alert('Sucesso: ' + message);
    }
}

// Verificar quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de login carregada');
    console.log('Formulário:', document.getElementById('login-form'));
    console.log('Login Error:', document.getElementById('login-error'));
}); 