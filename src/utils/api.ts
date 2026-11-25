export class ApiRequestError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function requestApi<T>(path: string, options?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch {
    throw new ApiRequestError(0, "Không thể kết nối đến máy chủ XT Meat. Hãy kiểm tra backend.");
  }
  const body = await response.json().catch(function () { return {}; }) as { error?: string } & T;
  if (response.ok === false) {
    throw new ApiRequestError(response.status, body.error || "Đã xảy ra lỗi khi kết nối máy chủ.");
  }
  return body;
}
