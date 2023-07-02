import { create } from 'zustand'

type TStore = {
  originSvgList: Array<string>,
  setOriginSvgData: Function
}

const useAppStore = create<TStore>((set) => ({
  originSvgList: [] as string[],
  // @ts-ignore
  setOriginSvgData: (data) => set((state) => ({ ...state, originSvgList: data })),
}))

export default useAppStore