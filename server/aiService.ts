import fetch from 'node-fetch';

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Using Together AI (free tier with $1 credit)
    this.apiKey = process.env.TOGETHER_API_KEY || '';
    this.baseUrl = 'https://api.together.xyz/v1/chat/completions';
  }

  async generateResponse(messages: Array<{role: string, content: string}>, context?: string): Promise<AIResponse> {
    try {
      // If no API key, use a fallback response
      if (!this.apiKey) {
        return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
      }

      const systemPrompt = `You are a helpful assistant for TestCademy, an online software testing academy. 
      You help students with questions about software testing, course content, enrollment, and general queries.
      Be friendly, professional, and encouraging. If you don't know something specific about our courses, 
      suggest they contact our support team.
      
      ${context ? `Context: ${context}` : ''}`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json() as any;
      
      return {
        content: data.choices[0]?.message?.content || 'Sorry, I could not generate a response.',
        usage: data.usage
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(messages[messages.length - 1]?.content || '');
    }
  }

  private getFallbackResponse(userMessage: string): AIResponse {
    const responses = [
      "Thank you for your message! I'm here to help with questions about our software testing courses. For specific course details or enrollment, please contact our support team.",
      "I'd be happy to assist you with software testing questions! If you need help with course enrollment or have specific questions about our curriculum, feel free to ask.",
      "Welcome to TestCademy! I can help answer questions about software testing concepts, our course offerings, and learning paths. What would you like to know?",
      "Thanks for reaching out! I'm here to support your learning journey in software testing. How can I help you today?"
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      content: randomResponse,
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }

  // Generate course recommendations based on user interests
  async generateCourseRecommendations(interests: string[], currentLevel: string = 'beginner'): Promise<string> {
    const messages = [
      {
        role: 'user',
        content: `I'm interested in: ${interests.join(', ')}. My current level is: ${currentLevel}. 
        Please recommend software testing courses and learning paths that would be suitable for me. 
        Keep the response concise and practical.`
      }
    ];

    return (await this.generateResponse(messages)).content;
  }

  // Generate study tips for specific topics
  async generateStudyTips(topic: string, difficulty: string = 'beginner'): Promise<string> {
    const messages = [
      {
        role: 'user',
        content: `I'm studying ${topic} at ${difficulty} level. Please provide practical study tips and resources to help me learn effectively.`
      }
    ];

    return (await this.generateResponse(messages)).content;
  }

  // Generate quiz questions for a topic
  async generateQuizQuestions(topic: string, difficulty: string = 'beginner', count: number = 5): Promise<Array<{question: string, options: string[], correct: number}>> {
    const messages = [
      {
        role: 'user',
        content: `Generate ${count} multiple choice questions about ${topic} for ${difficulty} level students. 
        Format as JSON with question, options array, and correct answer index (0-based).`
      }
    ];

    try {
      const response = await this.generateResponse(messages);
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing quiz questions:', error);
    }

    // Fallback questions
    return [
      {
        question: `What is the primary goal of ${topic}?`,
        options: ['To find bugs', 'To improve code quality', 'To ensure requirements are met', 'All of the above'],
        correct: 3
      }
    ];
  }
}

export const aiService = new AIService();
