import { connect } from '@/lib/peer/connect';
import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import ConnectContainer from './components/ConnectContainer';
import ConnectError from './components/ConnectError';
import ConnectSkeleton from './components/ConnectSkeleton';

export function loader() {
  return {
    peer: connect(),
  };
}

export function Component() {
  const { peer } = useLoaderData();

  return (
    <Suspense fallback={<ConnectSkeleton />}>
      <Await resolve={peer} errorElement={<ConnectError />}>
        <ConnectContainer />
      </Await>
    </Suspense>
  );
}
