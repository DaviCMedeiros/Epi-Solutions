const form = document.getElementById('cadastro-form');
const passwordError = document.getElementById('password-error');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Validação de senha
    if (password !== confirmPassword) {
        passwordError.style.display = 'inline';
        return;
    } else {
        passwordError.style.display = 'none';
    }

    try {
       fetch('/api/cadastrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, email, password })
});


        // Verifica se a resposta é JSON antes de chamar .json()
        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (err) {
            console.error('Resposta não é JSON:', text);
            alert('Ocorreu um erro no servidor.');
            return;
        }

        if (response.ok) {
            alert(data.message);
            form.reset(); // Limpa o formulário após sucesso
        } else {
            alert(data.message || 'Erro ao cadastrar.');
        }
    } catch (err) {
        console.error('Erro ao enviar o formulário:', err);
        alert('Não foi possível conectar ao servidor.');
    }
});
