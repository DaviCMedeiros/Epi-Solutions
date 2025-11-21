const form = document.getElementById('cadastro-form');
const passwordError = document.getElementById('password-error');

// Verificar se os elementos existem antes de adicionar event listeners
if (!form) {
    console.error('Formulário não encontrado!');
}

if (!passwordError) {
    console.error('Elemento de erro de senha não encontrado!');
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Obter valores dos campos
    const nome = document.getElementById('nome')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const senha = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;

    // Verificar se os campos existem
    if (!nome || !email || !senha || !confirmPassword) {
        alert('Por favor, preencha todos os campos.');
        return;
    }

    // Resetar mensagens de erro
    if (passwordError) {
        passwordError.style.display = 'none';
    }

    // Validação de senha
    if (senha !== confirmPassword) {
        if (passwordError) {
            passwordError.style.display = 'inline';
            passwordError.textContent = 'As senhas não coincidem!';
        }
        return;
    }

    // Validação de força da senha
    if (senha.length < 6) {
        if (passwordError) {
            passwordError.style.display = 'inline';
            passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        }
        return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }

    let submitButton;
    let originalText;

    try {
        // Encontrar o botão de submit de forma segura
        submitButton = form.querySelector('button[type="submit"]') || 
                      form.querySelector('input[type="submit"]') || 
                      form.querySelector('.btn-submit') || 
                      form.querySelector('button');
        
        if (submitButton) {
            originalText = submitButton.textContent || submitButton.value || 'Cadastrar';
            submitButton.textContent = 'Cadastrando...';
            submitButton.disabled = true;
        }

        // Fazer a requisição
        const response = await fetch('/api/cadastrar', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ nome, email, senha })
        });

        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            throw new Error(`Resposta não é JSON: ${text}`);
        }

        const data = await response.json();

        if (response.ok) {
            alert(data.message || 'Cadastro realizado com sucesso!');
            form.reset();
            
            // Redirecionar após sucesso
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            const errorMessage = data.message || data.error || 'Erro ao cadastrar.';
            alert(errorMessage);
            
            // Mostrar erro específico de senha se vier do servidor
            if (data.field === 'password' && passwordError) {
                passwordError.style.display = 'inline';
                passwordError.textContent = errorMessage;
            }
        }
    } catch (err) {
        console.error('Erro ao enviar o formulário:', err);
        
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            alert('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
            alert('Erro inesperado. Tente novamente.');
        }
    } finally {
        // Reabilitar o botão independente do resultado
        if (submitButton) {
            if (submitButton.tagName === 'BUTTON') {
                submitButton.textContent = originalText;
            } else if (submitButton.tagName === 'INPUT') {
                submitButton.value = originalText;
            }
            submitButton.disabled = false;
        }
    }
});

// Validação em tempo real da confirmação de senha
const confirmPasswordInput = document.getElementById('confirm-password');
if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
        const senha = document.getElementById('password')?.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (passwordError && confirmPassword && senha !== confirmPassword) {
            passwordError.style.display = 'inline';
            passwordError.textContent = 'As senhas não coincidem!';
        } else if (passwordError) {
            passwordError.style.display = 'none';
        }
    });
}

// Validação em tempo real do campo de senha
const passwordInput = document.getElementById('password');
if (passwordInput) {
    passwordInput.addEventListener('input', () => {
        const senha = passwordInput.value;
        
        if (passwordError && senha && senha.length < 6) {
            passwordError.style.display = 'inline';
            passwordError.textContent = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (passwordError && confirmPasswordInput && confirmPasswordInput.value) {
            // Se já houver confirmação, validar novamente
            confirmPasswordInput.dispatchEvent(new Event('input'));
        } else if (passwordError) {
            passwordError.style.display = 'none';
        }
    });
}

// Verificar quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página de cadastro carregada');
    console.log('Formulário:', document.getElementById('cadastro-form'));
    console.log('Password Error:', document.getElementById('password-error'));
});