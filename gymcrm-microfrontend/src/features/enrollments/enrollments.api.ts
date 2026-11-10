import { api } from '../../shared/api/client';
import { Enrollment, EnrollmentInput, EnrollmentUpdateInput } from '../../shared/api/types';

export const listEnrollments = () => api.get<Enrollment[]>('/enrollments?limit=100');
export const createEnrollment = (input: EnrollmentInput) => api.post<Enrollment>('/enrollments', input);
export const updateEnrollment = (id: number, input: EnrollmentUpdateInput) => api.put<Enrollment>(`/enrollments/${id}`, input);
/** RF04 — renova a matrícula (estende a vigência em um período). */
export const renewEnrollment = (id: number) => api.post<Enrollment>(`/enrollments/${id}/renew`, {});
export const deleteEnrollment = (id: number) => api.delete(`/enrollments/${id}`);
