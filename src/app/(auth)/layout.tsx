import React from 'react';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="absolute left-1/2 top-1/2  -translate-x-1/2 -translate-y-1/2">{children}</div>;
};
export default AuthLayout;
