import React from 'react';
import {Composition} from 'remotion';
import {FakeMed, Cover} from './FakeMed';
import tl from './timeline.json';

export const Root: React.FC = () => (
  <>
  <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="FakeMed" component={FakeMed} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
  </>
);
