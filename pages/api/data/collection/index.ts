import { createCollection, fetchCollections } from "@/controllers/collection";
import { verifyToken } from "@/utils/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, 
  },
};

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {

  const { authorization } = req.headers;
  const guard = verifyToken(authorization?.toString() || "");

  if (!guard.isValid) return res.status(401).json({ message: 'Unauthorized', error: true });

  const userId = Number(guard.user.id) || -1;

  if (userId === -1) return res.status(401).json({ message: 'Unauthorized', error: true });

  switch (req.method) {
    case 'GET': {
      const response = await fetchCollections(Number(userId));
      return res.status(response?.statusCode).json(response);
    }

    case 'POST': {
      const form = formidable({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // Limite de 10MB
      });

      const data: any = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) return reject(err);
          resolve({ fields, files });
        });
      });

      try {

        const name = Array.isArray(data.fields.name) ? data.fields.name[0] : data.fields.name;
        
        let imageBase64 = null;

        const file = data.files.file?.[0] || data.files.file;
        
        if (file) {
          const fileData = fs.readFileSync(file.filepath);
          imageBase64 = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        }

        const collectionData = {
          name: name,
          userId: userId,
          image: imageBase64, 
        };

        const response = await createCollection(collectionData);
        return res.status(response?.statusCode || 201).json(response);

      } catch (error) {
        console.error("Erro no upload:", error);
        return res.status(500).json({ message: 'Erro ao processar upload', error: true });
      }
    }

    default: {
      return res.status(405).json({ message: 'Method Not Allowed', error: true });
    }
  }
}