import { createSubject, fetchSubjects } from "@/controllers/subject";
import { verifyToken } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const guard = verifyToken(authorization?.toString() || "");

  if(!guard.isValid) return res.status(401).json({message: 'Unauthorized', error: true});

  const userId = Number(guard.user.id);

  switch(req.method) {

    case 'GET': {
      const collectionId = Number(req.query.collectionId);
      
      if (isNaN(collectionId)) {
        return res.status(400).json({message: 'ID da coleção inválido', error: true});
      }

      const response = await fetchSubjects(collectionId)
      return res.status(response?.statusCode).json(response)
    }

    case 'POST': {
      const response = await createSubject(req.body)
      return res.status(response?.statusCode).json(response)
    }
    
    default:
      return res.status(405).json({message: 'Method Not Allowed', error: true})
  }
}