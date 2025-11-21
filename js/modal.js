// Elementos do modal
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelar-aluguel");
const confirmBtn = document.getElementById("confirmar-aluguel");
const quantidadeInput = document.getElementById("quantidade");
const produtoInfo = document.getElementById("produto-info");

// Variáveis para armazenar o produto atual
let produtoAtual = null;

// Adicionar event listeners para todos os botões de alugar
document.addEventListener('DOMContentLoaded', function() {
    const alugarBtns = document.querySelectorAll('.alugar-btn');
    
    alugarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const nome = this.getAttribute('data-nome');
            const estoque = parseInt(this.getAttribute('data-estoque'));
            
            abrirModal({ id, nome, estoque });
        });
    });
});

// Função para abrir o modal
function abrirModal(produto) {
    produtoAtual = produto;
    
    // Atualizar informações no modal
    produtoInfo.textContent = `Produto: ${produto.nome} | Estoque disponível: ${produto.estoque}`;
    
    // Resetar quantidade
    quantidadeInput.value = 1;
    quantidadeInput.max = produto.estoque;
    
    // Abrir modal
    modal.classList.add("open");
}

// Fechar modal
function fecharModal() {
    modal.classList.remove("open");
    produtoAtual = null;
}

// Event listeners para fechar modal
closeBtn.addEventListener("click", fecharModal);
cancelBtn.addEventListener("click", fecharModal);

// Fechar modal clicando fora
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        fecharModal();
    }
});

// Confirmar aluguel
confirmBtn.addEventListener("click", async () => {
    if (!produtoAtual) return;
    
    const quantidade = parseInt(quantidadeInput.value);
    
    if (quantidade < 1 || quantidade > produtoAtual.estoque) {
        alert('Quantidade inválida!');
        return;
    }

    try {
        // Verificar se o usuário está logado
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        const userData = localStorage.getItem('user');
        
        if (!isLoggedIn || !userData) {
            alert('Você precisa estar logado para alugar produtos!');
            window.location.href = '/login';
            return;
        }

        const user = JSON.parse(userData);
        
        // Fazer requisição para alugar o produto
        const response = await fetch('/api/alugar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
            atualizarEstoqueInterface(produtoAtual.id, data.novo_estoque);
            
            fecharModal();
        } else {
            alert(data.message || 'Erro ao alugar produto.');
        }
    } catch (error) {
        console.error('Erro ao alugar produto:', error);
        alert('Erro ao conectar com o servidor.');
    }
});

// Função para atualizar a interface após aluguel
function atualizarEstoqueInterface(idProduto, novoEstoque) {
    // Atualizar no botão
    const btn = document.querySelector(`.alugar-btn[data-id="${idProduto}"]`);
    if (btn) {
        btn.setAttribute('data-estoque', novoEstoque);
        btn.textContent = novoEstoque > 0 ? 'Alugar' : 'Esgotado';
        btn.disabled = novoEstoque === 0;
    }
    
    // Atualizar no texto de estoque
    const estoqueSpan = document.querySelector(`.alugar-btn[data-id="${idProduto}"]`).closest('.product-card').querySelector('.estoque');
    if (estoqueSpan) {
        estoqueSpan.textContent = novoEstoque;
    }
}