# Proposal: Online lessons and lesson notes (pages)

## Why
Show and edit the room link and the teacher's notes added by educare-api change 13.

## What Changes
- Lesson form: "Aula online" with a required "Link da sala" (http/https), also for weekly series.
- Lesson list: topic links to the lesson page, "Online" badge, "Entrar na sala" (new tab) on
  upcoming online lessons, "Anotações" link when there are notes.
- `/lessons/[id]`: date, people, online/in-person with "Entrar na sala", observações, and "Anotações
  da aula": an editor for the lesson's teacher, read-only text for the student and admins.
