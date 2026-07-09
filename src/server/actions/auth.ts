// src/server/actions/auth.ts
'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'cbc-insight-ai-super-secret-development-key-2026-replace-in-prod'
);

// Strict Validation Schemas using Zod
const RegisterSchema = z.object({
  name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid birth date'),
  biologicalSex: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function registerUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { name, email, password, dateOfBirth, biologicalSex } = validatedFields.data;

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { error: { email: ['An account with this email already exists.'] } };
    }

    // Hash password with 12 rounds of salt
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user in Neon Postgres
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        dateOfBirth: new Date(dateOfBirth),
        biologicalSex: biologicalSex as 'MALE' | 'FEMALE' | 'OTHER',
      },
    });

    return { success: true };
  } catch (err) {
    console.error('Registration error:', err);
    return { error: { global: ['A database error occurred during registration.'] } };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const validatedFields = LoginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: validatedFields.error.flatten().fieldErrors };
  }

  const { email, password } = validatedFields.data;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { error: { global: ['Invalid email or password.'] } };
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return { error: { global: ['Invalid email or password.'] } };
    }

    // Generate secure 7-day JWT
    const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Set HTTP-Only encrypted cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true, // Blocks XSS javascript attacks from stealing tokens
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
      path: '/',
    });

    return { success: true };
  } catch (err) {
    console.error('Login error:', err);
    return { error: { global: ['An unexpected error occurred during login.'] } };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  return { success: true };
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        dateOfBirth: true,
        biologicalSex: true,
        bloodGroup: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}