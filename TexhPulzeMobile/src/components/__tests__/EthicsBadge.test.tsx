import React from 'react';
import renderer from 'react-test-renderer';
import EthicsBadge from '../EthicsBadge';

describe('EthicsBadge Component Snapshot Tests', () => {
  test('renders high ethics score correctly', () => {
    const tree = renderer.create(
      <EthicsBadge score={9.2} size="large" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders medium ethics score correctly', () => {
    const tree = renderer.create(
      <EthicsBadge score={6.5} size="medium" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders low ethics score correctly', () => {
    const tree = renderer.create(
      <EthicsBadge score={3.1} size="small" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders with custom label', () => {
    const tree = renderer.create(
      <EthicsBadge score={8.0} label="Privacy Score" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  test('renders with tooltip', () => {
    const tree = renderer.create(
      <EthicsBadge 
        score={7.5} 
        showTooltip={true}
        tooltipText="Based on privacy policy and data handling practices"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
