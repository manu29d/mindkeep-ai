import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
if (!apiKey) {
  console.warn('No Gemini API key found in environment (GEMINI_API_KEY or API_KEY).');
}

const ai = new GoogleGenAI({ apiKey });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { action } = req.body || {};

  try {
    if (action === 'generateSubTodos') {
      const { title = '', description = '' } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Break down this task into 3-5 smaller, actionable sub-tasks: Task: "${title}". Context: "${description}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subtasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const json = JSON.parse(response.text || '{"subtasks": []}');
      return res.status(200).json({ subtasks: json.subtasks || [] });
    }

    if (action === 'generateCategoryPlan') {
      const { categoryTitle = '', userDescription = '' } = req.body;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Create a list of 5 essential to-do items for a project category named "${categoryTitle}". The user describes it as: "${userDescription}".`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              todos: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });

      const json = JSON.parse(response.text || '{"todos": []}');
      return res.status(200).json({ todos: json.todos || [] });
    }

    if (action === 'chat') {
      const { query = '', allTodos = [], categories = [] } = req.body;
      const contextSummary = allTodos.map((t: any) =>
        `- [${t.completed ? 'X' : ' '}] ${t.title} (Due: ${t.deadline || 'None'}, Time Spent: ${Math.floor((t.timeSpent||0)/60)}m)`
      ).join('\n');

      const categorySummary = categories.map((c: any) => c.title).join(', ');

      const systemInstruction = `You are a helpful productivity assistant.\nCategories: ${categorySummary}\nTasks:\n${contextSummary}\nAnswer the user's question based on this data. Keep answers concise and motivating.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      return res.status(200).json({ text: response.text || '' });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Gemini request failed' });
  }
}
