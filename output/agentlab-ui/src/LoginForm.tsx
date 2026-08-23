import React from 'react';
import { Button } from './Button';
export const LoginForm: React.FC<{onSuccess: () => void}> = ({ onSuccess }) => (
  <form onSubmit={(e) => { e.preventDefault(); onSuccess(); }} className="flex flex-col space-y-5">
    <div className="flex flex-col space-y-2">
      <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Email Address</label>
      <input type="email" required className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20" />
    </div>
    <div className="flex flex-col space-y-2">
      <label className="font-inter text-xs font-semibold text-slate-300 uppercase">Password</label>
      <input type="password" required className="w-full bg-navy-950 border border-navy-700 rounded-md text-white px-4 py-3 font-inter text-sm focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20" />
    </div>
    <Button variant="primary" type="submit" className="w-full py-3">Authenticate</Button>
  </form>
);