import { NextResponse } from "next/server";

export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

export function jsonData<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(
  message: string,
  status = 400,
  code = "BAD_REQUEST",
) {
  return NextResponse.json<ApiError>(
    { error: { code, message } },
    { status },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
