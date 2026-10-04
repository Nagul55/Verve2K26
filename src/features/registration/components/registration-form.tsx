'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '../types';
import { registrationSchema, RegistrationFormValues } from '../utils/validation';
import { getOpenEvents, submitRegistration } from '../services/registration.service';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function RegistrationForm() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, getValues, setError, reset, formState: { errors } } = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: '',
      registerNumber: '',
      email: '',
      mobile: '',
      department: '',
      yearOfStudy: '',
      section: '',
      college: '',
      selectedEventIds: [],
    },
  });

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getOpenEvents();
        setEvents(data);
      } catch (err: unknown) {
        const error = err as Error;
        toast.error("Error", { description: error.message });
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const toggleEvent = (eventId: string) => {
    const current = getValues('selectedEventIds');
    if (current.includes(eventId)) {
      setValue('selectedEventIds', current.filter(id => id !== eventId), { shouldValidate: true });
    } else {
      if (current.length >= 2) {
        toast.error("Limit reached", { description: "You can only select 2 events in total." });
        return;
      }
      setValue('selectedEventIds', [...current, eventId], { shouldValidate: true });
    }
  };

  async function onSubmit(data: RegistrationFormValues) {
    const selectedEvents = events.filter(e => data.selectedEventIds.includes(e.event_id));
    const techCount = selectedEvents.filter(e => e.category === 'Technical').length;
    const nonTechCount = selectedEvents.filter(e => e.category === 'Non-Technical').length;

    if (techCount !== 1 || nonTechCount !== 1) {
      setError('selectedEventIds', {
        type: 'manual',
        message: 'Invalid selection. You must pick exactly 1 Technical and 1 Non-Technical event.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRegistration(data);
      toast.success("Success!", { description: "You have successfully registered for Verve26!" });
      reset();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error("Registration Failed", { description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );
  }

  const techEvents = events.filter(e => e.category === 'Technical');
  const nonTechEvents = events.filter(e => e.category === 'Non-Technical');
  const watchedSelectedIds = watch('selectedEventIds');

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-card border-border">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/95 p-3 rounded-xl shadow-lg border border-border">
            <Image
              src="/assets/Eventrix logo.svg"
              alt="Eventrix Logo"
              width={0}
              height={100}
              sizes="100vw"
              style={{ width: 'auto', height: '100px' }}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <CardTitle className="text-3xl font-black text-primary">Verve26 Registration</CardTitle>
        <CardDescription className="text-lg">Fill out your details and select your events to secure your spot.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" {...register('fullName')} />
              {errors.fullName && <span className="text-xs text-destructive">{errors.fullName.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" placeholder="john.doe@example.com" {...register('email')} />
              {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Register Number</Label>
              <Input placeholder="e.g. 21BCE1234" {...register('registerNumber')} />
              {errors.registerNumber && <span className="text-xs text-destructive">{errors.registerNumber.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input placeholder="+91 9876543210" {...register('mobile')} />
              {errors.mobile && <span className="text-xs text-destructive">{errors.mobile.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>College Name</Label>
              <Input placeholder="Your College" {...register('college')} />
              {errors.college && <span className="text-xs text-destructive">{errors.college.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input placeholder="Information Technology" {...register('department')} />
              {errors.department && <span className="text-xs text-destructive">{errors.department.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Year of Study</Label>
              <Input placeholder="3rd Year" {...register('yearOfStudy')} />
              {errors.yearOfStudy && <span className="text-xs text-destructive">{errors.yearOfStudy.message}</span>}
            </div>
            <div className="space-y-2">
              <Label>Section (Optional)</Label>
              <Input placeholder="A" {...register('section')} />
              {errors.section && <span className="text-xs text-destructive">{errors.section.message}</span>}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-border">
            <div>
              <h3 className="text-2xl font-black text-primary tracking-tight">Select Your Events</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                MANDATORY: You must pick exactly <strong className="text-foreground">1 Technical</strong> event and <strong className="text-foreground">1 Non-Technical</strong> event.
              </p>
              {errors.selectedEventIds && (
                <p className="text-lg font-bold text-center py-2 bg-destructive/10 text-destructive mt-4 rounded-md border border-destructive/20">
                  {errors.selectedEventIds.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
              {/* Technical Column */}
              <div className="space-y-4">
                <h4 className="font-bold text-primary pb-2 flex items-center justify-between">
                  Technical Events
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Pick 1</span>
                </h4>
                {techEvents.map((evt) => (
                  <div
                    key={evt.event_id}
                    onClick={() => toggleEvent(evt.event_id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedSelectedIds.includes(evt.event_id) ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20' : 'border-border hover:border-primary/50 hover:bg-muted'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-lg">{evt.name}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-background rounded shadow-sm border border-border">{evt.participation_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{evt.description}</p>
                  </div>
                ))}
              </div>

              {/* Non-Technical Column */}
              <div className="space-y-4">
                <h4 className="font-bold text-primary pb-2 flex items-center justify-between">
                  Non-Technical Events
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">Pick 1</span>
                </h4>
                {nonTechEvents.map((evt) => (
                  <div
                    key={evt.event_id}
                    onClick={() => toggleEvent(evt.event_id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${watchedSelectedIds.includes(evt.event_id) ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20' : 'border-border hover:border-primary/50 hover:bg-muted'}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-lg">{evt.name}</span>
                      <span className="text-xs font-bold px-2 py-1 bg-background rounded shadow-sm border border-border">{evt.participation_type}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{evt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full text-xl font-bold py-8 rounded-xl shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> Secure My Registration...</> : 'Complete Registration'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
