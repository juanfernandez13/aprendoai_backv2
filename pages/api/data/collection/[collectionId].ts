import { verifyToken } from "@/utils/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import { createCollection, deleteCollection, fetchCollection, updateCollection } from "@/controllers/collection";

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;

  const guard = verifyToken(authorization?.toString() || "");

  if(!guard.isValid) return res.status(401).json({message: 'Unauthorized', error: true});

  const userId = Number(guard.user.id)
  const collectionId = Number(req.query.collectionId) || -1;

  if(userId === -1) return res.status(401).json({message: 'Unauthorized', error: true});

  switch(req.method) {
    case 'GET': {
      const response = await fetchCollection(collectionId);

      return res.status(response?.statusCode).json(response)
    }

    case 'PUT': {
      const response = await updateCollection(collectionId, req.body, userId);

      return res.status(response?.statusCode).json(response)
    }

    case 'DELETE': {
      const response = await deleteCollection(collectionId, userId);

      return res.status(response?.statusCode).json(response)
    }

    default: {
      return res.status(405).json({message: 'Method Not Allowed', error: true})
    }
  }
}