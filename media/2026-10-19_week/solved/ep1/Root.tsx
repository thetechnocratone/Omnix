import React from 'react';
import {Composition} from 'remotion';
import {Explainer, Cover} from './Explainer';
import tl from './timeline.json';

export const Root: React.FC = () => (
  <>
  <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition id="Deposit" component={Explainer} durationInFrames={Math.ceil(tl.total * 30)} fps={30} width={1080} height={1920} />
  </>
);
