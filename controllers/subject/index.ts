import { Prisma, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const fetchSubjects = async (collectionId: number) => {
  try {
    const subjects = await prisma.subject.findMany({where: { collectionId }});

    if(subjects.length === 0) return {statusCode: 404, message: "Assuntos não encontrados", error: true};

    return {statusCode: 200, message: "Assuntos encontrados", error: false, data: subjects};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const fetchSubject = async (id: number) => {
  try {
    const subject = await prisma.subject.findUnique({where: { id }, include: {conversation: true, question: true}});

    if(!subject) return {statusCode: 404, message: "Assunto não encontrado", error: true};

    return {statusCode: 200, message: "Assunto encontrado", error: false, data: subject};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const createSubject = async (data: Prisma.SubjectModel) => {
  try {
    const subject = await prisma.subject.create({ data });

    if(!subject) return {statusCode: 400, message: "Bad request", error: true};

    return {statusCode: 201, message: "Assunto criado", error: false, data: subject};

  } catch (error) {
    console.error(error)
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const updateSubject = async (id: number, data: Partial<Prisma.SubjectModel>) => {
  try {
    const subject = await prisma.subject.update({where: { id }, data })

    if(!subject) return {statusCode: 404, message: "Assunto não encontrada", error: true};

    return {statusCode: 200, message: "Assunto atualizada", error: false, data: subject};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const deleteSubject = async (id: number) => {
  try {
    const subject = await prisma.subject.delete({where: { id } })

    if(!subject) return {statusCode: 404, message: "Assunto não encontrada", error: true};

    return {statusCode: 204, error: false};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}