import { GoogleGenAI, Type } from "@google/genai";
import { Todo, Category } from "../types";

// Initialize the client securely
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates sub-tasks for a given to-do item.
 */
export const generateSubTodos = async (title: string, description: string = ""): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Break down this task into 3-5 smaller, actionable sub-tasks: Task: "${title}". Context: "${description}".`,
      config: {
        responseMimeType: "application/json",
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

    const json = JSON.parse(response.text || "{\"subtasks\": []}");
    return json.subtasks || [];
  } catch (error) {
    console.error("Gemini Sub-task Error:", error);
    return ["Check requirements", "Draft initial plan", "Execute task"]; // Fallback
  }
};

/**
 * Generates a list of to-dos for a new category based on a description.
 */
export const generateCategoryPlan = async (categoryTitle: string, userDescription: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Create a list of 5 essential to-do items for a project category named "${categoryTitle}". The user describes it as: "${userDescription}".`,
      config: {
        responseMimeType: "application/json",
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

    const json = JSON.parse(response.text || "{\"todos\": []}");
    return json.todos || [];
  } catch (error) {
    console.error("Gemini Category Plan Error:", error);
    return [];
  }
};

/**
 * Chat with the AI about the user's productivity context.
 */
export const chatWithTodoContext = async (
  query: string, 
  allTodos: Todo[], 
  categories: Category[]
): Promise<string> => {
  try {
    // Serialize context for the model
    const contextSummary = allTodos.map(t => 
      `- [${t.completed ? 'X' : ' '}] ${t.title} (Due: ${t.deadline || 'None'}, Time Spent: ${Math.floor(t.timeSpent/60)}m)`
    ).join('\n');

    const categorySummary = categories.map(c => c.title).join(', ');

    const systemInstruction = `You are a helpful productivity assistant. 
    You have access to the user's current tasks and categories. 
    Categories: ${categorySummary}
    Tasks:
    ${contextSummary}
    
    Answer the user's question based on this data. Keep answers concise and motivating.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't analyze your tasks right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};
