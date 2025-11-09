import { guidedStudy } from "@/controllers/ai/conversation";
import { createConversation, fetchConversations } from "@/controllers/conversation";
import { verifyToken } from "@/utils/jwt";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

  const guard = verifyToken(authorization?.toString() || "");

  if(!guard.isValid) return res.status(401).json({message: 'Unauthorized', error: true});

  const userId = Number(guard.user.id) || -1

  if(userId === -1) return res.status(401).json({message: 'Unauthorized', error: true});
  
  const subjectId = Number(req.body.subjectId) || -1;
  switch(req.method) {
    case 'GET': {
      const response = await fetchConversations(subjectId);

      return res.status(response?.statusCode).json(response)
    }

    case 'POST': {
      const response = await createConversation(req.body);

      const iaResponse = await guidedStudy(subjectId, userId)

      return res.status(response?.statusCode).json({... iaResponse, data: [response?.data, iaResponse?.data]})
    }

    default: {
      return res.status(405).json({message: 'Method Not Allowed', error: true})
    }
  }
}