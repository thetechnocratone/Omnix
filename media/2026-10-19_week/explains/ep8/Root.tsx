import React from 'react';
import {Composition} from 'remotion';
import {Zine, TOTAL} from './Zine';

export const Root: React.FC = () => (
  <Composition id="Zine" component={Zine} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
);
