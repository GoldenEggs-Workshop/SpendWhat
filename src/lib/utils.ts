import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { User } from "./models/user";
import { loginByCookie } from "./stores/user-store";
import { Get } from "./utils/request";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

export async function initApp() {
  // 从 document.cookie 拿 session
  const match = document.cookie.match(/(?:^|; )session=([^;]*)/);
  const session = match ? decodeURIComponent(match[1]) : null;

  if (session) {
    await loginByCookie(session); // 自动恢复 currentUser
  }
}
export async function getRate(from: string, to: string) {
  return (await getAllRate(from))[from][to];
}

export async function getAllRate(currency: string) {
  const URL = `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency.toLowerCase()}.json`;
  console.log(URL);
  const response = await Get(URL);
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate");
  }
  return await response.json();
}

export async function testFunction() {
  console.log(await getRate("usd", "cny"));
}
