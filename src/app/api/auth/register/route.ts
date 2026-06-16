import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { validateName, validateEmail, validatePassword } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // Strict server-side validation
    const nameErr = validateName(fullName, "Nombre completo");
    if (nameErr) {
      return NextResponse.json({ error: nameErr }, { status: 400 });
    }

    const emailErr = validateEmail(email);
    if (emailErr) {
      return NextResponse.json({ error: emailErr }, { status: 400 });
    }

    const passErr = validatePassword(password);
    if (passErr) {
      return NextResponse.json({ error: passErr }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Este email ya está registrado." },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        hashedPassword,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al registrarse. Intentá de nuevo." },
      { status: 500 },
    );
  }
}
