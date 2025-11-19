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

    // ELEMENTOS DE TROCA DE TELA
    const linkSobreNos = document.getElementById('link-sobre-nos'); // O link 'i' no header
    const aboutSection = document.getElementById('about-section'); // A nova seção de descrição
    const btnVoltarPrincipal = document.getElementById('btn-voltar-principal'); // O botão de voltar

    // ----------------------------------------------------
    // NOVO: Elementos do Modal de Conta
    // ----------------------------------------------------
    const linkConta = document.getElementById('link-conta');
    const accountModal = document.getElementById('account-modal');
    const closeAccountModal = document.getElementById('close-account-modal');
    const userNameInput = document.getElementById('user-name');
    const userDescriptionTextarea = document.getElementById('user-description');
    const saveAccountBtn = document.getElementById('save-account-btn');


    // --- Lógica de Troca de Seções (Menu Principal <-> Descrição Pessoal) ---

    // Função para mostrar a seção "Sobre Nós"
    const showAbout = (e) => {
        e.preventDefault();
        mainContentWrapper.classList.add('hidden');
        aboutSection.classList.remove('hidden');
        chatModal.classList.remove('visible');
        accountModal.classList.remove('visible'); // Fecha modal de conta
    };

    // Função para mostrar o menu principal
    const showMain = (e) => {
        e.preventDefault();
        aboutSection.classList.add('hidden');
        mainContentWrapper.classList.remove('hidden');
    };

    linkSobreNos.addEventListener('click', showAbout);
    btnVoltarPrincipal.addEventListener('click', showMain);

    // -------------------------
    // Lógica da Animação de Intro
    // -------------------------
    setTimeout(() => {
        intro.classList.add('hidden');
        mainContentWrapper.classList.add('loaded');

        setTimeout(() => {
            intro.style.display = 'none';
        }, 500);
    }, introDuration);

    // -------------------------
    // Lógica dos Botões e Modal de CHAT
    // -------------------------

    // Ação: Botão Inicial (Expande as opções)
    btnConversarAgora.addEventListener('click', () => {
        btnConversarAgora.classList.add('hidden');
        optionsContainer.classList.remove('hidden');
        optionsContainer.classList.add('visible');
    });

    // Ação: Conversar Diretamente (Site - ABRE O MODAL)
    btnChatDireto.addEventListener('click', () => {
        accountModal.classList.remove('visible'); // Garante que o modal de conta esteja fechado
        chatModal.classList.add('visible');
    });

    // Ação: Fechar o modal de CHAT clicando no X
    closeChatModal.addEventListener('click', () => {
        chatModal.classList.remove('visible');
    });

    // ----------------------------------------------------
    // Lógica do Modal de Conta (Perfil/Memória)
    // ----------------------------------------------------

    // Função para carregar os dados salvos do localStorage
    const loadAccountData = () => {
        const name = localStorage.getItem('nazunaUserName') || '';
        const description = localStorage.getItem('nazunaUserDescription') || '';
        userNameInput.value = name;
        userDescriptionTextarea.value = description;
    };

    // Função para salvar os dados no localStorage
    const saveAccountData = () => {
        localStorage.setItem('nazunaUserName', userNameInput.value.trim());
        localStorage.setItem('nazunaUserDescription', userDescriptionTextarea.value.trim());
        alert('Configurações de conta salvas! A Nazuna agora tem sua memória.');
        accountModal.classList.remove('visible');
    };

    // Ação: Abrir o Modal de Conta
    linkConta.addEventListener('click', (e) => {
        e.preventDefault();
        loadAccountData(); // Carrega antes de abrir

        // Garante que os outros modals/seções estejam limpos
        chatModal.classList.remove('visible');
        aboutSection.classList.add('hidden');
        mainContentWrapper.classList.remove('hidden');

        accountModal.classList.add('visible');
    });

    // Ação: Fechar o Modal de Conta clicando no X
    closeAccountModal.addEventListener('click', () => {
        accountModal.classList.remove('visible');
    });

    // Ação: Botão Salvar
    saveAccountBtn.addEventListener('click', saveAccountData);

    // ----------------------------------------------------
    // Ação: Fechar Modals clicando fora
    // ----------------------------------------------------
    window.addEventListener('click', (event) => {
        if (event.target === chatModal) {
            chatModal.classList.remove('visible');
        }
        if (event.target === accountModal) {
            accountModal.classList.remove('visible');
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
        iaDiv.className = 'ia-message ia-typing';
        iaDiv.textContent = '🐍 Nazuna está refletindo...';
        chatDisplay.appendChild(iaDiv);

        // Rola para o final
        chatDisplay.scrollTop = chatDisplay.scrollHeight;

        // Gera/pega o ID da sessão
        let sessionId = localStorage.getItem('nazunaSessionId');
        if (!sessionId) {
            sessionId = 'web-' + Date.now();
            localStorage.setItem('nazunaSessionId', sessionId);
        }

        // NOVO: Pega os dados de perfil para enviar ao backend
        const userProfile = {
            name: localStorage.getItem('nazunaUserName') || '',
            description: localStorage.getItem('nazunaUserDescription') || ''
        };

        // **MUITO IMPORTANTE:** TROQUE ESTA URL PELA URL REAL DO SEU BACKEND
        const backendUrl = 'https://br2.bronxyshost.com:4175/api/chat-nazuna';

        fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mensagemUsuario: messageText,
                sessaoId: sessionId,
                // NOVO: Envia os dados de perfil
                perfilUsuario: userProfile
            })
        })
            .then(response => {
                if (!response.ok) {
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
                iaDiv.classList.add('error');
                iaDiv.classList.remove('ia-typing');

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

    // --- Outros Handlers ---
    // ... (após a declaração de todos os elementos) ...

    // ELEMENTOS DA NOVA SIDEBAR
    const linkPainelChat = document.getElementById('link-painel-chat');
    const chatSidebar = document.getElementById('chat-sidebar');
    const closeChatSidebar = document.getElementById('close-chat-sidebar');

    // Função para abrir a aba lateral
    const openSidebar = (e) => {
        e.preventDefault();
        // Garante que o modal de chat e o de conta estejam fechados
        chatModal.classList.remove('visible');
        accountModal.classList.remove('visible');
        // Abre a sidebar
        chatSidebar.classList.add('open');
    };

    // Função para fechar a aba lateral
    const closeSidebar = () => {
        chatSidebar.classList.remove('open');
    };

    // Ação: Abrir a aba lateral quando clicar no link "Painel de Chat"
    linkPainelChat.addEventListener('click', openSidebar);

    // Ação: Fechar a aba lateral quando clicar no 'X'
    closeChatSidebar.addEventListener('click', closeSidebar);

    // Ação: Fechar a aba lateral clicando fora (melhora a usabilidade)
    window.addEventListener('click', (event) => {
        if (event.target === chatSidebar) {
            closeSidebar();
        }
        if (event.target === chatModal) {
            chatModal.classList.remove('visible');
        }
        if (event.target === accountModal) {
            accountModal.classList.remove('visible');
        }
    });

// ... (Resto do seu script) ...

    linkPainelChat.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Redirecionando para o Painel de Chat (Histórico)...');
    });

});


// --- Outros Handlers (Mantidos) ---
const linkConta = document.getElementById('link-conta');

linkPainelChat.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Redirecionando para o Painel de Chat (Histórico)...');
});

linkConta.addEventListener('click', (e) => {
    e.preventDefault();
    alert('Abrindo modal/página de Configurações de Conta...');
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
