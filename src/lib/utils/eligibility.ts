export function isUserEligibleForEvent(userDept: string | undefined, allowedDepts: string | null) {
  if (!allowedDepts || !allowedDepts.trim()) return true;
  if (!userDept) return false;

  const normalizedUserDept = userDept.toLowerCase().trim();
  
  // Try to canonicalize user dept
  let canonicalUserDept = normalizedUserDept;
  if (normalizedUserDept.includes('information technology')) canonicalUserDept = 'it';
  else if (normalizedUserDept.includes('computer science')) canonicalUserDept = 'cse';
  else if (normalizedUserDept.includes('electronics and communication')) canonicalUserDept = 'ece';
  else if (normalizedUserDept.includes('electrical and electronics')) canonicalUserDept = 'eee';
  else if (normalizedUserDept.includes('mechanical')) canonicalUserDept = 'mech';
  else if (normalizedUserDept.includes('artificial intelligence') || normalizedUserDept.includes('data science') || normalizedUserDept === 'ai ds') canonicalUserDept = 'ai & ds';

  const allowedList = allowedDepts.split(',').map(d => d.trim().toLowerCase());
  
  for (const allowed of allowedList) {
    if (allowed === canonicalUserDept) return true;
    if (normalizedUserDept.includes(allowed)) return true;
    if (allowed.includes(canonicalUserDept)) return true;
  }
  return false;
}
