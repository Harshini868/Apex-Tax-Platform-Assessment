import { generateScaleDataset } from './generateScaleDataset';
import type { ScaleDataset } from '../domain/scale';

export const scaleSeed = 20260720;
export const scaleDataset: ScaleDataset = generateScaleDataset(scaleSeed);
