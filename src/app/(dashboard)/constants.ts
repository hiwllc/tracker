import { startOfMonth } from "date-fns";

export const DEFAULT_DATE = startOfMonth(new Date()).toISOString();
