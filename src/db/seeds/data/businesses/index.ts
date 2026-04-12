import type { RegionFile, BusinessSeed } from '../../types'
import { bloemfonteinBusinesses } from './bloemfontein'
import { capeTownBusinesses } from './cape-town'
import { durbanBusinesses } from './durban'
import { eastLondonBusinesses } from './east-london'
import { easternCapeOtherBusinesses } from './eastern-cape-other'
import { freeStateOtherBusinesses } from './free-state-other'
import { gautengOtherBusinesses } from './gauteng-other'
import { johannesburgBusinesses } from './johannesburg'
import { kwazuluNatalOtherBusinesses } from './kwazulu-natal-other'
import { portElizabethBusinesses } from './port-elizabeth'
import { pretoriaBusinesses } from './pretoria'
import { stellenboschBusinesses } from './stellenbosch'
import { westernCapeOtherBusinesses } from './western-cape-other'

export const businessRegions: RegionFile<BusinessSeed>[] = [
  bloemfonteinBusinesses,
  capeTownBusinesses,
  durbanBusinesses,
  eastLondonBusinesses,
  easternCapeOtherBusinesses,
  freeStateOtherBusinesses,
  gautengOtherBusinesses,
  johannesburgBusinesses,
  kwazuluNatalOtherBusinesses,
  portElizabethBusinesses,
  pretoriaBusinesses,
  stellenboschBusinesses,
  westernCapeOtherBusinesses,
]
