import { createSubject, fetchSubjects } from "@/controllers/subject";
import { verifyToken } from "@/utils/jwt";
import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

// 1. Desativa o bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function Handle(req: NextApiRequest, res: NextApiResponse) {
  const { authorization } = req.headers;
  const guard = verifyToken(authorization?.toString() || "");

  if (!guard.isValid) return res.status(401).json({ message: 'Unauthorized', error: true });

  const userId = Number(guard.user.id);

  switch (req.method) {
    case 'GET': {
      const collectionId = Number(req.query.collectionId);
      if (isNaN(collectionId)) {
        return res.status(400).json({ message: 'ID da coleção inválido', error: true });
      }
      const response = await fetchSubjects(collectionId);
      return res.status(response?.statusCode).json(response);
    }

    case 'POST': {
      // 2. Configura Formidable
      const form = formidable({
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
      });

      try {
        const data: any = await new Promise((resolve, reject) => {
          form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
          });
        });

        // Extrai campos
        const name = Array.isArray(data.fields.name) ? data.fields.name[0] : data.fields.name;
        const collectionId = Array.isArray(data.fields.collectionId) ? data.fields.collectionId[0] : data.fields.collectionId;

        let imageBase64 = null;
        
        // Processa imagem
        const file = data.files.file?.[0] || data.files.file;
        if (file) {
          const fileData = fs.readFileSync(file.filepath);
          imageBase64 = `data:${file.mimetype};base64,${fileData.toString('base64')}`;
        }

        const subjectData = {
          name: name,
          collectionId: Number(collectionId),

        };

        const response = await createSubject(subjectData as any);
        
        return res.status(response?.statusCode || 201).json(response);

      } catch (error) {
        console.error("Erro no upload subject:", error);
        return res.status(500).json({ message: 'Erro interno no upload', error: true });
      }
    }

    default:
      return res.status(405).json({ message: 'Method Not Allowed', error: true });
  }
}