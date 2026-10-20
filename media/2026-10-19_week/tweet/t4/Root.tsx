import React from 'react';
import {Composition} from 'remotion';
import {Tweet, FRAMES, FPS} from './Tweet';

export const Root: React.FC = () => <Composition id="Tweet" component={Tweet} durationInFrames={FRAMES} fps={FPS} width={1080} height={1920} />;
