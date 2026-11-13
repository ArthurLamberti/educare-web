import "server-only";

import { listTeachers } from "./teachers";

/** Active teachers for admin selectors, plus the currently assigned one even if inactive. */
export async function teacherOptions(keepId?: number) {
  const teachers = await listTeachers(0, 200);
  return teachers.content.filter((t) => t.active || t.id === keepId).map((t) => ({ id: t.id, name: t.name }));
}
