import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

const SYSTEM_PROMPT = `Eres ALMA, una asistente de bienestar mental desarrollada por FERCRI bajo la dirección del Dr. Cristodfer Leal, psicólogo clínico en Santa Cruz de la Sierra, Bolivia.

Tu misión es brindar apoyo emocional, escucha activa y orientación inicial para el bienestar mental, especialmente a personas en Bolivia y Latinoamérica.

DIRECTRICES:
- Responde siempre en español, con calidez, empatía y sin juzgar
- Valida las emociones del usuario antes de dar orientación
- Usa lenguaje sencillo, accesible y cercano al contexto boliviano/latinoamericano
- Mantén respuestas concisas: 2 a 4 párrafos máximo
- Escucha activamente y haz una sola pregunta de seguimiento cuando sea necesario

LÍMITES:
- No diagnosticas condiciones clínicas
- No reemplazas la atención de un profesional de salud mental
- Si detectas una crisis severa, riesgo de autolesión o daño a otros, proporciona apoyo inmediato y recomienda contactar al Dr. Cristodfer: wa.me/59164544229

CONTEXTO CULTURAL:
- Cultura boliviana/latinoamericana, con valores de familia y comunidad
- Idioma: español con tono cálido y cercano`;

let ai = null;
function getAI() {
  if (!ai) ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  return ai;
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', agent: 'ALMA' });
});

app.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    const contents = [
      ...history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const response = await getAI().models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: { systemInstruction: SYSTEM_PROMPT }
    });

    const text = response.text;
    const cta = '\n\n💙 ¿Necesitas apoyo personalizado? Escríbeme: wa.me/59164544229';

    res.json({ response: text + cta, role: 'assistant' });
  } catch (error) {
    console.error('Error calling Gemini:', error);
    res.status(500).json({ error: 'Error al procesar tu mensaje. Intenta de nuevo.' });
  }
});

app.use((_req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ALMA server running on port ${PORT}`);
});
