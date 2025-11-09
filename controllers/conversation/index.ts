import { Prisma, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const fetchConversations = async (subjectId: number) => {
  try {
    const conversation = await prisma.conversation.findMany({where: { subjectId }});

    if(conversation.length === 0) return {statusCode: 404, message: "Conversa não encontrada", error: true};

    return {statusCode: 200, message: "Conversa encontrada", error: false, data: conversation};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const fetchConversation = async (id: number) => {
  try {
    const conversation = await prisma.conversation.findUnique({where: { id }});

    if(!conversation) return {statusCode: 404, message: "Conversa não encontrada", error: true};

    return {statusCode: 200, message: "Conversa encontrada", error: false, data: conversation};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const createConversation = async (data: Prisma.ConversationModel) => {
  try {
    const conversation = await prisma.conversation.create({ data });

    if(!conversation) return {statusCode: 400, message: "Bad request", error: true};

    return {statusCode: 201, message: "Conversa criada", error: false, data: conversation};

  } catch (error) {
    console.error(error)
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const updateConversation = async (id: number, data: Partial<Prisma.ConversationModel>) => {
  try {
    const conversation = await prisma.conversation.update({where: { id }, data })

    if(!conversation) return {statusCode: 404, message: "Conversa não encontrada", error: true};

    return {statusCode: 200, message: "Conversa atualizada", error: false, data: conversation};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const deleteConversation = async (id: number) => {
  try {
    const conversation = await prisma.conversation.delete({where: { id } })

    if(!conversation) return {statusCode: 404, message: "Assunto não encontrada", error: true};

    return {statusCode: 204, error: false};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}