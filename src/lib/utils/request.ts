import axios from "axios";
import { settings } from "$lib/modules/settings/settings";
import { get } from "svelte/store";
import { fetch } from "@tauri-apps/plugin-http";


export async function Get(url: string, data?: any) {
  return fetch(`${url}`, {
    method: "Get",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

export default async function Post(url: string, data?: any) {
  return fetch(`${get(settings).remoteUrl}/api${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data ? JSON.stringify(data) : undefined,
  })
}

