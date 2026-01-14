const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const buildHeaders = (token, extraHeaders) => {
  const headers = {
    ...(extraHeaders || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function apiRequest(path, { method = 'GET', token, body, headers } = {}) {
  const hasBody = body !== undefined;
  const contentHeaders = hasBody ? { 'Content-Type': 'application/json' } : {};

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(token, { ...contentHeaders, ...(headers || {}) }),
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message = (data && data.message) || response.statusText || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const CoursesAPI = {
  getById: (courseId, token) => apiRequest(`/api/courses/${courseId}`, { token }),
  getEnrolledStudents: (courseId, token) => apiRequest(`/api/courses/${courseId}/students`, { token }),
  enrollStudents: (courseId, studentIds, token) => apiRequest(`/api/courses/${courseId}/enroll`, { method: 'POST', token, body: { studentIds } }),
  unenrollStudent: (courseId, studentId, token) => apiRequest(`/api/courses/${courseId}/unenroll/${studentId}`, { method: 'DELETE', token }),
};

export const UsersAPI = {
  listStudents: (token) => apiRequest('/api/users?role=student', { token }),
};
