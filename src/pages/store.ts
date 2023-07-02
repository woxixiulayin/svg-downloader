import { create } from 'zustand'
import { TSVGDATA } from '../content'

type TStore = {
  originSvgList: Array<TSVGDATA>,
  setOriginSvgData: Function
}

const useAppStore = create<TStore>((set) => ({
  originSvgList: [],
  // @ts-ignore
  setOriginSvgData: (data) => set((state) => ({ ...state, originSvgList: data })),
}))

export default useAppStore