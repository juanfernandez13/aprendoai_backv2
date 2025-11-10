import { iaResume } from "@/controllers/ai/resume";
import { verifyToken } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

  const guard = verifyToken(authorization?.toString() || "");

  if(!guard.isValid) return res.status(401).json({message: 'Unauthorized', error: true});

  const userId = Number(guard.user.id) || -1

  if(userId === -1) return res.status(401).json({message: 'Unauthorized', error: true});
  switch(req.method) {

    case 'POST': {
      const subjectId = Number(req.body.subjectId)
      const response = await iaResume( subjectId,userId)

      return res.status(response.statusCode).json(response)
    }
    
    default:
      return res.status(405).json({message: 'Method Not Allowed', error: true})
  }
}