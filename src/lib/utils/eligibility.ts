import { DEPARTMENTS } from "@/data/departments";

export function isUserEligibleForEvent(userDept: string | undefined | null, allowedDepts: string | null | undefined): boolean {
  if (!allowedDepts || !allowedDepts.trim()) return true;
  if (!userDept || !userDept.trim()) return false;

  const normalizedUserDept = userDept.toLowerCase().trim();

  // Find canonical department mapping if available
  const matchedDept = DEPARTMENTS.find(d => 
    d.value.toLowerCase() === normalizedUserDept ||
    d.code.toLowerCase() === normalizedUserDept ||
    normalizedUserDept.includes(d.value.toLowerCase()) ||
    normalizedUserDept.includes(`(${d.code.toLowerCase()})`)
  );

  const allowedList = allowedDepts.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

  for (const allowed of allowedList) {
    if (matchedDept) {
      if (allowed === matchedDept.code.toLowerCase() || allowed === matchedDept.value.toLowerCase()) {
        return true;
      }
    }
    if (allowed === normalizedUserDept) {
      return true;
    }
  }

  return false;
}
