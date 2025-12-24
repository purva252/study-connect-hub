import TeacherProfile from '../models/TeacherProfile';

/**
 * Generates a unique random code (6 uppercase letters/numbers)
 * Ensures no duplicates exist in the database
 * Example output: "XK9M2L", "AB3CD5"
 */
export async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops

  while (exists && attempts < maxAttempts) {
    // Generate random 6-character alphanumeric code
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
      .padEnd(6, 'X'); // Ensure 6 chars

    // Check if code already exists
    const found = await TeacherProfile.findOne({ code });
    exists = !!found;
    attempts++;
  }

  if (attempts >= maxAttempts) {
    throw new Error('Failed to generate unique teacher code');
  }

  return code!;
}
