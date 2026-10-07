import { RegistrationForm } from '@/features/registration/components/registration-form';
import { FooterNav } from '@/components/FooterNav';

export const metadata = {
  title: 'Register | Verve26',
  description: 'Secure your spot for Verve26 events. You must choose exactly 1 Technical and 1 Non-Technical event.',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <main className="py-12 px-4 sm:px-6 md:px-8 relative z-10 flex-1">
        <div className="max-w-7xl mx-auto">
          <RegistrationForm />
        </div>
      </main>
      <FooterNav />
    </div>
  );
}
