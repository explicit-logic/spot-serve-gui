import { connect } from '@/lib/peer/connect';
import { Suspense } from 'react';
import { Await, useLoaderData } from 'react-router';
import ConnectContainer from './components/connect-container';
import ConnectError from './components/connect-error';
import ConnectSkeleton from './components/connect-skeleton';

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
