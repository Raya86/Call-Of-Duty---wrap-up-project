import { getDb } from "../db.js";

const checkDbHealth = async (controller: AbortController) => {
  await getDb().command({ ping: 1 }, { signal: controller.signal });
};

export { checkDbHealth };
