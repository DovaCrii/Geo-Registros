"use server";

import { Resend } from "resend";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logEmail } from "@/server/email/log-email";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.EMAIL_FROM ?? "noreply@aeroflow.app";

function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendEmail(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "ADMIN") throw new Error("Acceso denegado. Se requiere rol ADMIN.");

  const to = readString(formData, "to");
  const subject = readString(formData, "subject");
  const body = readString(formData, "body");
  const type = readString(formData, "type") || "manual";
  const flightPlanId = readString(formData, "flightPlanId") || null;

  if (!to || !subject || !body) {
    throw new Error("To, subject, and body are required.");
  }

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;font-family:sans-serif;background:#0f172a;color:#e2e8f0;">
  ${body}
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `${subject} — Aeroflow`,
      html,
    });

    if (error) {
      console.error("[email] Send error:", error);
      await logEmail({
        to,
        subject,
        body: html,
        status: "failed",
        type,
        error: error.message,
        flightPlanId,
        createdById: session.user.id,
      });
      throw new Error(error.message);
    }

    await logEmail({
      to,
      subject,
      body: html,
      status: "sent",
      type,
      flightPlanId,
      createdById: session.user.id,
    });

    revalidatePath("/admin/email-logs");
    redirect("/admin/email-logs");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await logEmail({
      to,
      subject,
      body: html,
      status: "failed",
      type,
      error: message,
      flightPlanId,
      createdById: session.user.id,
    });
    throw err;
  }
}

export async function resendEmail(emailId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated.");
  if (session.user.role !== "ADMIN") throw new Error("Acceso denegado. Se requiere rol ADMIN.");

  const email = await prisma.emailLog.findUnique({ where: { id: emailId } });
  if (!email) throw new Error("Email not found.");

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: email.to,
      subject: email.subject,
      html: email.body,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      await prisma.emailLog.create({
        data: {
          to: email.to,
          subject: email.subject,
          body: email.body,
          status: "failed",
          type: email.type,
          error: error.message,
          flightPlanId: email.flightPlanId,
          createdById: session.user.id,
        },
      });
      throw new Error(error.message);
    }

    await prisma.emailLog.create({
      data: {
        to: email.to,
        subject: email.subject,
        body: email.body,
        status: "sent",
        type: email.type,
        flightPlanId: email.flightPlanId,
        createdById: session.user.id,
      },
    });

    revalidatePath("/admin/email-logs");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await prisma.emailLog.create({
      data: {
        to: email.to,
        subject: email.subject,
        body: email.body,
        status: "failed",
        type: email.type,
        error: message,
        flightPlanId: email.flightPlanId,
        createdById: session.user.id,
      },
    });
    throw err;
  }
}
