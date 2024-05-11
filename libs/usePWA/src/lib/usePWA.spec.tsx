import { render } from '@testing-library/react';

import UsePWA from './usePWA';

describe('UsePWA', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<UsePWA />);
    expect(baseElement).toBeTruthy();
  });
});
