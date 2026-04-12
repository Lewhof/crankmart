import type { RegionFile, RouteSeed } from '../../types'
import { easternCapeRoutes } from './eastern-cape'
import { freeStateRoutes } from './free-state'
import { gautengRoutes } from './gauteng'
import { kwazuluNatalRoutes } from './kwazulu-natal'
import { limpopoRoutes } from './limpopo'
import { mpumalangaRoutes } from './mpumalanga'
import { northWestRoutes } from './north-west'
import { northernCapeRoutes } from './northern-cape'
import { westernCapeRoutes } from './western-cape'

export const routeRegions: RegionFile<RouteSeed>[] = [
  easternCapeRoutes,
  freeStateRoutes,
  gautengRoutes,
  kwazuluNatalRoutes,
  limpopoRoutes,
  mpumalangaRoutes,
  northWestRoutes,
  northernCapeRoutes,
  westernCapeRoutes,
]
