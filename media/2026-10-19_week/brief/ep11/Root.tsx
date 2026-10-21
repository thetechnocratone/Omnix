import React from 'react';
import {Composition} from 'remotion';
import {OneTake, TOTAL} from './OneTake';

export const Root: React.FC = () => (
  <Composition id="OneTake" component={OneTake} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
);
