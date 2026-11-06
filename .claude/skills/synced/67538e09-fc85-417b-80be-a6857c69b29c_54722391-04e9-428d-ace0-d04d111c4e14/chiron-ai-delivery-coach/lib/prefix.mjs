// Sandbox component prefix for one learner: ai_<email user id>_ (id capped at 12 characters).
export function tutorPrefix(email) {
  const at = String(email).indexOf('@');
  if (at < 0) throw new Error('not an email');
  const trim = (s) => s.replace(/^_+|_+$/g, '');
  const id = trim(email.slice(0, at).toLowerCase().replace(/[^a-z0-9]+/g, '_'));
  return `ai_${trim(id.slice(0, 12))}_`;
}
