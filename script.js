document.addEventListener('DOMContentLoaded', () => {

    // -------------------------
    // Elementos da INTRO e Conteúdo
    // -------------------------
    const intro = document.getElementById('page-intro');
    const mainContentWrapper = document.getElementById('main-content-wrapper');
    const introDuration = 3000; // 3 segundos

    // Elementos do Botão Expansível
    const btnConversarAgora = document.getElementById('btn-conversar-agora');
    const optionsContainer = document.getElementById('options-container');
    const btnChatDireto = document.getElementById('btn-chat-direto');

    // Elementos do Modal de Chat
    const chatModal = document.getElementById('chat-modal');
    const closeChatModal = document.getElementById('close-chat-modal');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatDisplay = document.getElementById('chat-display');

    // NOVOS ELEMENTOS NECESSÁRIOS PARA A TROCA DE TELA
    const linkSobreNos = document.getElementById('link-sobre-nos'); // O link 'i' no header
    const aboutSection = document.getElementById('about-section'); // A nova seção de descrição (do HTML)
    const btnVoltarPrincipal = document.getElementById('btn-voltar-principal'); // O botão de voltar (do HTML)

    // --- Lógica de Troca de Seções (Menu Principal <-> Descrição Pessoal) ---

    // Função para mostrar a seção "Sobre Nós" e esconder o principal
    const showAbout = (e) => {
        e.preventDefault();
        // Esconde o conteúdo principal
        mainContentWrapper.classList.add('hidden');
        // Mostra a nova seção
        aboutSection.classList.remove('hidden');
        // Certifica que o modal de chat esteja fechado, se estiver aberto
        chatModal.classList.remove('visible');
    };

    // Função para mostrar o menu principal e esconder "Sobre Nós"
    const showMain = (e) => {
        e.preventDefault();
        // Esconde a seção "Sobre Nós"
        aboutSection.classList.add('hidden');
        // Mostra o conteúdo principal
        mainContentWrapper.classList.remove('hidden');
    };

    // Ação: Abrir a seção de descrição quando clicar no link 'i'
    linkSobreNos.addEventListener('click', showAbout);

    // Ação: Voltar para a principal quando clicar no botão 'Voltar'
    btnVoltarPrincipal.addEventListener('click', showMain);

    // -------------------------
    // Lógica da Animação de Intro (Esta seção agora será executada)
    // -------------------------
    setTimeout(() => {
        intro.classList.add('hidden');
        mainContentWrapper.classList.add('loaded');

        setTimeout(() => {
            intro.style.display = 'none';
        }, 500);
    }, introDuration);

    // -------------------------
    // Lógica dos Botões e Modal
    // -------------------------

    // Ação: Botão Inicial (Expande as opções)
    btnConversarAgora.addEventListener('click', () => {
        btnConversarAgora.classList.add('hidden');
        optionsContainer.classList.remove('hidden');
        optionsContainer.classList.add('visible');
    });

    // Ação: Conversar Diretamente (Site - ABRE O MODAL)
    btnChatDireto.addEventListener('click', () => {
        chatModal.classList.add('visible');
    });

    // Ação: Fechar o modal clicando no X
    closeChatModal.addEventListener('click', () => {
        chatModal.classList.remove('visible');
    });

    // Ação: Fechar o modal clicando fora dele
    window.addEventListener('click', (event) => {
        if (event.target === chatModal) {
            chatModal.classList.remove('visible');
        }
    });

    // --- Lógica do Modal de Descrição ---

    // Ação: Abrir o modal de descrição quando clicar no link 'i'
    linkSobreNos.addEventListener('click', (e) => {
        e.preventDefault();
        descriptionModal.classList.add('visible');
    });

    // Ação: Fechar o modal de descrição clicando no X
    closeDescriptionModal.addEventListener('click', () => {
        descriptionModal.classList.remove('visible');
    });

    // Ação: Fechar o modal de descrição clicando fora (Adaptação da função window.addEventListener)
    window.addEventListener('click', (event) => {
        if (event.target === chatModal) {
            chatModal.classList.remove('visible');
        }
        // Adiciona o novo modal ao handler de fechar ao clicar fora
        if (event.target === descriptionModal) {
            descriptionModal.classList.remove('visible');
        }
    });

    // ----------------------------------------------------
    // Ação: Enviar Mensagem (CHAMADA REAL AO BACKEND NODE.JS)
    // ----------------------------------------------------
    const sendMessage = () => {
        const messageText = chatInput.value.trim();
        if (messageText === '') return;

        // 1. Adiciona a mensagem do usuário na tela
        const userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.textContent = messageText;
        chatDisplay.appendChild(userDiv);

        // 2. Limpa o input
        chatInput.value = '';

        // 3. Adiciona indicador de 'digitando'
        const iaDiv = document.createElement('div');
        iaDiv.className = 'ia-message ia-typing'; // Você pode adicionar um CSS para isso
        iaDiv.textContent = '🐍 Nazuna está refletindo...';
        chatDisplay.appendChild(iaDiv);

        // Rola para o final
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        // Gera/pega o ID da sessão (para o Node.js manter a memória)
        let sessionId = localStorage.getItem('nazunaSessionId');
        if (!sessionId) {
            sessionId = 'web-' + Date.now();
            localStorage.setItem('nazunaSessionId', sessionId);
        }

        // **MUITO IMPORTANTE:** TROQUE ESTA URL PELA URL REAL DO SEU BACKEND
        // Se estiver rodando localmente na porta 3000, mantenha:
        const backendUrl = 'http://localhost:3000/api/chat-nazuna';

        fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensagemUsuario: messageText,
                sessaoId: sessionId
            })
        })
            .then(response => {
                // Verifica se a resposta HTTP é OK
                if (!response.ok) {
                    // Lança um erro para ser pego pelo catch
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // 1. Remove o indicador de "digitando"
                iaDiv.remove();

                // 2. Exibe a resposta real da IA
                const iaResponseDiv = document.createElement('div');
                iaResponseDiv.className = 'ia-message';

                // Verifica se a resposta veio no formato esperado do backend
                const respostaFinal = data.resposta || "Erro: Resposta vazia do backend. 🐍";
                iaResponseDiv.textContent = respostaFinal;

                chatDisplay.appendChild(iaResponseDiv);

                // 3. Rola para o final
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
            })
            .catch(error => {
                console.error("Erro no fetch:", error);
                // 1. Remove o indicador e exibe a mensagem de erro
                iaDiv.textContent = `Erro de conexão: Verifique se o Node.js está rodando. (${error.message})`;
                iaDiv.classList.add('error'); // Você pode adicionar um estilo CSS para 'error'
                iaDiv.classList.remove('ia-typing');

                // Garante que a rolagem vá para o final para mostrar o erro
                chatDisplay.scrollTop = chatDisplay.scrollHeight;
            });
    };

    sendBtn.addEventListener('click', sendMessage);

    // Permite enviar com a tecla ENTER (se o SHIFT não estiver pressionado)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });


    // --- Outros Handlers (Mantidos) ---
    const linkPainelChat = document.getElementById('link-painel-chat');
    const linkConta = document.getElementById('link-conta');

    linkPainelChat.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Redirecionando para o Painel de Chat (Histórico)...');
    });

    linkConta.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Abrindo modal/página de Configurações de Conta...');
    });
});

// --- Lógica do Modal de Descrição ---

// Ação: Abrir o modal de descrição quando clicar no link 'i'
linkSobreNos.addEventListener('click', (e) => {
    e.preventDefault();
    descriptionModal.classList.add('visible');
});

// Ação: Fechar o modal de descrição clicando no X
closeDescriptionModal.addEventListener('click', () => {
    descriptionModal.classList.remove('visible');
});

// Ação: Fechar o modal de descrição clicando fora (Adaptação da função window.addEventListener)
window.addEventListener('click', (event) => {
    if (event.target === chatModal) {
        chatModal.classList.remove('visible');
    }
    // Adiciona o novo modal ao handler de fechar ao clicar fora
});
// ----------------------------------------------------
// REMOVIDO: A função 'conversarComNazuna' e 'memoriasNazunaWeb' foram movidas para o backend.
// ----------------------------------------------------
