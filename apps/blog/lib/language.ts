"use server";

import { cookies } from "next/headers";

const LANGUAGE_COOKIE_NAME = "preferred-language";

export type Language = "ko" | "en";

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const language = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  return (language === "en" || language === "ko") ? language : "ko";
}

export async function setLanguage(language: Language): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(LANGUAGE_COOKIE_NAME, language, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}

