import { Leaf } from 'lucide-react';

export function BrandMark({
  size = 17,
  strokeWidth = 2,
}: {
  size?: number;
  strokeWidth?: number;
}) {
  return <Leaf aria-hidden="true" size={size} strokeWidth={strokeWidth} />;
}
