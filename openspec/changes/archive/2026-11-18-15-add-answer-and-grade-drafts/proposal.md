# Proposal: Answer and grade drafts (pages)

## Why
Let students and teachers save work without publishing it (educare-api change 15).

## What Changes
- Answer page (student): "Salvar rascunho" and "Enviar" ("Reenviar" after the first submission). A saved draft is loaded in the editor with "Rascunho salvo em ..."; after submitting, the page shows what the teacher sees ("Resposta enviada") when it differs from the draft. Editing stays possible until the grade is published.
- Grading page (teacher): "Salvar correção" and "Enviar correção"; a saved correction is loaded back with "Correção não enviada, salva em ...". Revising a published grade shows that the student still sees the previous one.
- Grading queue: "Correção em andamento" badge on items with a grade draft.

## Impact
- Depends on educare-api change 15-add-answer-and-grade-drafts.
