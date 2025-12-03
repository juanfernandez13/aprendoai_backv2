import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { genereteToken } from "@/utils/jwt";
import { UserSerializer } from "@/utils/serializers/userSerializer";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const fetchUser = async (id: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        collection: true
      }
    });

    if(!user) return {statusCode: 404, message: "Usuário não encontrado", error: true};
    
    return {statusCode: 200, message: "Usuário encontrado", error: false, data: user};
  } catch (error) {
    console.error(error)
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const loginUser = async(userData: Partial<Prisma.UserModel>): Promise<any> => {
  try {
    const user = await prisma.user.findUnique({ where: { email: userData.email }, include: {collection: true} });
     if (user) {
      const isPasswordValid = await bcrypt.compare(userData.password || '', user.password);
      if (isPasswordValid) {
        const token = genereteToken(user);
        const userSerialized = UserSerializer(user)
        return { token, data: userSerialized, statusCode: 200 };
      } 
      return { message: "Senha inválida", statusCode: 400, error: false };
    }
    return { message: "User not found", statusCode: 404, error: false };
  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const createUser = async (userData: Prisma.UserModel): Promise<any> => {
  try {
    const cryptPassword = await bcrypt.hash(userData.password, 10);
    const cryptUserData = {...userData, password: cryptPassword}
    const user = await prisma.user.create({data: cryptUserData})
    if (!user) return {statusCode: 400, message: "Bad request", error: true};
    
    const token = genereteToken(user);
    return {statusCode: 201, message: "Conta criada", error: false, token};

  } catch (error) {
    console.error("ERRO DETALHADO PRISMA", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const failedFields = error.meta?.target;
        console.error(`Unique constraint failed on fields: ${failedFields}`);
        return { statusCode: 409, message: 'O e-mail fornecido já está em uso.', error: true };
      }
    }
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const updateUser = async (userData: Partial<Prisma.UserModel>, id: number) => {
  try {
    const user = await prisma.user.update({where: { id }, data: userData})
    if (!user) return {statusCode: 400, message: "Bad request", error: true};
    return {statusCode: 200, message: "Conta atualizada", error: false};

  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}

export const deleteUser = async (id: number) => {
  try {
    const user = await prisma.user.delete({where: { id }})
    if (!user) return {statusCode: 400, message: "Bad request", error: true};

    return {statusCode: 204, error: false};

  } catch (error) {
    return {statusCode: 400, message: "Bad request", error: true};    
  }
}