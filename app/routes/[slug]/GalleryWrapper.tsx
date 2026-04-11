'use client'

import ImageGallery from './ImageGallery'

interface RouteImage {
  id: string
  url: string
  thumbUrl: string | null
  mediumUrl: string | null
  altText: string | null
  isPrimary: boolean
  displayOrder: number
}

interface Props {
  images: RouteImage[]
  routeName: string
  heroFallback?: string | null
}

export default function GalleryWrapper({ images, routeName, heroFallback }: Props) {
  return (
    <ImageGallery
      images={images}
      routeName={routeName}
      heroFallback={heroFallback}
    />
  )
}
