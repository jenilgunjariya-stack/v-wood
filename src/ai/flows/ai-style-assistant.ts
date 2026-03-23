'use server';
/**
 * @fileOverview An AI Style Assistant that recommends clock styles based on room descriptions.
 *
 * - aiStyleAssistant - A function that handles the AI style recommendation process.
 * - AIStyleAssistantInput - The input type for the aiStyleAssistant function.
 * - AIStyleAssistantOutput - The return type for the aiStyleAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIStyleAssistantInputSchema = z.object({
  roomDescription: z.string().describe(
    "A natural language description of the user's room style and decor preferences."
  ),
});
export type AIStyleAssistantInput = z.infer<typeof AIStyleAssistantInputSchema>;

const AIStyleAssistantOutputSchema = z.object({
  recommendedStyles: z.array(z.string()).describe(
    "A list of clock styles recommended by the AI based on the room description. Examples: 'Mid-Century Modern', 'Industrial Loft', 'Farmhouse Chic', 'Art Deco'."
  ),
  explanation: z.string().describe(
    "A brief explanation of why these styles were recommended, connecting them to the user's room description."
  ),
});
export type AIStyleAssistantOutput = z.infer<typeof AIStyleAssistantOutputSchema>;

export async function aiStyleAssistant(input: AIStyleAssistantInput): Promise<AIStyleAssistantOutput> {
  return aiStyleAssistantFlow(input);
}

const aiStyleAssistantPrompt = ai.definePrompt({
  name: 'aiStyleAssistantPrompt',
  input: { schema: AIStyleAssistantInputSchema },
  output: { schema: AIStyleAssistantOutputSchema },
  prompt: `You are an AI Style Assistant for a premium clock store named V-WOOD QUARTZ. Your goal is to help users find artisanal wooden clocks that match their interior design preferences.

Based on the following room description, recommend suitable clock styles and provide a brief explanation for your recommendations. Focus on suggesting general styles that complement wooden textures, such as 'Minimalist Wood', 'Rustic Cabin', 'Modern Scandinavian', or 'Industrial Timber'.

Room Description: {{{roomDescription}}}

Example Output:
{
  "recommendedStyles": [
    "Minimalist Wood",
    "Scandinavian"
  ],
  "explanation": "Based on your preference for clean lines and natural light, our minimalist wooden pieces in light oak would perfectly complement your Scandinavian living room."
}

Please provide your recommendations in JSON format as per the output schema.`,
});

const aiStyleAssistantFlow = ai.defineFlow(
  {
    name: 'aiStyleAssistantFlow',
    inputSchema: AIStyleAssistantInputSchema,
    outputSchema: AIStyleAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await aiStyleAssistantPrompt(input);
    return output!;
  }
);
