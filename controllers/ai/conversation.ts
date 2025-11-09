import { GoogleGenAI } from "@google/genai";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const guidedStudy = async (id: number, userId: number) => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

    const conversation = await prisma.subject.findUnique({where: {id}, include: {collection: true}})
    if(conversation?.collection.userId != userId) return {statusCOde: 401, message: 'Unauthorized', error: true};
    const prompt = "";

    const result = await ai.models.generateContent({
    model: "gemini-2.0-flash-001",
    contents: prompt,
  });
}