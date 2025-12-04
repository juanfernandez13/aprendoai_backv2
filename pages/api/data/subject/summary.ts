//gambiarra, talvez tirar depois
import { verifyToken } from "@/utils/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import { guidedStudy } from "@/controllers/ai/conversation";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const guard = verifyToken(authorization?.toString() || "");

  if (!guard.isValid) return res.status(401).json({ message: 'Unauthorized', error: true });

  const userId = Number(guard.user.id);
  const subjectId = Number(req.query.subjectId);

  if (isNaN(subjectId)) return res.status(400).json({ message: 'ID inválido', error: true });

  switch (req.method) {
    case 'POST': {
      const { generatedIA } = req.query;

      if (generatedIA === 'true') {
         const response = await guidedStudy(subjectId, userId);
         return res.status(response?.statusCode || 200).json(response);
      }
      
      return res.status(400).json({message: 'Parâmetro inválido', error: true});
    }

    default:
      return res.status(405).json({message: 'Method Not Allowed', error: true})
  }
}