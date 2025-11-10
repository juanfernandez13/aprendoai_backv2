import { GoogleGenAI } from "@google/genai";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { updateSubject } from "../subject";
import { createQuestion, updateQuestion } from "../questions";

const prisma = new PrismaClient();

export const iaQuestions = async (id: number, userId: number): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

      const conversation = await prisma.subject.findUnique({where: {id}, select: {resume: true,collection: true, conversation: true}})
      if(conversation?.collection.userId != userId) return {statusCOde: 401, message: 'Unauthorized', error: true};
      const prompt = "";

      // const result = await ai.models.generateContent({
      //   model: "gemini-2.0-flash-001",
      //   contents: prompt,
      // });

      const response = await createQuestion({subjectId: id, text: "Uma pergunta aqui", items: "Um json"} as any)

      return response;
  } catch(error) {
    return {statusCode: 500, message: "Internal Server Error", error: true};    
  }
}