import { Response, NextFunction } from "express";
import { prisma } from "../db/prisma";
import { AuthRequest } from "./auth.middleware";
import { ApiError } from "../utils/api-error";

type OrgRole = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";

const roleRank: Record<OrgRole, number> = {
  VIEWER: 1,
  DEVELOPER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function requireOrgRole(minRole: OrgRole) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new ApiError(401, "Unauthorized");
      }

      const organizationId =
        (req.body.organizationId as string | undefined) ||
        (req.query.organizationId as string | undefined);

      if (!organizationId) {
        return next();
      }

      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId,
          organizationId,
        },
      });

      if (!membership) {
        throw new ApiError(403, "You do not belong to this organization");
      }

      const userRole = membership.role as OrgRole;

      if (roleRank[userRole] < roleRank[minRole]) {
        throw new ApiError(403, "Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}