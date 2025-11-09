import { Prisma, PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export const fetchCollections = async (userId: number) => {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
    });

    if(collections.length === 0) return {statusCode: 404, message: "Coleções não encontradas", error: true};

    return {statusCode: 200, message: "Coleções encontradas", error: false, data: collections};

  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const fetchCollection = async (id: number) => {
  try {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {subject: true}
    });
    console.log(collection)
    if(!collection) return {statusCode: 404, message: "Coleção não encontradas", error: true};

    return {statusCode: 200, message: "Coleção encontradas", error: false, data: collection};

  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const createCollection = async (data: Prisma.CollectionModel) => {
  try {
    const collection = await prisma.collection.create({ data });

    if(!collection) return {statusCode: 400, message: "Bad request", error: true};

    return {statusCode: 201, message: "Coleção criada", error: false, data: collection};

  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const updateCollection = async (id: number, data: Partial<Prisma.CollectionModel>, userId: number) => {
  try {

    const collection = await prisma.collection.update({where: {id, userId}, data })

    if(!collection) return {statusCode: 404, message: "Coleção não encontrada", error: true};

    return {statusCode: 200, message: "Coleção atualizada", error: false, data: collection};
    
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const deleteCollection = async (id: number, userId: number) => {
  try {
    const collection = await prisma.collection.delete({where: { id, userId }})

    if(!collection) return {statusCode: 404, message: "Coleção não encontrada", error: true};

    return {statusCode: 204, error: false};    

  } catch (error) {
    console.log(error)
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

