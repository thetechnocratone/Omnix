import React from 'react';
import {Composition} from 'remotion';
import {Europe, TOTAL} from './Europe';

export const Root: React.FC = () => (
  <Composition id="Europe" component={Europe} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
);
