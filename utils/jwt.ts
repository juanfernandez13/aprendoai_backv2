import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const secret: Secret = "é mole";

export const genereteToken = (payload: object): string => {
  const options: SignOptions = { expiresIn: "100h" };
  const token = jwt.sign(payload, secret, options);
  return token;
};

export const verifyToken = (token: string): any => {
  try {
    const cleanToken = token.replace("Bearer ", "").trim();

    const user = jwt.verify(cleanToken, secret);

    return { isValid: true, user: user };
  } catch (error) {
    return { isValid: false };
  }
};