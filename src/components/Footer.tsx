/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4">
      <div className="mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-natural-sage-light text-natural-sage-dark">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-natural-muted font-mono tracking-tight">
            Community Hero AI © 2026
          </span>
        </div>

        {/* Center Section */}
        <p className="text-center text-xs text-natural-muted max-w-md">
          Empowering neighborhoods through intelligent local incident tracking, duplicate triage, and volunteer coordination.
        </p>

        {/* Right Section */}
        <div className="flex items-center gap-4 text-xs font-medium text-natural-muted">
          <a href="#" className="hover:text-natural-sage-dark transition-colors">Safety Guidelines</a>
          <a href="#" className="hover:text-natural-sage-dark transition-colors">Community Terms</a>
        </div>
      </div>
    </footer>
  );
};
