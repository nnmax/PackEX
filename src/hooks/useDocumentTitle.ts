import { useEffect } from 'react'

const SUFFIX = ' | PackEX'

/**
 * 设置页面标题的 Hook
 * @param title 页面标题
 * @param suffix 页面标题后缀
 */
export default function useDocumentTitle(title: Document['title'], suffix = SUFFIX) {
  useEffect(() => {
    if (document.title !== title) {
      document.title = title + suffix
    }
  }, [title, suffix])
}
