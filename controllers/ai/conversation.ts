import { GoogleGenAI } from "@google/genai";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { createConversation } from "../conversation";

const prisma = new PrismaClient();

export const guidedStudy = async (id: number, userId: number): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

      const conversation = await prisma.subject.findUnique({where: {id}, select: {collection: true, conversation: true}})
      if(conversation?.collection.userId != userId) return {statusCOde: 401, message: 'Unauthorized', error: true};
      const prompt = "";

      // const result = await ai.models.generateContent({
      //   model: "gemini-2.0-flash-001",
      //   contents: prompt,
      // });
    const iaConversation = {text: "Trancar o curso é a solução", isGenerated: true, subjectId: id} as any;
    const conversation2 = await createConversation(iaConversation)

    return conversation2
  } catch(error) {
    return {statusCode: 500, message: "Internal Server Error", error: true};    
  }
}