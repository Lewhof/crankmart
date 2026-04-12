import type { RegionFile, EventSeed } from '../../types'
import { westernCapeEvents } from './western-cape'
import { easternCapeEvents } from './eastern-cape'
import { kwazuluNatalEvents } from './kwazulu-natal'
import { gautengEvents } from './gauteng'
import { freeStateEvents } from './free-state'
import { northWestEvents } from './north-west'
import { northernCapeEvents } from './northern-cape'
import { mpumalangaEvents } from './mpumalanga'
import { limpopoEvents } from './limpopo'

export const eventRegions: RegionFile<EventSeed>[] = [
  westernCapeEvents,
  easternCapeEvents,
  kwazuluNatalEvents,
  gautengEvents,
  freeStateEvents,
  northWestEvents,
  northernCapeEvents,
  mpumalangaEvents,
  limpopoEvents,
]
