"use server";

import { Role } from "@prisma/client";
import { signOut } from "@/auth";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signUpSchema } from "@/lib/validation";

export type AuthFormState = { error?: string; ok?: boolean };

export async function registerUser(_prevState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const db = getDb();
  if (!db) return { error: "Database is not configured." };

  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { name, email, password } = parsed.data;
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  await db.user.create({ data: { name, email, passwordHash, role: Role.CUSTOMER } });

  return { ok: true };
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
