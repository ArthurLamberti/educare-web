import "server-only";

import { apiFetch, normalizePage, type Page } from "./api";
import type { LessonStatus } from "./lessons";

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN" | "CANCELED";

export type RescheduleRequest = {
  id: number;
  lessonId: number;
  lessonTopic: string;
  lessonStatus: LessonStatus;
  teacherId: number;
  teacherName: string;
  studentId: number;
  studentName: string;
  /** The lesson's start now (after approval it equals proposedStartsAt). */
  lessonStartsAt: string;
  durationMinutes: number;
  /** The lesson's start when the request was made. */
  originalStartsAt: string;
  proposedStartsAt: string;
  reason: string | null;
  status: RequestStatus;
  decisionNote: string | null;
  decidedByName: string | null;
  decidedAt: string | null;
  createdAt: string;
};

/** Newest first. */
export async function listRequests(query: { status?: RequestStatus; page?: number; size?: number } = {}): Promise<Page<RescheduleRequest>> {
  const params = new URLSearchParams({ page: String(query.page ?? 0), size: String(query.size ?? 20) });
  if (query.status) params.set("status", query.status);
  return normalizePage(await apiFetch(`/api/reschedule-requests?${params}`));
}

export async function countPendingRequests(): Promise<number> {
  return (await listRequests({ status: "PENDING", size: 1 })).totalElements;
}

/** Ids of lessons with a pending request, for the "Change requested" badge. */
export async function lessonsWithPendingRequest(): Promise<number[]> {
  return (await listRequests({ status: "PENDING", size: 200 })).content.map((r) => r.lessonId);
}

export function createRequest(lessonId: number, data: { proposedStartsAt: string; reason: string | null }): Promise<RescheduleRequest> {
  return apiFetch(`/api/lessons/${lessonId}/reschedule-requests`, { method: "POST", body: JSON.stringify(data) });
}

export function withdrawRequest(id: number): Promise<RescheduleRequest> {
  return apiFetch(`/api/reschedule-requests/${id}/withdraw`, { method: "POST" });
}

export function approveRequest(id: number): Promise<RescheduleRequest> {
  return apiFetch(`/api/reschedule-requests/${id}/approve`, { method: "POST" });
}

export function rejectRequest(id: number, note: string | null): Promise<RescheduleRequest> {
  return apiFetch(`/api/reschedule-requests/${id}/reject`, { method: "POST", body: JSON.stringify({ note }) });
}

/** Mirrors the API rule (48 hours before the current start); the API stays the authority. */
export const MIN_NOTICE_MS = 48 * 60 * 60 * 1000;

export function requestDeadline(lessonStartsAt: string): Date {
  return new Date(new Date(lessonStartsAt).getTime() - MIN_NOTICE_MS);
}

/** True once the 48-hour window to ask for a change has closed. */
export function requestWindowClosed(lessonStartsAt: string): boolean {
  return Date.now() > requestDeadline(lessonStartsAt).getTime();
}
