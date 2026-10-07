export interface Department {
  value: string;
  label: string;
  code: string;
}

export const DEPARTMENTS: Department[] = [
  { value: "Information Technology", label: "Information Technology (IT)", code: "IT" },
  { value: "Computer Science and Engineering", label: "Computer Science and Engineering (CSE)", code: "CSE" },
  { value: "Artificial Intelligence and Data Science", label: "Artificial Intelligence and Data Science (AI & DS)", code: "AI & DS" },
  { value: "Artificial Intelligence and Machine Learning", label: "Artificial Intelligence and Machine Learning (AI & ML)", code: "AI & ML" },
  { value: "Computer Science and Business Systems", label: "Computer Science and Business Systems (CSBS)", code: "CSBS" },
  { value: "Computer Science and Design", label: "Computer Science and Design (CSD)", code: "CSD" },
  { value: "Electronics and Communication Engineering", label: "Electronics and Communication Engineering (ECE)", code: "ECE" },
  { value: "Electrical and Electronics Engineering", label: "Electrical and Electronics Engineering (EEE)", code: "EEE" },
  { value: "Mechanical Engineering", label: "Mechanical Engineering (MECH)", code: "MECH" },
  { value: "Mechatronics Engineering", label: "Mechatronics Engineering (MCT)", code: "MCT" },
  { value: "Civil Engineering", label: "Civil Engineering (CIVIL)", code: "CIVIL" },
  { value: "Biomedical Engineering", label: "Biomedical Engineering (BME)", code: "BME" },
  { value: "Biotechnology", label: "Biotechnology (BT)", code: "BT" },
  { value: "Master of Business Administration", label: "Master of Business Administration (MBA)", code: "MBA" },
  { value: "Master of Computer Applications", label: "Master of Computer Applications (MCA)", code: "MCA" },
  { value: "Science and Humanities", label: "Science and Humanities (S&H)", code: "S&H" },
  { value: "Other", label: "Other / External Department", code: "OTHER" },
];

export const DEPARTMENT_SELECT_OPTIONS = DEPARTMENTS.map(d => ({
  value: d.value,
  label: d.label,
  description: `Department code: ${d.code}`,
}));
