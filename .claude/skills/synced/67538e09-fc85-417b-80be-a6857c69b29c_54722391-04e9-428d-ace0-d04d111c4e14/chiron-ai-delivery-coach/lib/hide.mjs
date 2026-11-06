// Hides the progress folder so learners never work in it. A Mac hides it by its leading dot; Windows needs the
// Hidden attribute, set again whenever the folder is made anew. Best effort: a failure never stops the course.
import { run } from './run.mjs';

export function hideFolder(dir, platform = process.platform, runner = run) {
  if (platform !== 'win32') return 'skipped';
  try {
    return runner('attrib', ['+h', dir]).code === 0 ? 'hidden' : 'failed';
  } catch {
    return 'failed';
  }
}
