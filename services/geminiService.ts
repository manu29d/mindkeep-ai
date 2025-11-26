import { Todo, Category } from "../types";

const post = async (body: any) => {
  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('geminiApiKey') : null;
  const payload = { ...body, apiKey };

  const resp = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Gemini proxy error: ${resp.status} ${text}`);
  }
  return resp.json();
};

export const generateSubTodos = async (title: string, description: string = ""): Promise<string[]> => {
  try {
    const json = await post({ action: 'generateSubTodos', title, description });
    return json.subtasks || [];
  } catch (error) {
    console.error('Gemini Sub-task Error:', error);
    return ['Check requirements', 'Draft initial plan', 'Execute task'];
  }
};

export const generateCategoryPlan = async (categoryTitle: string, userDescription: string): Promise<{title: string, description: string}[]> => {
  try {
    const json = await post({ action: 'generateCategoryPlan', categoryTitle, userDescription });
    return json.todos || [];
  } catch (error) {
    console.error('Gemini Category Plan Error:', error);
    return [];
  }
};

export const chatWithTodoContext = async (
  query: string,
  allTodos: Todo[],
  categories: Category[]
): Promise<string> => {
  try {
    const json = await post({ action: 'chat', query, allTodos, categories });
    return json.text || "I couldn't analyze your tasks right now.";
  } catch (error) {
    console.error('Gemini Chat Error:', error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};
