import React from 'react';
import {Composition} from 'remotion';
import {Brief, Cover} from './Brief';
import tl from './timeline.json';

export const FPS = 30;

export const Root: React.FC = () => (
  <>
  <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1920} />
  <Composition
    id="Brief"
    component={Brief}
    durationInFrames={Math.ceil(tl.total * FPS)}
    fps={FPS}
    width={1080}
    height={1920}
  />
  </>
);
