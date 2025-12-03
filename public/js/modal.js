let produtoAtual = null;

//Pegar só o primeiro nome
function getFirstName(fullName) {
    if (!fullName) return '';
    const names = fullName.trim().split(/\s+/);
    return names[0];
}

// Atualizar navbar caso logado
function updateNavbar() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('user');
    const loginLink = document.getElementById('login-link');
    const userWelcome = document.getElementById('user-welcome');
    const logoutBtn = document.getElementById('logout-btn');
    const loginItem = document.getElementById('login-item');

    if (isLoggedIn === 'true' && userData) {
        const user = JSON.parse(userData);
        const firstName = getFirstName(user.nome);

        if (loginLink) loginLink.style.display = 'none';

        if (userWelcome) {
            userWelcome.textContent = `Olá, ${firstName}`;
            userWelcome.style.display = 'inline';
            userWelcome.style.color = 'rgba(255, 255, 255, 0.747)';
            userWelcome.style.marginRight = '10px';
            userWelcome.style.fontFamily = "'Poppins', sans-serif";
            userWelcome.style.fontSize = "32px";
            userWelcome.style.fontWeight = '700';
        }

        if (logoutBtn) logoutBtn.style.display = 'inline';
        if (loginItem) {
            loginItem.style.display = 'flex';
            loginItem.style.alignItems = 'center';
            loginItem.style.gap = '10px';
        }
    } else {
        if (loginLink) loginLink.style.display = 'inline';
        if (userWelcome) userWelcome.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (loginItem) {
            loginItem.style.display = '';
            loginItem.style.alignItems = '';
            loginItem.style.gap = '';
        }
    }
}

//logout
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Deseja realmente sair?')) {
                localStorage.removeItem('user');
                localStorage.removeItem('isLoggedIn');
                alert('Logout realizado com sucesso!');
                updateNavbar();
                window.location.href = '../index.html'; 
            }
        });
    }
}

// Função para abrir modal
function abrirModal(produto) {
    document.getElementById('modal-image').src = produto.imagem;
    document.getElementById('modal-titulo').textContent = produto.nome;
    document.getElementById('modal-descricao').textContent = produto.descricao;
    document.getElementById('modal-estoque').textContent = produto.estoque;
    document.getElementById('modal-marca').textContent = produto.marca;

    const statusElement = document.getElementById('modal-status');
    const confirmarAluguelBtn = document.getElementById('confirmar-aluguel');
    const quantidadeInput = document.getElementById('quantidade');

    if (produto.estoque > 0) {
        statusElement.textContent = 'Disponível';
        statusElement.style.color = '#28a745';
        confirmarAluguelBtn.disabled = false;
    } else {
        statusElement.textContent = 'Esgotado';
        statusElement.style.color = '#dc3545';
        confirmarAluguelBtn.disabled = true;
    }

    quantidadeInput.max = produto.estoque;
    quantidadeInput.value = 1;

    document.getElementById('modal').classList.add('open');
    produtoAtual = produto;
}

// Função principal de inicialização
document.addEventListener('DOMContentLoaded', function() {
    updateNavbar();
    setupLogout();

    const alugarBtns = document.querySelectorAll('.alugarbtn');
    const modal = document.getElementById('modal');
    const cancelarBtn = document.getElementById('cancelar-aluguel');
    const confirmarBtn = document.getElementById('confirmar-aluguel');

    // Inicializar sistema de modal para todos os botões
    alugarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const produto = {
                id: this.getAttribute('data-id'),
                nome: this.getAttribute('data-nome'),
                imagem: this.getAttribute('data-imagem'),
                descricao: this.getAttribute('data-descricao'),
                estoque: parseInt(this.getAttribute('data-estoque')),
                marca: this.getAttribute('data-marca')
            };

            abrirModal(produto);
        });
    });

    // Fechar modal no botão Cancelar
    cancelarBtn.addEventListener('click', function() {
        modal.classList.remove('open');
        produtoAtual = null;
    });

    // Fechar modal clicando fora
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('open');
            produtoAtual = null;
        }
    });

    // Confirmar aluguel
    confirmarBtn.addEventListener('click', async function() {
        if (!produtoAtual) return;

        const quantidadeInput = document.getElementById('quantidade');
        const quantidade = parseInt(quantidadeInput.value);
        const estoqueAtual = produtoAtual.estoque;

        if (quantidade < 1 || quantidade > estoqueAtual) {
            alert(`Quantidade inválida! Escolha entre 1 e ${estoqueAtual}.`);
            return;
        }

        try {
            const isLoggedIn = localStorage.getItem('isLoggedIn');
            const userData = localStorage.getItem('user');

            if (!isLoggedIn || !userData) {
                alert('Você precisa estar logado para alugar produtos!');
                window.location.href = './login.html';
                return;
            }
            const user = JSON.parse(userData);
            console.log(isLoggedIn)
            // Chamada API para o backend
            const response = await fetch('/api/alugar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_produto: produtoAtual.id,
                    id_usuario: user.id,
                    quantidade: quantidade
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Produto alugado com sucesso!');

                // Atualizar estoque na interface
                const novoEstoque = data.novo_estoque;
                
                // 1. Atualizar a variável global e a UI do modal
                produtoAtual.estoque = novoEstoque;
                document.getElementById('modal-estoque').textContent = novoEstoque;
                
                // 2. Atualizar o botão do produto na lista (atributo data-estoque)
                const btn = document.querySelector(`.alugarbtn[data-id="${produtoAtual.id}"]`);
                if (btn) {
                    btn.setAttribute('data-estoque', novoEstoque);
                    if (novoEstoque === 0) {
                        btn.textContent = 'Esgotado';
                        btn.disabled = true;
                    }
                }

                modal.classList.remove('open');
            } else {
                alert(data.message || 'Erro ao alugar produto.');
            }
        } catch (error) {
            console.error('Erro ao alugar produto:', error);
            alert('Erro ao conectar com o servidor. Verifique a API.');
        }
    });

    // Atualizar também quando houver mudanças no storage (ex: outra aba fez login)
    window.addEventListener('storage', function(e) {
        if (e.key === 'isLoggedIn' || e.key === 'user') {
            updateNavbar();
        }
    });
});