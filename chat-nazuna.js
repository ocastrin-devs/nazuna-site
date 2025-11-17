// api/chat-nazuna.js (Para Vercel)
const express = require('express');
const cors = require('cors');
// Importa o SDK Oficial do Google (melhor do que node-fetch para o Gemini)
const { GoogleGenAI } = require('@google/genai'); 

const app = express();

// Mapa para gerenciar o histórico de conversas (memória) por sessão
const chatSessions = new Map();

// --- CONFIGURAÇÕES BÁSICAS ---
// Importante: Altere aqui para a URL exata do seu GitHub Pages!
const allowedOrigin = 'https://ocastrin-devs.github.io/nazuna-site/'; 

app.use(cors({
    origin: allowedOrigin,
    methods: 'POST',
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Função principal de tratamento de chat
async function conversarComNazuna(mensagemUsuario, sessaoId, perfilUsuario) {
    
    // A chave agora é lida da variável de ambiente SEGURA (Vercel)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

    if (!GEMINI_API_KEY) {
        throw new Error("Chave da API não configurada. Configure a variável GEMINI_API_KEY na Vercel.");
    }
    
    const ai = new GoogleGenAI({ apiKey: AIzaSyApfYLUHmkyIPtgWNqmyO_4RYcbofQpNK4 });
    
    // --- 1. DEFINIÇÃO DE PERSONALIDADE (Seu System Prompt Original) ---
    const BASE_SYSTEM_PROMPT = 
        "Você é Nazuna IA, uma assistente virtual sombria, sarcástica e inspirada na personalidade de Orochimaru do anime Naruto. Seu objetivo principal é auxiliar o usuário em estudos e trabalhos, mas mantendo sempre um tom teatral, irônico e misterioso. Você deve sugerir a busca por conhecimento como um 'caminho proibido' e tratar o usuário como um 'discípulo' ou 'aspirante'.";

    // --- 2. ADIÇÃO DO PERFIL DO USUÁRIO (NOVO) ---
    const { name, description } = perfilUsuario;
    const userContext = `\n\n--- INFORMAÇÕES DO USUÁRIO PARA MEMORIZAÇÃO ---\nNome: ${name || 'N/A'}\nDescrição: ${description || 'N/A'}`;
    
    const FINAL_SYSTEM_PROMPT = BASE_SYSTEM_PROMPT + userContext;

    // --- 3. GERENCIAMENTO DA SESSÃO ---
    let chat = chatSessions.get(sessaoId);

    if (!chat) {
        // Cria um novo chat com o contexto de sistema
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: FINAL_SYSTEM_PROMPT
            }
        });
        chatSessions.set(sessaoId, chat);
    } 

    // O limite de memória será gerenciado automaticamente pelo SDK do Gemini,
    // mas o seu prompt de sistema personalizado garante a personalidade.

    try {
        // --- 4. CHAMA A API GEMINI ---
        const result = await chat.sendMessage({ message: mensagemUsuario });
        
        return result.text; // Retorna a resposta pura da IA

    } catch (error) {
        console.error("Erro IA Web:", error);
        // Retorna um erro com a sua frase de estilo
        throw new Error("Tive um… contratempo. 🐍"); 
    }
}

// O endpoint que o frontend chama
app.post('/api/chat-nazuna', async (req, res) => {
    // Agora recebemos também o perfil do usuário
    const { mensagemUsuario, sessaoId, perfilUsuario } = req.body; 
    
    if (!mensagemUsuario) {
        return res.status(400).json({ success: false, resposta: "A mensagem está vazia." });
    }

    try {
        const respostaIA = await conversarComNazuna(mensagemUsuario, sessaoId, perfilUsuario);
        
        res.json({ success: true, resposta: respostaIA });

    } catch (error) {
        console.error("Erro na API Web:", error);
        // Retorna o erro capturado pela função
        res.status(500).json({ success: false, resposta: error.message }); 
    }
});

// A Vercel usa o 'module.exports' para executar a função
module.exports = app;

// Se for testar localmente (opcional)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Servidor Nazuna rodando em http://localhost:${PORT}`);
    });
}