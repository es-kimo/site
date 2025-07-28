import { ZodTypeAny } from "zod";

export function expectValid(schema: ZodTypeAny, value: unknown) {
  const res = schema.safeParse(value);
  if (!res.success) {
    // 편하게 fail 시 오류 출력
    throw new Error("Expected valid, got errors:\n" + JSON.stringify(res.error.issues, null, 2));
  }
  return res.data;
}

export function expectInvalid(schema: ZodTypeAny, value: unknown, contains?: string) {
  const res = schema.safeParse(value);
  if (res.success) {
    throw new Error("Expected invalid, but parse succeeded");
  }
  if (contains) {
    const all = res.error.issues.map((i) => i.message).join("\n");
    if (!all.includes(contains)) {
      throw new Error(`Expected error message to contain "${contains}", got:\n${all}`);
    }
  }
}
