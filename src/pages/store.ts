import { create } from 'zustand'

const useStore = create((set) => ({
  originSvgList: [] as string[],
  // @ts-ignore
  setOriginSvgData: (data) => set((state) => ({ ...state, originSvgList: data })),
}))

export default useStore