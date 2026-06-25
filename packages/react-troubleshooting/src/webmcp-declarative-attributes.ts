/* eslint-disable @typescript-eslint/no-unused-vars -- merge React HTML attribute interfaces */
import 'react';

declare module 'react' {
  interface FormHTMLAttributes<T> {
    toolname?: string | undefined;
    tooldescription?: string | undefined;
    /** Presence attribute; set to "" when enabled. */
    toolautosubmit?: '' | undefined;
  }

  interface InputHTMLAttributes<T> {
    toolparamdescription?: string | undefined;
  }

  interface SelectHTMLAttributes<T> {
    toolparamdescription?: string | undefined;
  }

  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string | undefined;
  }
}

export {};
