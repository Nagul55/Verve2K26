import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an account on Eventrix to register for Sona College of Technology events and hackathons.',
  alternates: {
    canonical: '/signup',
  }
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
