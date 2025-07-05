import { Request, Response, NextFunction } from "express";

export const signUp = async (
  _req: Request,
  res: Response,
  _next: NextFunction
): Promise<Response> => {
  try {
    // Lógica para registrar un usuario
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "An unknown error occurred" });
  }
};
