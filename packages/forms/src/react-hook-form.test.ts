import { describe, expect, it } from 'vitest';
import { flattenReactHookFormErrors } from './react-hook-form';

describe('flattenReactHookFormErrors', () => {
  it('flattens nested react-hook-form errors', () => {
    const errors = flattenReactHookFormErrors({
      email: { type: 'required', message: 'Email is required' },
      profile: {
        name: { type: 'min', message: 'Name is too short' },
      },
    });

    expect(errors).toEqual([
      {
        path: 'email',
        message: 'Email is required',
        kind: 'required',
      },
      {
        path: 'profile.name',
        message: 'Name is too short',
        kind: 'min',
      },
    ]);
  });

  it('returns an empty array for non-object errors', () => {
    expect(flattenReactHookFormErrors(null)).toEqual([]);
    expect(flattenReactHookFormErrors(undefined)).toEqual([]);
  });
});
