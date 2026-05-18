import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function aiRoutes(server) {
  server.post('/recommendations', async (request, reply) => {
    const { title, subject, summary, language } = request.body;

    if (!title || !subject) {
      return reply.status(400).send({ error: 'Title and subject are required.' });
    }

    const start = Date.now();

    const langInstruction = language === 'en' 
      ? '\nCRITICAL INSTRUCTION: Generate the ENTIRE response, including content and tags, STRICTLY in English.'
      : '\nINSTRUÇÃO: Gere toda a resposta em Português.';

    const prompt = `
Você deve atuar estritamente como um "Assistente Pedagógico" altamente capacitado e experiente.
Sua missão principal é ajudar o professor a elaborar uma aula mais rica e engajadora. 
Com base no título da aula, na disciplina e no ementa/resumo fornecidos, sua tarefa é:
1. Sugerir conteúdos úteis e inovadores para a aula.
2. Listar tópicos relacionados e complementares que podem enriquecer o aprendizado.
3. Sugerir 3 a 5 tags curtas para categorizar essa aula no sistema.
4. Recomendar recursos de apoio de forma EXTREMAMENTE concisa e direta (apenas 2 livros e 2 links, sem textos explicativos longos e SEM usar formatação markdown como negrito/asteriscos).
5. Se a "Ementa" estiver vazia ou pedir para gerar, crie um resumo/ementa excelente para a aula.
${langInstruction}

Título da Aula: "${title}"
Disciplina: "${subject}"
Ementa: "${summary || '[Vazio - A IA deve gerar a ementa]'}"

Responda OBRIGATORIAMENTE em formato JSON estrito, e APENAS em JSON (sem markdown como \`\`\`json, não inclua nada além do JSON), seguindo estritamente a estrutura abaixo:
{
  "resumo_gerado": "Ementa/Resumo criado pela IA caso não tenha sido fornecido. (Se o usuário forneceu uma ementa, retorne vazio)",
  "sugestoes_conteudo": "Uma breve descrição fluida sugerindo conteúdos complementares...",
  "topicos_relacionados": ["Tópico 1", "Tópico 2", "Tópico 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "recursos_apoio": "Lista muito curta em texto puro (sem negrito ou markdown) contendo apenas o Nome do Livro/Autor ou o Nome do Site/Link."
}
`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const latency = ((Date.now() - start) / 1000).toFixed(1);
      const text = response.text || '';
      
      let parsedResult;
      try {
        // Sometimes the AI might still add markdown, so let's strip it just in case
        const cleanedText = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        parsedResult = JSON.parse(cleanedText);
      } catch (parseError) {
        server.log.error('Failed to parse AI response as JSON', { text });
        throw new Error('Formato de resposta da IA inválido.');
      }

      // Log estruturado conforme solicitado
      // Token usage might be under usageMetadata in @google/genai
      const tokenUsage = response.usageMetadata?.totalTokenCount || 0;
      server.log.info(`[INFO] AI Request: Title="${title}", Discipline="${subject}", TokenUsage=${tokenUsage}, Latency=${latency}s.`);

      return reply.send(parsedResult);
    } catch (error) {
      server.log.error(error);
      return reply.status(500).send({ error: 'Erro ao consultar a IA.' });
    }
  });
}
