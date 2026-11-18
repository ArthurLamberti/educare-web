/** Educare's own "join the room" link; it redirects to the video provider (see app/lessons/[id]/room). */
export function lessonRoomPath(lessonId: number) {
  return `/lessons/${lessonId}/room`;
}

/** Where an online lesson's room comes from: created by Educare, or the teacher's own link. */
export type RoomChoice = "virtual" | "link";
