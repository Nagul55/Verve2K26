import * as z from 'zod';

export const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
  registerNumber: z.string().min(3, "Register number is required"),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  department: z.string().min(2, "Department is required"),
  yearOfStudy: z.string().min(1, "Year of study is required"),
  section: z.string().optional(),
  college: z.string().min(2, "College name is required"),
  
  // Array of 2 string event IDs
  selectedEventIds: z.array(z.string()).length(2, "You must select exactly 2 events (1 Technical, 1 Non-Technical)"),
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
