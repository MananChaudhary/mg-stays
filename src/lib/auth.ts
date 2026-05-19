import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/client";
import {
  canAccessDashboardPath,
  isOwner,
  resolveRoleForNewUser,
  type DashboardRole,
} from "./roles";
import { db } from "./db";

export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  let user = await db.user.findUnique({ where: { clerkId: userId } });

  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const role = resolveRoleForNewUser(email);

    user = await db.user.create({
      data: {
        clerkId: userId,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        imageUrl: clerkUser.imageUrl,
        role: role as UserRole,
      },
    });
  } else {
    const clerkUser = await currentUser();
    if (clerkUser) {
      const email =
        clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
          ?.emailAddress ??
        clerkUser.emailAddresses[0]?.emailAddress ??
        user.email;
      const expectedRole = resolveRoleForNewUser(email);
      const updates: {
        email?: string;
        role?: UserRole;
        firstName?: string | null;
        lastName?: string | null;
        imageUrl?: string | null;
      } = {};

      if (email && email !== user.email) updates.email = email;
      if (user.role !== expectedRole) updates.role = expectedRole as UserRole;
      if (clerkUser.firstName !== user.firstName) updates.firstName = clerkUser.firstName;
      if (clerkUser.lastName !== user.lastName) updates.lastName = clerkUser.lastName;
      if (clerkUser.imageUrl !== user.imageUrl) updates.imageUrl = clerkUser.imageUrl;

      if (Object.keys(updates).length > 0) {
        user = await db.user.update({
          where: { id: user.id },
          data: updates,
        });
      }
    }
  }

  return user;
}

export async function requireDbUser() {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireOwner() {
  const user = await requireDbUser();
  if (!isOwner(user.role as DashboardRole)) {
    throw new Error("Owner access required");
  }
  return user;
}

export async function requireDashboardAccess(pathname: string) {
  const user = await getCurrentDbUser();
  if (!user) redirect("/sign-in");
  if (!canAccessDashboardPath(user.role as DashboardRole, pathname)) {
    redirect("/dashboard?access=limited");
  }
  return user;
}

/** @deprecated Use isOwner */
export function isAdmin(role: UserRole) {
  return isOwner(role as DashboardRole);
}
