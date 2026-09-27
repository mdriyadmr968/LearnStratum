'use client';

import React from 'react';
import { RouteTransition } from '@/components/animations/motion-components';

export default function Template({ children }: { children: React.ReactNode }) {
  return <RouteTransition>{children}</RouteTransition>;
}
