import works from '@/data/works.json'

export type WorkType = 'text' | 'visual' | 'video' | 'other' | 'illust' | 'comic' | 'music'

export type Creator = {
  id: string
  name: string
  bilibiliSpace: string
  avatar?: string
}

export type Work = {
  id: string
  title: string
  creatorId: string
  creatorName: string
  bilibiliSpace: string
  avatar?: string
  slot: string
  type: WorkType
  cover: string
  url: string
  bilibiliUrl?: string
  contentFile?: string
  sourceTypeRaw?: string
  dayOffset?: number
  tags?: string[]
  desc?: string
}

const worksData = works as Work[]

const creatorsData: Creator[] = Array.from(
  worksData.reduce((map, w) => {
    const id = String(w.creatorId || '').trim()
    const name = String(w.creatorName || '').trim()
    if (!id || !name) return map

    if (!map.has(id)) {
      map.set(id, {
        id,
        name,
        bilibiliSpace: String(w.bilibiliSpace || '').trim(),
        avatar: String(w.avatar || '').trim() || undefined,
      })
    }
    return map
  }, new Map<string, Creator>()).values(),
)

const creatorMap = new Map<string, Creator>(creatorsData.map(c => [c.id, c]))

export function useSiteData() {
  return {
    creators: creatorsData,
    works: worksData,
    creatorMap,
    getCreator(id: string) {
      return creatorMap.get(id)
    },
    getWork(id: string) {
      return worksData.find(w => w.id === id)
    }
  }
}
