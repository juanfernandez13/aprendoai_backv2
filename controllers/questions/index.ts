import { Prisma, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const fetchQuestions = async (subjectId: number) => {
  try {
    const questions = await prisma.question.findMany({where: { subjectId }});

    if(questions.length === 0) return {statusCode: 404, message: "Questões não encontradas", error: true};

    return {statusCode: 200, message: "Questões encontradas", error: false, data: questions};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const fetchQuestion = async (id: number) => {
  try {
    const question = await prisma.question.findUnique({where: { id }});

    if(!question) return {statusCode: 404, message: "Questão não encontrada", error: true};

    return {statusCode: 200, message: "Questão encontrada", error: false, data: question};
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};
  }  
}

export const createQuestion = async (data: Prisma.QuestionModel) => {
  try {
    const question = await prisma.question.create({ data });

    if(!question) return {statusCode: 400, message: "Bad request", error: true};

    return {statusCode: 201, message: "Questão criada", error: false, data: question};

  } catch (error) {
    console.error(error)
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const updateQuestion = async (id: number, data: Partial<Prisma.QuestionModel>) => {
  try {
    const question = await prisma.question.update({where: { id }, data })

    if(!question) return {statusCode: 404, message: "Questão não encontrada", error: true};

    return {statusCode: 200, message: "Questão atualizada", error: false, data: question};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const deleteQuestion = async (id: number) => {
  try {
    const question = await prisma.question.delete({where: { id } })

    if(!question) return {statusCode: 404, message: "Questão não encontrada", error: true};

    return {statusCode: 204, error: false};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}