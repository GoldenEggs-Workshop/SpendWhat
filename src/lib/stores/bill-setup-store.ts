import { writable } from "svelte/store";
import { Bill } from "$lib/models/bill";

const billSetupStore = writable<Bill>();

export default billSetupStore;