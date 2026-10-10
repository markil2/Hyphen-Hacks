import { changingArt } from '@/components/scene/art/changing';
import { kitchenArt } from '@/components/scene/art/kitchen';
import { livingArt } from '@/components/scene/art/living';
import { nurseryArt } from '@/components/scene/art/nursery';
import { playArt } from '@/components/scene/art/play';
import type { RoomArt } from '@/components/scene/RoomScene';

export interface RoomInfo {
  id: 'nursery' | 'kitchen' | 'living' | 'changing' | 'play';
  name: string;
  purpose: string;
  art: RoomArt;
  /** The part of the canvas worth showing in a thumbnail. */
  crop: string;
}

export const ROOMS: Record<RoomInfo['id'], RoomInfo> = {
  nursery: { id: 'nursery', name: 'Nursery', purpose: 'Sleep & comfort', art: nurseryArt, crop: '0 150 390 380' },
  kitchen: { id: 'kitchen', name: 'Kitchen', purpose: 'Feeding & nutrition', art: kitchenArt, crop: '0 60 390 480' },
  living: { id: 'living', name: 'Living room', purpose: 'Questions & expert support', art: livingArt, crop: '0 80 390 420' },
  changing: { id: 'changing', name: 'Changing area', purpose: 'Diapers & daily care', art: changingArt, crop: '0 100 390 380' },
  play: { id: 'play', name: 'Play corner', purpose: 'Milestones & activities', art: playArt, crop: '0 80 390 440' },
};
