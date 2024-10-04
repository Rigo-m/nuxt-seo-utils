import type { Nuxt, NuxtTemplate } from '@nuxt/schema'

type PathsRes = Record<'public' | 'assets', string[]>
export interface PathsTemplateContext {
  nuxt: Nuxt
  options: {
    getPaths: () => Promise<PathsRes>
  }
}

export const headTypeTemplate: NuxtTemplate<PathsTemplateContext> = {
  filename: 'nuxt-seo-utils.d.ts',
  getContents: async ({ options }) => {
    const paths: PathsRes = await options.getPaths()

    let output = '// Generated by nuxt-seo-utils\n'

    output += `
declare module '#app' {
  import { HeadEntry, HeadTag } from '@unhead/schema'

  interface RuntimeNuxtHooks {
    'head:tags': (tag: HeadTag[]) => Promise<void> | void
    'head:entries': (entries: HeadEntry[]) => Promise<void> | void
  }
}

type PublicFiles = ${[...paths.public.map(path => `'/${path}'`), '(string & Record<never, never>)'].join(' | ')}
type AssetFiles = ${[...paths.assets.map(path => `'~/${path}'`), '(string & Record<never, never>)'].join(' | ')}

declare module '@nuxt/schema' {
  interface HeadAugmentations {
    link: {
      href: PublicFiles | AssetFiles
    }
    script: {
      src: PublicFiles | AssetFiles
    }
  }
}

// ensures we augment
export {}`
    return output
  },
}
