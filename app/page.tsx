import type { Metadata } from 'next';
import { CaveLanding } from '@/components/cave/CaveLanding';

export const metadata: Metadata = {
  title: 'Batcave',
  description: 'The operator standby — boot the Batcomputer to enter.',
};

export default function CavePage() {
  return <CaveLanding />;
}
