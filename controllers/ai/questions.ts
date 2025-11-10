import { GoogleGenAI, Schema, Type } from "@google/genai";
import { PrismaClient } from "@/generated/prisma/client";
import { createQuestion } from "../questions";

const prisma = new PrismaClient();

export const iaQuestions = async (id: number, userId: number, count: number = 5, itemCount: number = 4): Promise<any> => {
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
        const subjectResume = subjectData.resume;

        const contentToAnalyze = subjectResume && subjectResume.length > 0
            ? `MAIN SUMMARY:\n${subjectResume}\n\nOR CONVERSATION HISTORY:\n${conversationHistory}`
            : `CONVERSATION HISTORY:\n${conversationHistory}`;

        if (contentToAnalyze.length < 100) {
            return { 
                statusCode: 200, 
                message: "Insufficient content to generate questions.", 
                questionsGenerated: 0 
            };
        }

        const QuestionItemSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                text: {
                    type: Type.STRING,
                    description: "The text of the multiple-choice option.",
                },
                isCorrect: {
                    type: Type.BOOLEAN,
                    description: "True if this is the correct answer, False otherwise.",
                },
            },
            required: ["text", "isCorrect"],
        };

        const QuestionSchema: Schema = {
            type: Type.OBJECT,
            properties: {
                questions: {
                    type: Type.ARRAY,
                    description: `A list of the requested ${count} multiple-choice questions.`,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: {
                                type: Type.STRING,
                                description: "The text of the main question.",
                            },
                            items: {
                                type: Type.ARRAY,
                                description: `A list of exactly ${itemCount} options for the multiple-choice question. Exactly one item must have isCorrect: true.`,
                                items: QuestionItemSchema,
                                minItems: itemCount.toString(),
                                maxItems: itemCount.toString(),
                            },
                        },
                        required: ["text", "items"],
                    },
                    minItems: "1",
                },
            },
            required: ["questions"],
        };


        const prompt = `You are an Academic Assessment Creator.
        
        Topic: ${subjectName}
        
        Instructions:
        1. Generate **${count} multiple-choice questions** based on the content provided below.
        2. Each question must have **exactly ${itemCount} options** ('items').
        3. For each question, **only one option** must have 'isCorrect: true'.
        4. The goal of the questions is to test comprehension and retention of the discussed concepts.
        5. Provide the output strictly in the JSON format defined by the Schema.
        
        Content for Analysis:
        --- CONTENT START ---
        ${contentToAnalyze}
        --- CONTENT END ---
        
        Generate the JSON with the questions:`;

        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: QuestionSchema,
                temperature: 0.3,
            }
        });

        const questionsJsonString = result?.text?.trim() || "";
        
        if (!questionsJsonString) {
            console.error("Gemini returned an empty response text.");
            return { 
                statusCode: 500, 
                message: "AI failed to generate structured content (empty response).", 
                questionsGenerated: 0 
            };
        }

        let questionsObject;
        try {
            questionsObject = JSON.parse(questionsJsonString) as { questions: Array<{ text: string, items: Array<{ text: string, isCorrect: boolean }> }> };
        } catch (jsonError) {
            console.error("JSON Parsing failed! Raw AI Text:", questionsJsonString);
            console.error("JSON Error:", jsonError);
            return {
                statusCode: 500,
                message: "Internal Error: Failed to parse AI response into JSON.",
                error: true
            };
        }

        const createdQuestions = [];

        for (const q of questionsObject.questions) {
            const questionData = {
                subjectId: id,
                text: q.text,
                items: JSON.stringify(q.items),
            };
            const newQuestion = await createQuestion(questionData as any);
            createdQuestions.push(newQuestion);
        }

        return { 
            statusCode: 200, 
            message: `${createdQuestions.length} questions generated and saved successfully.`,
            questions: createdQuestions
        };

    } catch(error) {
        console.error("FATAL ERROR in iaQuestions (Connection/Prisma/Unknown):", error); 
        return { statusCode: 500, message: "Internal Server Error", error: true };    
    }
}