import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { SubscriptionTier } from "@prisma/client";
import { prisma } from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  // Tier Check: AI features are Premium+
  if (session.user.tier === SubscriptionTier.FREE) {
    return res.status(403).json({ error: "Upgrade to Premium to use AI features" });
  }

  const { action, apiKey: userApiKey } = req.body || {};
  
  const apiKey = userApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY;
  
  if (!apiKey) {
    console.warn('No Gemini API key found.');
    return res.status(500).json({ error: "AI service configuration error" });
  }

  const ai = new GoogleGenAI({ apiKey });

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
      // Enterprise only
      if (session.user.tier !== SubscriptionTier.ENTERPRISE) {
         return res.status(403).json({ error: "Upgrade to Enterprise for AI Planning" });
      }

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
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const json = JSON.parse(response.text || '{"todos": []}');
      return res.status(200).json({ todos: json.todos || [] });
    }

    if (action === 'chat') {
      const { message } = req.body;
      
      // Fetch context: User's active todos
      const todos = await prisma.todo.findMany({
        where: { ownerId: session.user.id, completed: false },
        select: { title: true, deadline: true, category: { select: { title: true } } }
      });
      
      const context = JSON.stringify(todos);
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a productivity assistant. Here is the user's current todo list: ${context}. User asks: "${message}". Answer briefly and helpfully.`
      });
      
      return res.status(200).json({ response: response.text });
    }

    return res.status(400).json({ error: "Unknown action" });

  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
