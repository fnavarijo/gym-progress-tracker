import { CycleStartForm } from '@/components/app/cycle-start-form';
import { Suspense } from 'react';

export default function CycleStartPage() {
  return (
    <Suspense fallback={<span>...</span>}>
      <CycleStartForm />
    </Suspense>
  );
}
