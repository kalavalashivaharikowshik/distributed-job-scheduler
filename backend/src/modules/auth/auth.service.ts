import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../db/prisma";
import { env } from "../../config/env";
import { ApiError } from "../../utils/api-error";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const signToken = (userId: string) => {
  return jwt.sign(
    { userId },
    env.jwtSecret,
    {
      expiresIn: "7d",
    }
  );
};

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ApiError(409, "Email already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        memberships: {
          create: {
            role: "OWNER",
            organization: {
              create: {
                name: data.organizationName,
              },
            },
          },
        },
      },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    const token = signToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organization: user.memberships[0].organization,
    };
  },

  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      organizations: user.memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        role: membership.role,
      })),
    };
  },
};