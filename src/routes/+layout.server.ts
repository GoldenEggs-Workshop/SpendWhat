import { loginByCookie } from "$lib/stores/user-store";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ cookies }) => {
  const session = cookies.get('session') ?? '';
  await loginByCookie(session);
  
  return {
    session
  };
};