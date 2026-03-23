import { Request, Response, NextFunction } from "express";
import { UserRole } from "../types/user.types";

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Не авторизован" });
      return;
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ 
        error: "Доступ запрещен. Недостаточно прав.",
        requiredRoles: allowedRoles,
        userRole: userRole
      });
      return;
    }

    next();
  };
};