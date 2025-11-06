/**
 * Combines the system prompt, the retrieved study material context, and user query
 * into a single structured message array for the LLM. 
 */

import { generateSystemPrompt } from './system';

/**
 * Builds the structured prompt for the LLM API call.
 */
export function composePrompt(
  retrievedContext: string[],
  userQuery: string
) {
  const systemPrompt = generateSystemPrompt();

  const contextBlock = retrievedContext.length
    ? retrievedContext.join('\n---\n')
    : 'No context retrieved.';

  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: `
        Here is the relevant context to consider:
        ${contextBlock}

        User question:
        ${userQuery}`.trim(),
    },
  ];

  return messages;
}