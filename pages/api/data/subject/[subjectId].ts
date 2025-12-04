import { deleteSubject, fetchSubject, updateSubject } from "@/controllers/subject";
import { verifyToken } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  // DEBUG: Verifique no terminal do 'yarn dev' se essa mensagem aparece
  console.log(`[API Subject] Recebido ${req.method} para ID: ${req.query.subjectId}`);

  const { authorization } = req.headers;
  const guard = verifyToken(authorization?.toString() || "");

  if(!guard.isValid) return res.status(401).json({message: 'Unauthorized', error: true});

  const userId = Number(guard.user.id) || -1;
  const subjectId = Number(req.query.subjectId);

  if(userId === -1) return res.status(401).json({message: 'Unauthorized', error: true});

  switch(req.method) {
    case 'GET': {
      const response = await fetchSubject(subjectId);
      return res.status(response.statusCode).json(response);
    }
    
    case 'PUT': {
      const response = await updateSubject(subjectId, req.body);
      return res.status(response.statusCode).json(response);
    }

    case 'DELETE': {
      const response = await deleteSubject(subjectId);
      return res.status(response.statusCode).json(response);
    }
    
    // Adicione isto para evitar 405 em verificações de rede
    case 'OPTIONS': {
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(200).end();
    }

    default:
      console.log(`[API Subject] Método não suportado: ${req.method}`);
      return res.status(405).json({message: 'Method Not Allowed', error: true});
  }
}