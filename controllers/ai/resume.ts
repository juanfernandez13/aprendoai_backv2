import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@/generated/prisma/client";
import { updateSubject } from "../subject";

const prisma = new PrismaClient();

export const iaResume = async (id: number, userId: number): Promise<any> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        const subjectData = await prisma.subject.findUnique({
            where: { id },
            select: {
                name: true,
                resume: true,
                collection: { select: { userId: true } },
                conversation: { 
                    orderBy: { createdAt: 'asc' },
                    select: { text: true, isGenerated: true }
                }
            }
        });

        if (subjectData?.collection.userId !== userId) {
            return { statusCode: 401, message: 'Unauthorized', error: true };
        }
        
        const conversationHistory = subjectData.conversation
            .map(msg => 
                `[${msg.isGenerated ? 'Tutor' : 'Student'}] ${msg.text}`
            )
            .join('\n');
            
        const subjectName = subjectData.name;

        if (conversationHistory.length < 50) {
            return { 
                statusCode: 200, 
                message: "Not enough content in the conversation to generate a summary.", 
                update: false 
            };
        }

        const prompt = `You are an Academic Content Condenser. Your task is to analyze the history of a study conversation between a student and a tutor on the topic: **${subjectName}**.
          Instructions:
          1. **Focus:** Identify and extract the main **key concepts**, **formulas**, **definitions**, and **conclusions** that were discussed or taught.
          2. **Exclude:** Ignore greetings, questions about the student's well-being, encouragement phrases, and irrelevant tangents.
          3. **Format:** The final summary must be between **4 to 6 short paragraphs** or a combination of paragraphs and **bullet points**. Use **Markdown** (like bolding) for clarity and easy reading.
          4. **Tone:** The tone should be **informative** and **direct**, suitable for revision material.

          Conversation History for Analysis:
          --- CONVERSATION START ---
          ${conversationHistory}
          --- CONVERSATION END ---

          Your Summary (ONLY the summary content, no introductions):`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        const updateResume = result?.text?.trim();

        const response = await updateSubject(id, { resume: updateResume });

        return response;
        
    } catch(error) {
        console.error("Error generating IA resume:", error);
        return { statusCode: 500, message: "Internal Server Error", error: true };    
    }
}